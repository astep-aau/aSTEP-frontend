---
title: Pathfinding Documentation
description: Comprehensive documentation for the A* time-dependent pathfinding algorithm
---

# Pathfinding Documentation

The pathfinding system uses a time-dependent A* algorithm to find optimal routes through the Harbin road network while accounting for predicted traffic conditions. This document provides a comprehensive overview of the implementation, algorithm details, and integration with the LSTM prediction model.

## Overview

**Algorithm:** A* (A-Star) with time-dependent edge weights

**Language:** Zig

**Location:** `elessar/src/astar.zig`

**Purpose:** Find the fastest route between two nodes considering time-varying travel times predicted by the LSTM model

**Input:** Start node, goal node, lookup table of predicted travel times

**Output:** Journey with ordered list of nodes and estimated total travel time

## A* Algorithm Fundamentals

### What is A*?

A* is a graph search algorithm that finds the shortest path from a start node to a goal node. It's optimal (finds the shortest path) and complete (always finds a path if one exists).

**Key Properties:**
- **Informed search:** Uses a heuristic to guide exploration
- **Optimal:** Guarantees shortest path when using an admissible heuristic
- **Efficient:** Explores fewer nodes than uninformed search algorithms like Dijkstra

### Core Concept

A* maintains a priority queue of nodes to explore, ordered by:

```
f(n) = g(n) + h(n)
```

Where:
- **g(n):** Actual cost from start to node n (travel time so far)
- **h(n):** Heuristic estimated cost from node n to goal (straight-line distance ÷ speed)
- **f(n):** Total estimated cost through node n

The algorithm always explores the node with the lowest f(n) value, making it efficient and optimal.

## Graph Representation

### Data Structures

**Node Structure:**

```zig
pub const Node = struct {
    id: u64,        // Unique node identifier
    lat: f64,       // Latitude (degrees)
    lon: f64,       // Longitude (degrees)
};
```

**Edge Structure:**

```zig
pub const Edge = struct {
    edge_id: u64,   // Unique edge identifier
    to: u64,        // Destination node ID
    time: f32,      // Base travel time (seconds, fallback if no prediction)
};
```

**Graph Structure:**

```zig
pub const Graph = struct {
    nodes: []Node,                              // Array of all nodes
    adj: [][]Edge,                              // Adjacency list (edges per node)
    id_to_index: AutoHashMap(u64, usize),      // Map node ID to array index
};
```

### Graph Initialization

The graph is constructed from two CSV files:

1. **vertices.csv**: Node coordinates
   ```csv
   node_id,longitude,latitude
   0,126.636858,45.755536
   1,126.638456,45.756123
   ...
   ```

2. **edge_connections.csv**: Edge definitions
   ```csv
   edge_id,vertex_start_id,vertex_end_id
   0,0,1
   1,1,2
   ...
   ```

**Construction Process:**

```zig
pub fn init(alloc: Allocator, nodes: []Node, edges: []EdgeInit) !Graph {
    // 1. Create mapping from node ID to array index
    var id_to_index = AutoHashMap(u64, usize).init(alloc);
    for (nodes, 0..) |node, i| {
        try id_to_index.put(node.id, i);
    }

    // 2. Allocate adjacency list
    const adj = try alloc.alloc([]Edge, nodes.len);

    // 3. Count outgoing edges per node
    var counts = try alloc.alloc(usize, nodes.len);
    for (edges) |e| {
        const from_idx = id_to_index.get(e.from) orelse continue;
        counts[from_idx] += 1;
    }

    // 4. Allocate edge arrays
    for (adj, counts) |*list, count| {
        list.* = try alloc.alloc(Edge, count);
    }

    // 5. Fill adjacency lists
    @memset(counts, 0);
    for (edges) |e| {
        const from_idx = id_to_index.get(e.from) orelse continue;
        adj[from_idx][counts[from_idx]] = e.edge;
        counts[from_idx] += 1;
    }

    return .{ .nodes = nodes, .adj = adj, .id_to_index = id_to_index };
}
```

**Result:** Efficient adjacency list representation with O(1) node lookup by ID.

## Time-Dependent Routing

### The Problem

Traditional routing algorithms assume static edge weights, but real-world travel times vary by:
- **Time of day:** Rush hour vs. off-peak
- **Day of week:** Weekday vs. weekend patterns
- **Special events:** Accidents, construction, etc.

