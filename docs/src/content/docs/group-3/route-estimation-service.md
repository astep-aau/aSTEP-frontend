---
title: Route Estimation Service
description: Route Estimation Service documentation
---

## Purpose

The route estimation service calculates optimal routes between geographic coordinates using road network data. It consumes route-request events from RabbitMQ, performs A* pathfinding on a preprocessed graph persisted in JSON datasets, enriches routes with time estimates, and publishes completed route data back to the message bus. This provides downstream systems with traversable paths, distance calculations, and estimated travel times for multi-modal trip planning.

## Explanation

The service is composed of a single event-driven feature: CreateRoute. The `CreateRouteConsumer` deserializes incoming messages, validates coordinates and travel times through FluentValidation, and delegates to `CreateRouteHandler`. The handler orchestrates three core operations: nearest-node resolution via `NearestNodeFinder`, A* pathfinding through `ShortestRouteFinder`, and time estimation via `EstimateTimeHandler`. Successful routes are published to the `route.made` exchange through `RouteMadeEmitter`. Telemetry is captured via Serilog for observability across the routing pipeline.

## Workflow CreateRoute

- Messages arrive on the `estimation-requested` queue and are consumed by the `CreateRouteConsumer`, which deserializes the payload and validates it before invoking the handler.

```csharp
public record CreateProcessEvent
{
    public int ProcessId { get; init; }
    public Guid CorrelationId { get; init; }
    public string Origin { get; init; }
    public string Destination { get; init; }
    public TimeOnly TimeOfTravel { get; init; }
    public DateTime CreatedAt { get; init; }
    public string ModelVersion { get; init; }
}
```

- Dependencies are resolved per message via scoped DI, including the FluentValidation validator, handler, and event emitter.
- Validation failures are logged with detailed error messages, and the message is ACKed to prevent requeue loops.
- When validation succeeds, the handler maps the message onto routing commands and begins the three-phase processing pipeline.

```csharp
public Result<RouteResult> HandleAsync(ProcessPayload payload)
```

- The handler first resolves nearest road network nodes for both origin and destination coordinates using `NearestNodeFinder.NearestNode`, which searches the in-memory vertex cache within a 1000-meter radius.
- With node IDs obtained, `ShortestRouteFinder.ShortestRoute` executes the A* algorithm against the preprocessed graph to compute the optimal path, returning a `RouteResult` containing node IDs, edge IDs, and distance in kilometers.
- The route is enriched with `EstimateTimeHandler.EstimateTime`, which calls an external Python ML service to calculate travel duration based on edge embeddings and time-of-day patterns.
- Upon successful completion, `RouteMadeEmitter` publishes a `RouteMadeEvent` containing the full route geometry, distance, and estimated time to the `route.made` exchange.

```csharp
var routeMadeEvent = new RouteMadeEvent
{
    Id = payload.ProcessId,
    CorrelationId = payload.CorrelationId,
    Origin = payload.Origin,
    Destination = payload.Destination,
    DistanceKm = route.Value.DistanceKm,
    TravelTimeMinutes = route.Value.EstimatedTimeSeconds,
    Path = route.Value.Path
};
```

- Errors at any stage (node resolution, pathfinding, time estimation, or publishing) return FluentResults failures with descriptive error messages, which are logged and acknowledged to avoid infinite retries.

## CreateRoute validation rules

- Validates non-empty origin and destination coordinates in "lat,lon" format with numeric values, ensures origin and destination differ, validates ProcessId, CreatedAt, ModelVersion, and CorrelationId.

