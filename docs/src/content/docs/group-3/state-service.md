---
title: State Service overview
description: State Service documentation
---

## Purpose

The state service orchestrates long-running trip-planning workflows by tracking process state transitions across the platform. It consumes domain events from RabbitMQ, normalises them through a state machine persisted in PostgreSQL, and emits state-change notifications via an outbox pattern. This provides downstream systems and the UI with a consistent, observable view of every process lifecycle.

## Explanation

The service is composed of three event-driven features:
EstimationRequested, RouteEstimationCompleted, and ProcessFinished. Each feature has a background consumer responsible for deserialising queue messages, validating payloads, and delegating to a handler that advances the persisted state machine (`StateMachineService`). Successful transitions enqueue outbox records that a dedicated dispatcher later publishes to the `state.events` exchange. Telemetry is captured through OpenTelemetry metrics, tracing, and Serilog logging to ensure each transition is observable.

## Workflow EstimationRequested

- Messages arrive on the `estimation-requested` queue and are consumed by the `EstimationRequestedConsumer`, which deserializes the payload and validates it before invoking the handler.

```csharp
public record EstimationRequestedMessage(int Pid, string Start, string End, DateTime TravelTimeUtc, string? CorrelationId);
```

- Dependencies are resolved per message via scoped DI, including the FluentValidation validator and handler.
- Validation failures are logged, metrics are incremented, and the message is ACKed to prevent requeue loops.
- When validation succeeds, the handler maps the message onto state-machine commands. If the incoming `Pid` is `0`, a new process entry is created; otherwise the referenced process is advanced to `TaskState.RouteFinding`.

```csharp
public async Task HandleAsync(EstimationRequestedMessage message, CancellationToken ct = default)
```

- `AdvanceAsync` records the new state, timestamps the update, persists it through EF Core, and emits an outbox message. Concurrency conflicts are logged and treated as soft failures.
- Errors trigger `BasicNack` with `requeue=true`, while durations and outcomes are recorded via `MetricsRegistry`.

## Workflow RouteEstimationCompleted

- The `RouteEstimationCompletedConsumer` listens to the `RouteEstimationCompleted` queue, enforcing QoS and validating each deserialized message before dispatch.

```csharp
public record RouteEstimationCompletedMessage(
    Guid CorrelationId,
    string Origin,
    string Destination,
    double DistanceKm,
    double TravelTimeMinutes,
    IReadOnlyList<RouteCoordinate> Path);
```

- Within the handler, correlation IDs are used to retrieve the process identifier. Missing processes short-circuit with warnings and do not attempt state changes.
- A successful lookup drives two sequential transitions: first to `TaskState.TimeEstimation`, then to `TaskState.ModelLoading`. Each transition uses `AdvanceAsync`, respecting allowed state ordering.

```csharp
var advancedToTime = await _stateMachine.AdvanceAsync(pid.Value, TaskState.TimeEstimation, correlationId, ct);
```

- Rejected transitions (e.g., out-of-sequence events) are logged with `pid` and `correlationId` for diagnostics, while the consumer acknowledges the message to avoid endless retries.

## Workflow ProcessFinished

- The `process-finished` queue feeds the `ProcessFinishedConsumer`, which mirrors the same validation and metric collection approach.
- The handler advances the process to `TaskState.Finished`, which persists a `ProcessLog` entry, removes the live task, and enqueues an outbox message for UI updates.

```csharp
public async Task HandleAsync(ProcessFinishedMessage message, CancellationToken ct = default)
```

- If the final transition is rejected (for example, because the process is already completed), a warning is logged but the message is still acknowledged to maintain idempotency.

## Workflow StateMachineService

- `StateMachineService` encapsulates all persistence logic for process state, backed by `StateDbContext`.
- `CreateAsync` seeds a new `Task` row, storing an optional correlation ID and logging the assigned `Pid`.
- `AdvanceAsync` enforces the allowed transition graph.

```csharp
private static readonly Dictionary<TaskState, TaskState?> AllowedPrevious = new()
{
    { TaskState.New, null },
    { TaskState.RouteFinding, TaskState.New },
    { TaskState.TimeEstimation, TaskState.RouteFinding },
    { TaskState.ModelLoading, TaskState.TimeEstimation },
    { TaskState.UiReturn, TaskState.ModelLoading },
    { TaskState.Finished, TaskState.UiReturn }
};
```