### The Solution

Our A* implementation uses **time-dependent edge weights** from the LSTM model's lookup table.

### Lookup Table Structure

```zig
pub const Query = struct {
    edge_id: u64,       // Which edge
    time_offset: u64,   // When (in 5-minute intervals from reference time)
};

// Lookup table maps (edge_id, time_offset) → predicted_travel_time
var lookup_table: AutoHashMap(Query, f32)
```

**Example:**

```
Query { edge_id: 5, time_offset: 0 } → 32.5 seconds  (now)
Query { edge_id: 5, time_offset: 1 } → 33.2 seconds  (+5 minutes)
Query { edge_id: 5, time_offset: 6 } → 45.8 seconds  (+30 minutes)
```

### Time Offset Calculation

As we traverse the graph, we track accumulated travel time:

```zig
// Calculate time_offset index using integer division
const current_time_offset: u64 = @intFromFloat(currentG / timestep_seconds);
```

Where:
- `currentG`: Total travel time from start to current node (seconds)
- `timestep_seconds`: Duration of each time step (300 seconds = 5 minutes)
- `current_time_offset`: Index into lookup table (0, 1, 2, ...)

**Example:**
- After 0 seconds: time_offset = 0
- After 310 seconds: time_offset = 1 (310 ÷ 300 = 1)
- After 920 seconds: time_offset = 3 (920 ÷ 300 = 3)

### Edge Weight Retrieval

For each edge during search:

```zig
// Query the lookup table for the edge travel time
const query = Query{ .edge_id = edge.edge_id, .time_offset = current_time_offset };
const travel_time = lookup_table.get(query) orelse edge.time;  // Fallback to base time
```

This ensures we use the **most accurate prediction** based on when we'll traverse the edge.

## Heuristic Function

### Haversine Distance

A* requires a heuristic h(n) that estimates the cost from node n to the goal. We use the **Haversine formula** to calculate great-circle distance between two GPS coordinates.

```zig
fn haversine(lat1: f64, lon1: f64, lat2: f64, lon2: f64) f64 {
    const R = 6371000.0;  // Earth radius in meters
    const phi1 = lat1 * std.math.pi / 180.0;
    const phi2 = lat2 * std.math.pi / 180.0;
    const dphi = (lat2 - lat1) * std.math.pi / 180.0;
    const dlam = (lon2 - lon1) * std.math.pi / 180.0;

    const a = @sin(dphi / 2.0) * @sin(dphi / 2.0) +
        @cos(phi1) * @cos(phi2) * @sin(dlam / 2.0) * @sin(dlam / 2.0);
    const c = 2.0 * std.math.atan2(@sqrt(a), @sqrt(1.0 - a));

    return R * c;  // Distance in meters
}
```

### Converting Distance to Time

The heuristic divides distance by an assumed speed:

```zig
const h = haversine(neighbor_node.lat, neighbor_node.lon, goal.lat, goal.lon) / 30.0;
```

**Assumptions:**
- Assumed travel speed: 30 m/s ≈ 108 km/h ≈ 67 mph
- This speed is optimistic (faster than typical traffic)
- Ensures the heuristic is **admissible** (never overestimates)

### Why Admissibility Matters

An admissible heuristic guarantees:
- A* finds the optimal path
- h(n) ≤ actual cost from n to goal

If h(n) overestimates, A* might miss the optimal path. Our heuristic uses high speed (30 m/s), so it underestimates travel time, maintaining admissibility.

## A* Algorithm Implementation

### Main Function Signature

```zig
pub fn aStar(
    alloc: std.mem.Allocator,
    graph: Graph,
    start_id: u64,
    goal_id: u64,
    lookup_table: *const std.AutoHashMap(Query, f32),
    timestep_seconds: f64,
) !Journey
```

**Parameters:**
- `alloc`: Memory allocator
- `graph`: Road network graph
- `start_id`: Starting node ID
- `goal_id`: Destination node ID
- `lookup_table`: LSTM predictions for edge weights
- `timestep_seconds`: Time per step (300 seconds = 5 minutes)

**Returns:**
- `Journey`: List of node IDs and total estimated travel time

### Core Data Structures