```csharp
RuleFor(x => x.ProcessId)
    .GreaterThan(0)
    .WithMessage("[Validator] ProcessId must be greater than 0");

RuleFor(x => x.CorrelationId)
    .NotEmpty()
    .WithMessage("[Validator] CorrelationId is required");

RuleFor(x => x.Origin)
    .NotEmpty()
    .WithMessage("[Validator] Origin must be specified")
    .Must(BeLatLon)
    .WithMessage("[Validator] Origin must be in 'lat,lon' format with numeric values");

RuleFor(x => x.Destination)
    .NotEmpty()
    .WithMessage("[Validator] Destination must be specified")
    .Must(BeLatLon)
    .WithMessage("[Validator] Destination must be in 'lat,lon' format with numeric values");

RuleFor(x => x.Origin)
    .NotEqual(x => x.Destination)
    .WithMessage("[Validator] Origin and Destination must be different");

RuleFor(x => x.CreatedAt)
    .NotEqual(default(DateTime))
    .WithMessage("[Validator] CreatedAt must be set");

RuleFor(x => x.ModelVersion)
    .NotEmpty()
    .WithMessage("[Validator] ModelVersion must be specified");
```

- The `BeLatLon` validation method parses coordinates on comma delimiters, removes empty entries, trims whitespace, and validates numeric format using `double.TryParse` with invariant culture.

```csharp
private static bool BeLatLon(string? s)
{
    if (string.IsNullOrWhiteSpace(s)) return false;
    
    string[] parts = s.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
    if (parts.Length < 2) return false;
    
    return double.TryParse(parts[0], NumberStyles.Float | NumberStyles.AllowThousands, CultureInfo.InvariantCulture, out _)
        && double.TryParse(parts[1], NumberStyles.Float | NumberStyles.AllowThousands, CultureInfo.InvariantCulture, out _);
}
```

## Workflow NearestNodeFinder

- `NearestNodeFinder` provides static access to the road network vertex dataset, loading `Datasets/vertex.csv` once on first invocation and caching all nodes in memory.
- `NearestNode` accepts latitude and longitude strings, parses them to doubles, and iterates through the cached vertex collection to find the closest node using the Haversine distance formula.

```csharp
public static string NearestNode(string latStr, string lonStr)
```

- The Haversine formula accounts for Earth's curvature, ensuring accurate distance calculations across high-latitude regions where simple Euclidean distance would produce incorrect results.

```csharp
private static double Haversine(double lat1, double lon1, double lat2, double lon2)
{
    const double R = 6371000; // Earth radius in meters
    double dLat = ToRadians(lat2 - lat1);
    double dLon = ToRadians(lon2 - lon1);
    double a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
               Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
               Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
    double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
    return R * c;
}
```

- If no node exists within 1000 meters of the requested coordinates, an exception is thrown to prevent routing with geographically incorrect nodes.
- `TryGetCoordinates` provides the inverse operation, retrieving latitude and longitude for a given node ID from the cached dataset.
- The static `_isLoaded` flag and `_nodeCache` dictionary persist across requests, eliminating redundant file I/O after the initial load.

## Workflow ShortestRouteFinder

- `ShortestRouteFinder` implements the A* pathfinding algorithm against the road network graph, loading `Datasets/vertex_graph.json` and `Datasets/edge_traversals.json` once into static caches.
- `ShortestRoute` accepts origin and destination node IDs, initializes the A* data structures (priority queue, gScore, fScore, cameFrom), and iteratively explores the graph until the destination is reached or all reachable nodes are exhausted.

```csharp
public static Result<RouteResult> ShortestRoute(string originNodeId, string destinationNodeId)
```

- The algorithm uses Haversine distance to the destination as the heuristic, prioritizing exploration of nodes geometrically closer to the goal. This ensures optimal pathfinding performance while guaranteeing the shortest route.
- Edge traversal respects one-way restrictions: outward traversal along an edge is always permitted, but backward traversal is only allowed when `edge.Oneway == false`.

```csharp
// Outward traversal (always allowed)
foreach (int edgeId in currentNode.OutwardEdges)
{
    string neighbor = _edgeCache[edgeId].VertexIdEnd;
    // Process outward edge...
}

// Backward traversal (only if edge is not oneway)
foreach (int edgeId in currentNode.BackwardEdges)
{
    if (_edgeCache[edgeId].Oneway) continue;
    string neighbor = _edgeCache[edgeId].VertexIdStart;
    // Process backward edge...
}
```

