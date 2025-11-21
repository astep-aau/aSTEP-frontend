---
title: Translator Service overview
description: Translator Service documentation
---


## Purpose
The purpose of the translator service is effectively to translate the frontend request into a process the backend can use. The service is responsible for handling communication between the frontend and the backend, and serves as the first point of contact for the request created in the frontend. Dually, the service is also the last contact point for the backend before the data is forwarded to back to the frontend. This is handled in two separate features: CreateProcess feature and GetRoute feature.


## Explanation
The CreateProcess feature contains the initial contact point, via the endpoint "api/processes", which effectively validates the request, maps it to the command, and invokes the method HandleAsync. Everything is encapsulated in a try-catch block, catching and handling any exceptions thrown. GetRoute features works in nearly the same way. Maps the request to a command dto, validates the command and invokes the HandleAsync method and additionally an EmitAsync method.

(Irrelevant logging details will be emitted from the code examples for simplicity).

## Workflow CreateProcess
- ..RootURL../api/processes is called with a POST method and CreateProcessAsync method is invoked. The method is asynchronous and takes the request and a cancellation token as input.
```csharp
// Method signature
[HttpPost]
public async Task<IActionResult> CreateProcessAsync([FromBody] CreateProcessRequest req, CancellationToken ct)
```
- Dependency injections created.
```csharp
private readonly CreateProcessHandler _handler;
private readonly ILogger<CreateProcessEndpoint> _logger;
private static readonly CreateProcessValidator Validator = new();

public CreateProcessEndpoint(CreateProcessHandler handler, ILogger<CreateProcessEndpoint> logger)
{
    _handler = handler;
    _logger = logger;
}
```
- Logging scopes begins and relevant logging is performed.
- The request is mapped to the command and subsequently validated.
```csharp
var command = new CreateProcessCommand(req);
var validation = await Validator.ValidateAsync(command);
```
- The data the frontend sends forward to the backend is of the form:
```csharp
public int Id { get; init; }
public Guid CorrelationId { get; init; } = Guid.Empty;
public string Origin { get; init; } = string.Empty;
public string Destination { get; init; } = string.Empty;
public TimeOnly TimeOfTravel { get; init; } = TimeOnly.MinValue;
public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
public string ModelVersion { get; set; } = string.Empty;
```
- If validation is invalid, a BadRequest is returned and exited.
```csharp
if (!validation.IsValid)
    {
        return BadRequest(new
            {
                errors = validation.Errors.Select(e => e.ErrorMessage),
                correlationId = req.CorrelationId
            });
    }
```
- If validation is valid, the created dependency, _handler, is then used to invoke the method HandleAsync which takes as parameters the validated command and a cancellation token.
```csharp
await _handler.HandleAsync(command, ct);
```
- An Ok response is returned to the frontend, which returns a 200 status code letting the frontend know that the request was successfully received.
- If the operation is cancelled at any point, an OperationCanceledException is thrown and caught by a catch block, returning a status code 499 and stopping the flow. Additionally, if any other exception is thrown during execution, it is caught by the catch block catching all Exceptions and a status code 500 is returned.
```csharp
catch (OperationCanceledException)
    {
        return StatusCode(499, new 
        { 
            message = "Request cancelled", 
            correlationId = req.CorrelationId 
        });
    }
catch (Exception ex)
    {
        return StatusCode(500, new 
        { 
            message = "An error occurred while processing your request",
            correlationId = req.CorrelationId
        });
    }
```