```zig
const SearchNode = struct {
    id: u64,            // Node identifier
    f: f64,             // f(n) = g(n) + h(n)
    time_offset: f64,   // Accumulated time (for tracking)
};

pub const Journey = struct {
    stops: []u64,                               // Ordered list of node IDs
    estimated_traversal_time_seconds: usize,    // Total travel time
};
```

### Algorithm Initialization

```zig
// Priority queue (min-heap) ordered by f(n)
var open = std.PriorityQueue(SearchNode, void, lessThan).init(alloc, {});

// Track which nodes are in the open set (for O(1) lookup)
var openSet = std.AutoHashMap(u64, void).init(alloc);

// Track path: maps each node to its predecessor
var cameFrom = std.AutoHashMap(u64, u64).init(alloc);

// g-scores: actual cost from start to each node
var gScore = std.AutoHashMap(u64, f64).init(alloc);

// Initialize start node
try gScore.put(start_id, 0.0);
try open.add(SearchNode{ .id = start_id, .f = 0.0, .time_offset = 0.0 });
try openSet.put(start_id, {});
```

### Main Search Loop

```zig
while (open.count() > 0) {
    // 1. Get node with lowest f(n)
    const current = open.remove();
    _ = openSet.remove(current.id);

    // 2. Check if goal reached
    if (current.id == goal_id) {
        // Reconstruct path and return journey
        return reconstructPath(cameFrom, goal_id, gScore.get(goal_id).?);
    }

    // 3. Get current g-score and time offset
    const currentG = gScore.get(current.id).?;
    const current_time_offset: u64 = @intFromFloat(currentG / timestep_seconds);

    // 4. Convert node ID to array index
    const current_idx = graph.id_to_index.get(current.id) orelse return error.NodeNotFound;

    // 5. Explore all neighbors
    for (graph.adj[current_idx]) |edge| {
        const neighbor_id = edge.to;

        // 6. Get time-dependent edge weight
        const query = Query{ .edge_id = edge.edge_id, .time_offset = current_time_offset };
        const travel_time = lookup_table.get(query) orelse edge.time;

        // 7. Calculate tentative g-score
        const tentativeG = currentG + travel_time;
        const existingG = gScore.get(neighbor_id) orelse std.math.floatMax(f64);

        // 8. Update if we found a better path
        if (tentativeG < existingG) {
            try cameFrom.put(neighbor_id, current.id);
            try gScore.put(neighbor_id, tentativeG);

            if (!openSet.contains(neighbor_id)) {
                // 9. Calculate heuristic
                const goal_idx = graph.id_to_index.get(goal_id) orelse return error.NodeNotFound;
                const neighbor_idx = graph.id_to_index.get(neighbor_id) orelse return error.NodeNotFound;

                const goal = graph.nodes[goal_idx];
                const neighbor_node = graph.nodes[neighbor_idx];
                const h = haversine(neighbor_node.lat, neighbor_node.lon, goal.lat, goal.lon) / 30.0;

                // 10. Add to open set
                try open.add(SearchNode{ .id = neighbor_id, .f = tentativeG + h, .time_offset = tentativeG });
                try openSet.put(neighbor_id, {});
            }
        }
    }
}

return error.PathNotFound;
```

### Path Reconstruction

When the goal is reached, reconstruct the path by following `cameFrom` backwards:

```zig
if (current.id == goal_id) {
    var path: std.ArrayList(u64) = .empty;

    // Trace back from goal to start
    var curr = goal_id;
    try path.append(alloc, curr);
    while (cameFrom.get(curr)) |prev| {
        curr = prev;
        try path.append(alloc, curr);
    }

    // Reverse to get start → goal order
    std.mem.reverse(u64, path.items);

    // Calculate total travel time
    const total_time_seconds = gScore.get(goal_id).?;

    return Journey{
        .stops = try path.toOwnedSlice(alloc),
        .estimated_traversal_time_seconds = @intFromFloat(@round(total_time_seconds)),
    };
}
```

## Coordinate Snapping

### Problem

Users click arbitrary coordinates on the map, but:
- Nodes exist only at specific locations (road intersections)
- Pathfinding requires exact node IDs
- User coordinates must be mapped to the nearest node

### Solution: `findClosestNode`

**Location:** `elessar/src/adjust_node.zig`