- When the destination is reached, the algorithm reconstructs the path by backtracking through the `cameFrom` dictionary, collecting node IDs and edge IDs in reverse order before reversing the lists.
- Distance is calculated by summing the `LengthCm` property of all traversed edges and converting to kilometers (dividing by 100,000).
- If no route exists (invalid nodes, disconnected graph components), an empty `RouteResult` is returned with zero distance and empty collections.

```csharp
return Result.Ok(new RouteResult
{
    RouteId = Guid.NewGuid(),
    NodeIds = nodeIds,
    EdgeIds = edgeIds,
    DistanceKm = totalDistanceKm,
    Path = new List<RouteCoordinate>()
});
```

- Static caches (`_nodeCache`, `_edgeCache`, `_isLoaded`) persist across requests, ensuring graph data is loaded only once during the application lifetime.

## Workflow EstimateTimeHandler

- `EstimateTimeHandler` calculates travel time in seconds by calling an external Python ML service that analyzes edge embeddings and time-of-day patterns.
- `EstimateTime` accepts a `RouteResult` containing edge IDs, serializes them to JSON, and posts the payload to `http://127.0.0.1:8000/Python/vectors`.

```csharp
public Result<RouteResult> EstimateTime(RouteResult route)
```

- The Python service returns time estimates based on historical traffic patterns, road classifications, and machine learning models trained on travel behavior.
- Upon successful response, the handler deserializes the time estimate and populates `RouteResult.EstimatedTimeSeconds` and `RouteResult.DistanceKm`.
- Publishing failures or non-success HTTP responses are wrapped in FluentResults error responses, logged with correlation context, and propagated back to the handler for appropriate error handling.

```csharp
if (!response.IsSuccessStatusCode)
{
    _logger.LogError("[EstimateTimeHandler] Service returned {StatusCode}", response.StatusCode);
    return Result.Fail<RouteResult>($"Time estimation service returned {response.StatusCode}");
}
```

## RouteMadeEvent entity

```csharp
public class RouteMadeEvent
{
    public int Id { get; set; }
    public Guid CorrelationId { get; set; }
    public string Origin { get; set; }
    public string Destination { get; set; }
    public double DistanceKm { get; set; }
    public double TravelTimeMinutes { get; set; }
    public List<RouteCoordinate> Path { get; set; }
}
```
| Property            | Type                    | Notes                                              |
|---------------------|-------------------------|----------------------------------------------------|
| Id                  | int                     | ProcessId from the original routing request        |
| CorrelationId       | Guid                    | Correlation ID for distributed tracing             |
| Origin              | string                  | Origin coordinates in "lat,lon" format            |
| Destination         | string                  | Destination coordinates in "lat,lon" format       |
| DistanceKm         | double                  | Total route distance in kilometers                 |
| TravelTimeMinutes   | double                  | Estimated travel time in minutes                   |
| Path                | List\<RouteCoordinate\> | Lat/lon coordinates for route visualization        |


## Workflow RouteMadeEmitter

- `RouteMadeEmitter` publishes route completion events to the `route.made` exchange, ensuring downstream services and the state machine receive routing results.
- `EmitCreateProcessEventAsync` serializes the `RouteMadeEvent` and publishes it via the resilient `IRabbitMqConnection`, propagating the correlation ID through AMQP message properties.

```csharp
public async Task EmitCreateProcessEventAsync(RouteMadeEvent routeMadeEvent, CancellationToken ct = default)
```

- The implementation uses MassTransit's `IBus` to publish events, automatically handling exchange declarations, message routing, and connection resilience.

```csharp
await _bus.Publish(routeMadeEvent, ct);
```

- Publishing failures are logged with correlation context and may trigger message retries or dead-letter routing depending on the RabbitMQ configuration.

## Observability and messaging