## Workflow GetRoute
- ..RootURL../api/route is called with a GET method and GetRouteAsync method is invoked. The method is asynchronous and takes the correlationId from the query parameter and a cancellation token as input.
```csharp
// Method signature
[HttpGet]
public async Task<IActionResult> GetRouteAsync([FromQuery] Guid correlationId, CancellationToken ct)
```
- Dependencies are created and a command is created based on the correlationId. The command is then validated.
- The differences as opposed to above, is what is returned as an error if validation is invalid. This time the correlationId is used as part of the error creation.
```csharp
if (!validation.IsValid)
    {
        return BadRequest(new
            {
                errors = validation.Errors.Select(e => e.ErrorMessage),
                correlationId = correlationId
            });
    }
```
- Additionally upon valid command, compared to the CreateProcess, the HandleAsync method is invoked and subsequently EmitAsync is invoked to emit an event to the message broker. The HandleAsync method is saved in a variable which will be used to map the values from that HandleAsync returns, to a DTO.
```csharp
var result = await _handler.HandleAsync(command, ct);
await _routeDeliveredEmitter.EmitAsync(result.CorrelationId, ct);
```
- The command looks like the following:
```csharp
public Guid CorrelationId { get; set; }
public string Origin { get; set; } = string.Empty;
public string Destination { get; set; } = string.Empty;
```
- The result values is then mapped to the DTO, which is returned to the frontend with relevant information.
```csharp
var dto = new RouteResultDto
{
    CorrelationId = result.CorrelationId,
    Origin = result.Origin,
    Destination = result.Destination,
    DistanceKm = result.DistanceKm,
    TravelTimeMinutes = result.TravelTimeMinutes,
    Path = result.Path?.Select(p => new RouteCoordinateDto
        {
            Latitude = p.Latitude,
            Longitude = p.Longitude
        }).ToList() ?? new List<RouteCoordinateDto>()
};
return Ok(dto);
```
- As was the case with the CreateProcess, error handling is done using try-catch blocks
```csharp
catch (OperationCanceledException)
{
        return StatusCode(499, new 
        { 
            message = "Request cancelled", 
            correlationId = correlationId 
        });
}
catch (Exception ex)
{
    return StatusCode(500, new
    {
        message = "An error occurred while processing your request",
        correlationId = correlationId
    });
}
```

## Workflow CreateProcessHandler
- Dependency injection is created, specifically the repository to save and retrieve data from the database.
```csharp
private readonly ICreateProcessRepository _repository;
private readonly ILogger<CreateProcessHandler> _logger;
private readonly CreateProcessEmitter _emitter;

public CreateProcessHandler(ICreateProcessRepository repository, 
    ILogger<CreateProcessHandler> logger,
    CreateProcessEmitter emitter)
{
    _repository = repository;
    _logger = logger;
    _emitter = emitter;
}
```
- HandleAsync is an asynchronous Task which takes the command and a cancellation token as input parameters.
```csharp
public virtual async Task HandleAsync(CreateProcessCommand command, CancellationToken ct)
```
- Relevant logging is then performed before creating an entity based on the command. It is used to save the entity in a database via CreateProcessAsync method (which simply saves the entity in the database.), and to emit an event to the RabbitMQ broker.
```csharp
var entity = new CreateProcessRequest
{
    Id = command.Id,
    CorrelationId = command.CorrelationId,
    Origin = command.Origin,
    Destination = command.Destination,
    CreatedAt = command.CreatedAt,
    ModelVersion = command.ModelVersion,
    TimeOfTravel = command.TimeOfTravel
};

await _repository.CreateProcessAsync(entity);
```
- Before emitting the event it has to be created, which is done via the constructor: CreateProcessEvent which is the same structure as the CreateProcess DTO created initially. (For reference, look at the DTO earlier). The method EmitCreateProcessEventAsync is then invoked using the entity and the cancellation token.
```csharp
await _emitter.EmitCreateProcessEventAsync(processEvent, ct);
```
- Everything is once again encapsulated into try-catch blocks for handling errors and exceptions. A catch block handling the specific OperationCanceledException and a general catch block for other exceptions.
```csharp
catch (OperationCanceledException)
{
    throw;
}
catch (Exception ex)
{
    throw;
}
```

## Workflow GetRouteHandler
- Dependency injection is created, specifically the repository to save and retrieve data from the database.
```csharp
private readonly IRouteRepository _repository;
private readonly ILogger<GetRouteHandler> _logger;

public GetRouteHandler(IRouteRepository repository, ILogger<GetRouteHandler> logger)
{
    _repository = repository;
    _logger = logger;
}
```
- HandleAsync is an asynchronous Task which takes the command and a cancellation token as input parameters.
```csharp
public async Task<RouteResult?> HandleAsync(GetRouteCommand command, CancellationToken ct)
```
- Relevant logging is then performed before creating a route variable which is used to store the route which is returned by the method GetRouteAsync (which simply gets the route from the database based on the provided correlationId).
```csharp
var route = await _repository.GetRouteAsync(command.CorrelationId, ct);
```
- Everything is once again encapsulated into try-catch blocks for handling errors and exceptions. A catch block handling the specific OperationCanceledException and a general catch block for other exceptions.
```csharp
catch (OperationCanceledException)
{
    throw;
}
catch (Exception ex)
{
    throw;
}
```
- Additionally, the GetRouteHandler contains another method SaveRouteAsync, which is used by the consumer to produce a message for the RabbitMQ broker. 
- The method signature is as follows.
```csharp
public async Task SaveRouteAsync(RouteResult route, CancellationToken ct)
```
- The route is saved using the injection of the _repository where the logic for the method is placed (It simply saves the route information in the database.)
```csharp
await _repository.SaveRouteAsync(route, ct);
```
- This method also contains try-catch blocks for error and exception handling.
```csharp
catch (OperationCanceledException)
{
    throw;
}
catch (Exception ex)
{
    throw;
}
```