```zig
pub fn findClosestNode(
    allocator: std.mem.Allocator,
    target_lon: f64,
    target_lat: f64,
) !u64 {
    // 1. Load all vertices from CSV
    var file = try std.fs.cwd().openFile("data/vertex.csv", .{ .mode = .read_only });
    defer file.close();

    var vertices = try parseVertexCsv(allocator, file);
    defer vertices.deinit(allocator);

    if (vertices.items.len == 0) return error.NoVertices;

    // 2. Find nearest node using Euclidean distance
    var closest_id: u64 = vertices.items[0].id;
    var closest_dist_sq: f64 = std.math.inf(f64);

    for (vertices.items) |vertex| {
        const dx = vertex.lon - target_lon;
        const dy = vertex.lat - target_lat;
        const dist_sq = dx * dx + dy * dy;

        if (dist_sq < closest_dist_sq) {
            closest_dist_sq = dist_sq;
            closest_id = vertex.id;
        }
    }

    return closest_id;
}
```

**Distance Metric:** Euclidean distance (approximation for small areas)

```
distance² = (lon₁ - lon₂)² + (lat₁ - lat₂)²
```

**Why not Haversine?**
- Euclidean is faster (no trigonometric functions)
- Accurate enough for finding nearest node within Harbin
- We only need relative distances, not absolute

### Integration with API

From `endpoints.zig`:

```zig
// User provides arbitrary coordinates
const startNodeId = try adjustNode.findClosestNode(
    allocator,
    parsedBody.start_coordinate.lon,
    parsedBody.start_coordinate.lat
);

const endNodeId = try adjustNode.findClosestNode(
    allocator,
    parsedBody.end_coordinate.lon,
    parsedBody.end_coordinate.lat
);

// Now run A* with snapped node IDs
const journey = try aStar(alloc, graph, startNodeId, endNodeId, &lookup_table, timestep_seconds);
```

**Result:** Any user click maps to a valid graph node, ensuring pathfinding always succeeds (if a path exists).

## Algorithm Walkthrough Example

### Scenario

**Start:** Node 0 (45.755536, 126.636858)
**Goal:** Node 4 (45.684, 126.585)
**Time:** 08:00 (morning rush hour)

### Step-by-Step Execution

**Initialization:**
```
gScore[0] = 0.0
open = [(id:0, f:0.0, time_offset:0.0)]
openSet = {0}
cameFrom = {}
```

**Iteration 1:**
```
current = Node 0 (f=0.0)
currentG = 0.0
time_offset = 0 (0 ÷ 300 = 0)

Neighbors: [Node 1]
  Edge 0→1:
    travel_time = lookup[(edge:0, offset:0)] = 35.0 seconds
    tentativeG = 0.0 + 35.0 = 35.0
    h = haversine(Node1, Goal) / 30.0 = 450.0
    f = 35.0 + 450.0 = 485.0

    Add to open: (id:1, f:485.0)
    cameFrom[1] = 0
    gScore[1] = 35.0
```

**Iteration 2:**
```
current = Node 1 (f=485.0)
currentG = 35.0
time_offset = 0 (35 ÷ 300 = 0)

Neighbors: [Node 2, Node 3]
  Edge 1→2:
    travel_time = lookup[(edge:1, offset:0)] = 50.0 seconds
    tentativeG = 35.0 + 50.0 = 85.0
    h = 380.0
    f = 465.0
    Add to open: (id:2, f:465.0)

  Edge 1→3:
    travel_time = lookup[(edge:4, offset:0)] = 90.0 seconds
    tentativeG = 35.0 + 90.0 = 125.0
    h = 200.0
    f = 325.0
    Add to open: (id:3, f:325.0)  ← Lower f, explored first
```

**Iteration 3:**
```
current = Node 3 (f=325.0)
currentG = 125.0
time_offset = 0 (125 ÷ 300 = 0)

Neighbors: [Node 4]
  Edge 3→4:
    travel_time = lookup[(edge:3, offset:0)] = 40.0 seconds
    tentativeG = 125.0 + 40.0 = 165.0
    h = 0.0 (at goal)
    f = 165.0
    Add to open: (id:4, f:165.0)
```