- `RabbitMqConnection` maintains a resilient connection using MassTransit, configures exchanges and queues with durable settings, and applies dead-letter handling and message TTL.

```csharp
x.UsingRabbitMq((ctx, cfg) =>
{
    cfg.Host(host, port, "/", h =>
    {
        h.Username(user);
        h.Password(pass);
    });

    cfg.ReceiveEndpoint("estimation-requested", e => 
    {
        e.ConfigureConsumer<CreateRouteConsumer>(ctx);
    });
});
```

- `CreateRouteConsumer` processes messages from the `estimation-requested` queue with automatic acknowledgment and retry handling through MassTransit.
- Serilog logs all routing operations, including node resolution, pathfinding duration, and publishing outcomes, with structured correlation IDs for distributed tracing.
- Health checks expose the service status through the `/health` endpoint, reporting RabbitMQ connection state and dataset load status.

```csharp
app.MapHealthChecks("/health");
```

## Dataset schema

### vertex.csv

| Column       | Type   | Notes                                    |
|--------------|--------|------------------------------------------|
| NodeId       | string | Unique identifier for road network node  |
| Latitude     | double | WGS84 latitude coordinate                |
| Longitude    | double | WGS84 longitude coordinate               |

### vertex_graph.json

```json
{
  "334304113": {
    "outward_edges": [0],
    "backward_edges": [10733, 13632],
    "outward_vertices": ["6312787191"],
    "backward_vertices": ["6313177605", "8948592141"]
  }
}
```

| Field             | Type       | Notes                                         |
|-------------------|------------|-----------------------------------------------|
| outward_edges      | int[]      | Edge IDs originating from this node           |
| backward_edges   | string[]   | Node IDs at the end of outward edges          |
| outward_vertices     | int[]      | Edge IDs terminating at this node             |
| backward_vertices  | string[]   | Node IDs at the start of backward edges       |

### edge_traversals_lengths.csv

```csv
edge_id,length_cm,oneway
0,64798,True
1,1883,True
2,38595,True
```

| Field        | Type   | Notes                                     |
|--------------|--------|-------------------------------------------|
| edge_id (cm) | double | The ID of a specific edge                 |
| length_cm    | double | Edge length in centimeters                |
| oneway       | bool   | `true` if edge allows only forward travel |

## A* algorithm implementation details

- The A* algorithm guarantees finding the shortest path through the use of:
    - **gScore**: Actual distance from start node to current node (sum of edge lengths)
    - **fScore**: gScore + heuristic (Haversine distance to destination)
    - **Priority Queue**: Nodes explored in order of lowest fScore, ensuring optimal path discovery

```csharp
var openSet = new PriorityQueue<string, double>();
var gScore = new Dictionary<string, double>();
var fScore = new Dictionary<string, double>();
var cameFrom = new Dictionary<string, (string prevNode, int edgeId)>();

gScore[originNodeId] = 0;
fScore[originNodeId] = Haversine(originNode.Lat, originNode.Lon, destinationNode.Lat, destinationNode.Lon);
openSet.Enqueue(originNodeId, fScore[originNodeId]);
```

- The heuristic (straight-line Haversine distance) is admissible and consistent, meaning it never overestimates the remaining distance and satisfies the triangle inequality.
- This ensures A* explores the minimum number of nodes necessary to find the optimal route, making it significantly faster than Dijkstra's algorithm for single-pair, shortest path queries.
- One-way edge enforcement occurs during neighbor exploration: backward traversal is skipped when `edge.Oneway == true`, preventing illegal route segments.

```csharp
// Process backward edges (only if not oneway)
foreach (int backwardEdgeId in currentNodeData.BackwardEdges)
{
    EdgeData edge = _edgeCache[backwardEdgeId];
    if (edge.Oneway) continue; // Skip one-way edges in reverse direction
    
    string neighbor = edge.VertexIdStart;
    double tentativeGScore = gScore[current] + edge.LengthCm / 100000.0;
    
    if (tentativeGScore < gScore.GetValueOrDefault(neighbor, double.MaxValue))
    {
        cameFrom[neighbor] = (current, backwardEdgeId);
        gScore[neighbor] = tentativeGScore;
        fScore[neighbor] = tentativeGScore + Haversine(...);
        openSet.Enqueue(neighbor, fScore[neighbor]);
    }
}
```