- During an advance, the service updates timestamps, backfills missing correlation IDs, and adds an outbox message through `EnqueueOutbox`. Finishing a process writes to `ProcessLogs` and removes the active task.
- Concurrency exceptions from EF Core are caught and logged, signalling that a competing worker has already progressed the state.
- `GetPidByCorrelationIdAsync` and `GetStateAsync` expose read operations for handlers and diagnostics.

## Outbox Dispatcher workflow

- The `OutboxDispatcher` background service continuously polls the database for unprocessed outbox messages in batches of 50.
- Each record is published to the durable `state.events` fanout exchange; the correlation ID is propagated into RabbitMQ message properties when available.
- Successfully published messages are marked with `ProcessedAt` timestamps. Failures are logged and retried on the next interval without data loss.

```csharp
_channel.BasicPublish(exchange: "state.events", routingKey: string.Empty, basicProperties: props, body: body);
```

- The dispatcher shares the resilient `IRabbitMqConnection` used by the consumers, ensuring consistent topology declarations.

## EstimationRequested validation rules

- Validates non-empty origin/destination, a recent travel time, and bounds the optional correlation ID length.

```csharp
RuleFor(x => x.Start).NotEmpty().MaximumLength(256);
RuleFor(x => x.End).NotEmpty().MaximumLength(256);
RuleFor(x => x.TravelTimeUtc).GreaterThan(DateTime.UtcNow.AddYears(-1));
RuleFor(x => x.CorrelationId).MaximumLength(64);
```

## RouteEstimationCompleted validation rules

- Ensures a non-empty correlation, origin, destination, positive metrics, and a non-null path collection.

```csharp
RuleFor(x => x.CorrelationId).NotEqual(Guid.Empty);
RuleFor(x => x.DistanceKm).GreaterThan(0);
RuleFor(x => x.TravelTimeMinutes).GreaterThan(0);
RuleFor(x => x.Path).NotNull();
```

## ProcessFinished validation rules

- Guarantees a positive `Pid`, a summary capped at 1024 characters, and a bounded optional correlation ID.

```csharp
RuleFor(x => x.Pid).GreaterThan(0);
RuleFor(x => x.ResultSummary).NotEmpty().MaximumLength(1024);
RuleFor(x => x.CorrelationId).MaximumLength(64);
```

## Observability and messaging

- `RabbitMqConnection` maintains a resilient connection, declares exchanges (`state.events`, `dlx.state`), and applies dead-letter handling and TTL per queue.

```csharp
channel.ExchangeDeclare("state.events", ExchangeType.Fanout, durable: true);
channel.QueueDeclare(queue: q, durable: true, exclusive: false, autoDelete: false, arguments: args);
```

- `MetricsRegistry` exposes counters and histograms that each consumer updates, while `ActivitySourceHolder` wraps span creation for OpenTelemetry traces.
- Serilog sinks logs to OTLP with service metadata, and tracing/metrics exporters share configuration with the hosting layer for consistent telemetry delivery.

## Database schema

| Table           | Column            | Type                       | Notes                                  |
|-----------------|-------------------|----------------------------|----------------------------------------|
| Tasks           | Pid               | integer                    | Primary key, auto-increment            |
|                 | CorrelationId     | text                       | Nullable, indexed, max length 64       |
|                 | CurrentState      | text                       | Stores `TaskState` enum as string      |
|                 | CreatedAt         | timestamp with time zone   | Default `now()`                        |
|                 | UpdatedAt         | timestamp with time zone   | Updated on each transition             |
|                 | RowVersion        | bytea                      | RowVersion for optimistic concurrency  |
| ProcessLogs     | LogId             | integer                    | Primary key                            |
|                 | Pid               | integer                    | Foreign key to former task             |
|                 | FinishedAt        | timestamp with time zone   | Completion timestamp                   |
|                 | Status            | text                       | Defaults to `"finished"`               |
|                 | CorrelationId     | text                       | Nullable, max length 64                |
| OutboxMessages  | Id                | bigint                     | Primary key                            |
|                 | OccurredOn        | timestamp with time zone   | Insertion timestamp                    |
|                 | Type              | text                       | Message type (`state.changed`)         |
|                 | Payload           | text                       | JSON payload emitted to RabbitMQ       |
|                 | ProcessedAt       | timestamp with time zone   | Null until dispatched                  |
|                 | CorrelationId     | text                       | Propagated to AMQP message properties  |