**Iteration 4:**
```
current = Node 4 (f=165.0)
current.id == goal_id → GOAL REACHED!

Path reconstruction:
  cameFrom[4] = 3
  cameFrom[3] = 1
  cameFrom[1] = 0

  Path (reversed): [0, 1, 3, 4]
  Total time: 165 seconds

Return Journey{
  stops: [0, 1, 3, 4],
  estimated_traversal_time_seconds: 165
}
```

**Visual:**
```
Start (0) --35s--> (1) --90s--> (3) --40s--> Goal (4)
                    |
                    +--50s--> (2) [not explored - higher f]
```

## Performance Considerations

### Time Complexity

**Worst Case:** O((V + E) log V)
- V = number of vertices
- E = number of edges
- log V from priority queue operations

**Best Case:** O(V log V) when path is direct

**Typical Case:** Much better than worst case due to heuristic guidance

### Space Complexity

**O(V)** for storing:
- Open set (priority queue)
- Closed set tracking
- g-scores
- cameFrom map

### Optimization Techniques

**1. ID-to-Index Mapping:**
```zig
id_to_index: std.AutoHashMap(u64, usize)
```
- O(1) node lookup instead of O(n) linear search
- Critical for large graphs (21,000+ nodes)

**2. Priority Queue:**
```zig
var open = std.PriorityQueue(SearchNode, void, lessThan).init(alloc, {});
```
- Efficient extraction of minimum f(n) node
- O(log V) insertion/removal

**3. Open Set Tracking:**
```zig
var openSet = std.AutoHashMap(u64, void).init(alloc);
```
- O(1) check if node is already in queue
- Avoids duplicate entries

**4. Lookup Table Caching:**
- LSTM predictions pre-computed for 40 future time steps
- O(1) edge weight retrieval during search
- No model inference during pathfinding

### Graph Size: Harbin Dataset

| Metric | Value |
|--------|-------|
| **Vertices** | ~10,000-50,000 nodes |
| **Edges** | ~21,312 edges |
| **Avg Degree** | ~2-4 edges per node |
| **Search Time** | < 100ms typical |

## Integration with Backend

### Complete Request Flow

```zig
// 1. Receive journey request (endpoints.zig)
const parsedBody = std.json.parseFromSliceLeaky(types.JourneyInput, allocator, body, .{});

// 2. Snap coordinates to nearest nodes
const startNodeId = try adjustNode.findClosestNode(allocator,
    parsedBody.start_coordinate.lon, parsedBody.start_coordinate.lat);
const endNodeId = try adjustNode.findClosestNode(allocator,
    parsedBody.end_coordinate.lon, parsedBody.end_coordinate.lat);

// 3. Load graph data
const edge_data_file = try std.fs.cwd().openFile("data/edge_data_day3.csv", .{});
var edge_data = try parseEdgeCsv(allocator, edge_data_file);

const edge_connections_file = try std.fs.cwd().openFile("data/edge_connections.csv", .{});
const edge_connections = try parseEdgeConnectionsCsv(allocator, edge_connections_file);

const vertices_file = try std.fs.cwd().openFile("data/vertex.csv", .{});
var vertices = try parseVertexCsv(allocator, vertices_file);

// 4. Initialize LSTM model
const ort_api = onnx.getOrtAPI();
var ort_env = try onnx.OrtEnv.init(ort_api, .warning, &log_id);
var model = try LSTM.init(allocator, &ort_env, &session_opts, .{
    .model_path = "pytorch-lstm/models/best_model.onnx",
    .batch_size = 1,
    .sequence_length = 24,
    .input_size = 21312,
});

// 5. Generate lookup table with predictions
var lookup_table = try generateLookupTable(allocator, &model, edge_data, csv_offset, 40);

// 6. Build graph
var graph = try astar.Graph.init(allocator, vertices.items, edge_connections);

// 7. Run A* pathfinding
const journey = try astar.aStar(allocator, graph, startNodeId, endNodeId, &lookup_table, 300.0);

// 8. Convert node IDs to coordinates for response
var route_coords = std.ArrayListUnmanaged([2]f32){};
for (journey.stops) |node_id| {
    const node = findNode(vertices, node_id);
    try route_coords.append(allocator, .{ @floatCast(node.lat), @floatCast(node.lon) });
}

// 9. Return journey response
const resp = types.JourneyResponse{
    .linestring = .{ .type = "LineString", .coordinates = route_coords.items },
    .traversalTime = @floatFromInt(journey.estimated_traversal_time_seconds),
    .length = 69,
};
```