## Path NodeId to RouteCoordinate conversion
- `NodeIdToCoordinates` maps each node ID in the computed route to its corresponding latitude and longitude using the cached vertex dataset.
- This produces a list of `RouteCoordinate` objects for route visualization.

```csharp
 public static List<Coordinate> Map(IReadOnlyList<string> nodeIds)
    {
        ArgumentNullException.ThrowIfNull(nodeIds);

        var result = new List<Coordinate>(nodeIds.Count);
        foreach (string id in nodeIds)
        {
            if (!NearestNodeFinder.TryGetCoordinates(id, out double lat, out double lon))
                throw new KeyNotFoundException($"Node ID '{id}' not found in cache.");

            result.Add(new Coordinate { Lat = lat, Lon = lon });
        }
        return result;
    }
```

## RouteResult entity

```csharp
public class RouteResult
{
    public Guid RouteId { get; set; }
    public List<string> NodeIds { get; set; }
    public List<int> EdgeIds { get; set; }
    public double DistanceKm { get; set; }
    public double EstimatedTimeSeconds { get; set; }
    public List<RouteCoordinate> Path { get; set; }
}

public class RouteCoordinate
{
    public double Latitude { get; set; }
    public double Longitude { get; set; }
}
```

| Property              | Type                    | Notes                                              |
|-----------------------|-------------------------|----------------------------------------------------|
| RouteId               | Guid                    | Unique identifier generated per route calculation  |
| NodeIds               | List\<string\>          | Ordered list of node IDs from origin to destination|
| EdgeIds               | List\<int\>             | Ordered list of edge IDs traversed in the route    |
| DistanceKm            | double                  | Total route distance in kilometers                 |
| EstimatedTimeSeconds  | double                  | Estimated travel time from ML service              |
| Path                  | List\<RouteCoordinate\> | Lat/lon coordinates for route visualization        |

## Configuration

### appsettings.json

```json
{
  "RabbitMQ": {
    "Host": "localhost",
    "Port": 5672,
    "Username": "guest",
    "Password": "guest"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console"
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/routeestimation-.txt",
          "rollingInterval": "Day"
        }
      }
    ]
  }
}
```

## Error handling

- Coordinate parsing failures return `Result.Fail("Invalid origin/destination coordinates")` with warning logs containing the invalid input.
- Node resolution failures (no node within 1000m) throw exceptions caught by the handler, which returns `Result.Fail("Failed to determine nearest nodes: {message}")`.
- Pathfinding failures (no route exists) return an empty `RouteResult` with success status, allowing the consumer to distinguish between errors and legitimately unreachable destinations.
- Time estimation HTTP failures return `Result.Fail("Failed to call embedding service: {exception}")` with error logging.
- All failures are acknowledged to RabbitMQ to prevent infinite requeue loops, with detailed error context logged for diagnostics.

## Testing

The service includes comprehensive unit and integration tests:

- **CreateRouteConsumerTests**: 15 tests covering message consumption, validation, handler delegation, and event emission
- **CreateRouteHandlerTests**: 19 tests documenting expected behavior with static helper outputs
- **CreateRouteValidatorTests**: 69 tests covering all validation rules with edge cases
- **NearestNodeFinderTests**: 30 tests covering coordinate parsing, distance calculations, and caching
- **NodeIdToCoordinatesTests**: 10 tests covering node ID lookups, error handling, and edge cases
- **ShortestRouteFinderTests**: 38 tests covering A* pathfinding, one-way edges, and route validation

All tests use the production dataset files and are designed to fail if business logic changes unexpectedly, following test-driven development principles.