## CreateProcess validation rules
- For the process, it is important that the validation rules is followed. Therefore, the validation rules makes sure that specific information is not empty. The CorrelationId, Origin and Destination must not be empty, and the CreatedAt must be now or in the past. Cannot be in the future.
```csharp
public CreateProcessValidator()
{
    RuleFor(x => x.CorrelationId)
        .NotEmpty().WithMessage("CorrelationId is required");
        
    RuleFor(x => x.Origin)
        .NotEmpty().WithMessage("Origin is required");

    RuleFor(x => x.Destination)
        .NotEmpty().WithMessage("Destination is required");

    RuleFor(x => x.CreatedAt)
        .LessThanOrEqualTo(_ => DateTime.UtcNow)
        .WithMessage("CreatedAt must be in the past or now");
}
```

## GetRoute validation rules
- For the process, it is important that the validation rules is followed. Therefore, the validation rules makes sure that specific information is not empty. In this case the correlationId must not be empty.
```csharp
public GetRouteValidator()
{
    RuleFor(x => x.CorrelationId)
        .NotEmpty()
        .WithMessage("CorrelationId is required.");
}
```

## CreateProcessEmitter 
- The create process emitter was invoked in the handler, to emit that an event to the broker, which will be used by the route estimation service, which will subscribe to the queue that create process emits to. As was seen earlier, the emitter takes as parameters the event created in the handler and the cancellation token. The emitter uses MassTransit to configure the Bus for transfer of the event, and invokes the Publish method through dependency injection on the IBus interface (MassTransit).
```csharp
public virtual async Task EmitCreateProcessEventAsync(CreateProcessEvent processEvent, CancellationToken ct = default)
{
    await _bus.Publish(processEvent, ct);
}
```


## GetRouteEmitter and consumer
- The get route emits the event to the broker, which will be used by the route estimation service, which will subscribe to the queue that get route emits to. As was seen earlier, the emitter takes as parameters the entity created and the cancellation token. The emitter uses MassTransit to configure the Bus for transfer of the event, and invokes the Publish method through dependency injection on the IBus interface (MassTransit).
```csharp
public async Task EmitAsync(Guid correlationId, CancellationToken cancellationToken)
{
    await _bus.Publish(new RouteDeliveredEvent
    {
        CorrelationId = correlationId,
        DeliveredAtUtc = DateTime.UtcNow
    }, cancellationToken);
}
```
- The get route feature additionally has a consumer as it is needed to consume a route created. The producer is what calls the method SaveRouteAsync through dependency injection to the routeHandler, to save the route created.
- An event variable, evt, is created, which is retrieved from the context which is found in the message consumed.
```csharp
var evt = context.Message;
```
- A route variable is then created, mapping the data from the message context into the RouteResult DTO variables.
```csharp
var route = new RouteResult
{
    CorrelationId = evt.CorrelationId,
    Origin = evt.Origin,
    Destination = evt.Destination,
    DistanceKm = evt.DistanceKm,
    TravelTimeMinutes = evt.TravelTimeMinutes,
    Path = evt.Path.Select(p => new RouteCoordinate
    {
        Latitude = p.Latitude,
        Longitude = p.Longitude
    }).ToList()
};
```
- Finally, the SaveRouteAsync method is invoked to save the newly created route to the database.
```csharp
await _routeHandler.SaveRouteAsync(route, context.CancellationToken);
```

## Process Schema
| Column        | Type                    | Constraints      |
|---------------|-------------------------|------------------|
| Id            | integer                 | Primary key      |
| CorrelationId | uuid                    | Not null         |
| Origin        | text                    | Not null         |
| Destination   | text                    | Not null         |
| TimeOfTravel  | time without time zone  | Nullable         |
| CreatedAt     | timestamp with time zone| Not null         |
| ModelVersion  | text                    | Nullable         |

## Route Schema
| Column            | Type               | Constraints      |
|-------------------|--------------------|------------------|
| Id                | integer            | Primary key      |
| CorrelationId     | uuid               | Not null         |
| Origin            | text               | Not null         |
| Destination       | text               | Not null         |
| DistanceKm        | double precision   | Nullable         |
| TravelTimeMinutes | double precision   | Nullable         |