## Edge Cases and Error Handling

### Start == Goal

```zig
if (start_id == goal_id) {
    const stops = try alloc.alloc(u64, 1);
    stops[0] = start_id;
    return Journey{
        .stops = stops,
        .estimated_traversal_time_seconds = 0,
    };
}
```

**Behavior:** Return immediately with zero travel time.

### No Path Exists

```zig
while (open.count() > 0) {
    // ... search logic
}

return error.PathNotFound;
```

**Behavior:** If open set is exhausted without finding goal, return error.

**Causes:**
- Disconnected graph components
- Goal node not reachable from start
- Graph data corruption

### Missing Lookup Table Entry

```zig
const travel_time = lookup_table.get(query) orelse edge.time;
```

**Behavior:** Fall back to base edge travel time if prediction unavailable.

**Causes:**
- Time offset beyond prediction horizon (> 40 steps)
- Edge not in training data
- Lookup table generation failure

### Invalid Node IDs

```zig
const current_idx = graph.id_to_index.get(current.id) orelse return error.NodeNotFound;
```

**Behavior:** Return error if node ID doesn't exist in graph.

**Prevention:** `findClosestNode` always returns valid node ID from graph.

## Advantages of Time-Dependent A*

### Compared to Static Routing

| Feature | Static (Dijkstra/A*) | Time-Dependent A* |
|---------|---------------------|-------------------|
| **Edge Weights** | Constant | Varies by arrival time |
| **Accuracy** | Assumes average conditions | Adapts to traffic patterns |
| **Rush Hour** | Same route as off-peak | Different routes for different times |
| **Prediction** | No future awareness | Uses ML predictions |

### Real-World Benefits

**1. Adaptive Routing:**
```
Morning (08:00): Highway route (40 min)
Afternoon (14:00): City route (25 min)  ← Different optimal path!
```

**2. Accurate ETAs:**
- Accounts for time-of-day traffic
- Uses historical patterns learned by LSTM
- Updates as conditions change

**3. Better User Experience:**
- More realistic travel time estimates
- Routes avoid predicted congestion
- Improves trust in system

## Limitations and Future Work

### Current Limitations

**1. Fixed Prediction Horizon:**
- Lookup table limited to 40 time steps (200 minutes)
- Long journeys may exceed prediction window
- Falls back to base edge times beyond horizon

**2. No Re-routing:**
- Path computed once at journey start
- Doesn't adapt to real-time changes
- No dynamic re-optimization

**3. Single Objective:**
- Minimizes travel time only
- Doesn't consider distance, tolls, preferences

**4. No Turn Restrictions:**
- Assumes all turns are legal
- Doesn't model one-way streets
- No time-of-day turn restrictions

### Potential Improvements

**1. Dynamic Re-routing:**
- Recompute path periodically during journey
- Incorporate real-time traffic updates
- Adjust for unexpected delays

**2. Multi-Objective Optimization:**
- Pareto-optimal routes (time vs. distance)
- User preferences (avoid highways, prefer scenic)
- Cost considerations (tolls, fuel)

**3. Bidirectional A*:**
- Search from both start and goal simultaneously
- Faster for long-distance routes
- Reduced node expansions

**4. Contraction Hierarchies:**
- Preprocess graph for faster queries
- Speedup factor of 1000x+ possible
- Trade-off: increased memory, preprocessing time

**5. Alternative Routes:**
- Provide multiple route options
- Diverse paths (not just k-shortest)
- Let user choose based on preferences

## Conclusion

The time-dependent A* pathfinding algorithm is a critical component of the travel time estimation system. By integrating LSTM predictions with classical graph search, it delivers:

- **Optimal routes** considering predicted traffic conditions
- **Accurate travel time estimates** based on historical patterns
- **Efficient search** through the Harbin road network
- **Seamless integration** with frontend and ML model

Key strengths:
- **Time-awareness:** Adapts routes based on when edges will be traversed
- **Heuristic-guided:** Explores only promising paths (not exhaustive)
- **Guaranteed optimal:** Admissible heuristic ensures shortest path
- **Fast:** < 100ms typical search time for city-scale graphs

The algorithm demonstrates how classical computer science (A*) can be enhanced with modern machine learning (LSTM) to solve real-world routing problems more effectively than either approach alone.
