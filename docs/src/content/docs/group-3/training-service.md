---
title: Training Service
description: Training-service workflows and API
---

## 1. Purpose

Create training datasets, obtain edge feature vectors and traversal times, and run LSTM model training for travel-time estimation. The C# side orchestrates the flow and calls a local Python service that performs dataset generation, vector lookup, time calculation and model training.

## 2. Explanation

- Entry point: C# controller / `TrainingService` triggers the end-to-end flow (route generation → time calculation → vector lookup → assemble TrainingSet → train LSTM).
- Python exposes lightweight HTTP endpoints used by C# (FastAPI in `Python/Controller/PythonController.py`).
- Artifacts: `Python/Service/Data/TrainingSet.JSON` and trained models in `Python/Service/Data/TrainedModels/`.

## Workflow - API (C#)

Short intro: the C# API is the orchestration surface. Clients (or a controller) call into `TrainingService` which in turn calls Python endpoints. The main methods are:

- `CreateRoute(int numberOfSequences, int minLength, int maxLength)` — request synthetic routes.
- `CreateTimeForRouteAsync(List<int> edges)` — get per-edge times and sum to a route time.
- `GetEdgeVectors(List<int> edges)` — request numeric vectors for each edge.
- `LstmTraining(string ModelName)` — trigger Python LSTM training using the prepared TrainingSet.

Example (how C# calls the route-generator):

```csharp
string url = $"http://127.0.0.1:8000/Python/generate-routes/{numberOfSequences}/{minLength}/{maxLength}";
var httpResponse = await client.GetAsync(url);
httpResponse.EnsureSuccessStatusCode();
```
```csharp
string url = "http://127.0.0.1:8000/Python/calculate-route-time";
string jsonBody = JsonSerializer.Serialize(edges);
using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
HttpResponseMessage response = await client.PostAsync(url, content);
response.EnsureSuccessStatusCode();
var times = JsonSerializer.Deserialize<List<double>>(await response.Content.ReadAsStringAsync());
return times?.Sum() ?? 0.0;
```
- Input validation: the controller checks parameters and raises HTTP 400 for invalid arguments (e.g. non-positive counts or min > max).
- Missing files: the generator raises `FileNotFoundError` if required dataset files like `RoadNetwork.json` are not present.
- Empty/invalid data: the generator raises `ValueError` if the loaded graph is empty or unusable.
- Controller-level exception handling returns HTTP 500 for unhandled exceptions and forwards the exception message in the response.

Example Python endpoint (FastAPI):

```python
@app.get("/Python/generate-routes/{NumberOfSequences}/{MinLengthOfSequence}/{MaxLengthOfSequence}")
def generateRoutes(NumberOfSequences: int, MinLengthOfSequence: int, MaxLengthOfSequence: int):
    try:
        routes = GenerateRoutes(
            numberOfSequences=NumberOfSequences,
            minLengthOfSequence=MinLengthOfSequence,
            maxLengthOfSequence=MaxLengthOfSequence
        )
        print(routes, file=sys.stderr, flush=True)
        return {"routes": routes}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Workflow - Time Calculation

Intro: Produces per-edge traversal times (labels) for a route which are summed to create the training target (TotalTime).

Called from C#:

- `CreateTimeForRouteAsync(List<int> edges)` POSTs the route (array of edge IDs) to `/Python/calculate-route-time` and sums the returned list of floats.

```csharp
string url = "http://127.0.0.1:8000/Python/calculate-route-time";
string jsonBody = JsonSerializer.Serialize(edges);
using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
HttpResponseMessage response = await client.PostAsync(url, content);
response.EnsureSuccessStatusCode();
var times = JsonSerializer.Deserialize<List<double>>(await response.Content.ReadAsStringAsync());
return times?.Sum() ?? 0.0;
```
```csharp
string url = "http://127.0.0.1:8000/Python/calculate-route-time";
string jsonBody = JsonSerializer.Serialize(edges);
using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
HttpResponseMessage response = await client.PostAsync(url, content);
response.EnsureSuccessStatusCode();
var times = JsonSerializer.Deserialize<List<double>>(await response.Content.ReadAsStringAsync());
return times?.Sum() ?? 0.0;
```

What Python does (general):

- Controller `calculateRouteTime` calls helper `EdgeTraversalTime(route)` (in `Python/Service/DatasetCreation/timeCreation.py`) which looks up traversal durations from e.g. `RoadTraversal.json` or calculates heuristics.
- Returns a list of numeric times (per-edge or per-segment) in a consistent unit (seconds or minutes—agreed between services).

Python error handling:

- Input validation: invalid JSON or an empty route should lead to a 400 response from the controller.
- Data lookup errors: if traversal data is missing the helper should raise an informative exception; controller maps unexpected errors to HTTP 500.
- The C# side uses `EnsureSuccessStatusCode()` and handles exceptions by logging and returning a default (the current implementation returns 0.0 on failure to keep the pipeline moving).

Example Python helper usage (controller):

```python
@app.post("/Python/calculate-route-time")
def calculateRouteTime(route: List[int]):
    return EdgeTraversalTime(route)
```

```python
def EdgeTraversalTime(route):
    import json
    with open('Python/Service/Data/RoadTraversal.json', 'r') as f:
        traversal = json.load(f)
    times = []
    for edge in route:
        key = str(edge)
        if key in traversal and 'duration' in traversal[key]:
            times.append(float(traversal[key]['duration']))
        else:
            times.append(1.0)
    return times
```

---

## Workflow - Vector Embedding

Intro: Maps edge IDs to fixed-dimension numeric vectors used as sequence features for the LSTM.

```csharp
string url = "http://127.0.0.1:8000/Python/vectors";
string jsonBody = JsonSerializer.Serialize(edges);
using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
HttpResponseMessage response = await client.PostAsync(url, content);
response.EnsureSuccessStatusCode();
var vector = JsonSerializer.Deserialize<List<double[]>>(await response.Content.ReadAsStringAsync());
```
- `GetEdgeVectors(List<int> edges)` POSTs the edge ID list to `/Python/vectors` and expects a `List<double[]>` (one vector per edge).

Example call:

```csharp
string url = "http://127.0.0.1:8000/Python/vectors";
string jsonBody = JsonSerializer.Serialize(edges);
using var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");
HttpResponseMessage response = await client.PostAsync(url, content);
response.EnsureSuccessStatusCode();
var vector = JsonSerializer.Deserialize<List<double[]>>(await response.Content.ReadAsStringAsync());
```

What Python does (general):

- `GetEdgeToVectors` (in `Python/Service/DatasetCreation/getEdgeToVectors.py`) looks up precomputed embeddings produced by `Edge2Vec` (see `Python/Service/VectorEmbedding/Edge2Vec.py`).
- Embeddings are persisted (e.g. `edge_embeddings.npy`, `edge2vec_model.model`) and loaded at runtime.
- Returns a list of fixed-length float vectors; the training pipeline expects a consistent vector dimension across all sequences.

Python error handling:

- Unknown edge IDs: the helper may return a default (zero) vector or raise an error — the codebase typically treats missing vectors as a parse error; the controller returns HTTP 500 for unexpected exceptions.
- Serialization errors: malformed requests return HTTP 400 from FastAPI automatically; explicit validation can return 400 for wrong types.

Example Python endpoint (controller):

```python
@app.post("/Python/vectors")
def getEdgeToVectors(edges: List[int]):
    return GetEdgeToVectors(edges)
```

```python
def GetEdgeToVectors(edges):
    import json, numpy as np
    mapping = json.load(open('edge_id_mapping.json'))
    emb = np.load('edge_embeddings.npy')
    out = []
    for e in edges:
        idx = mapping.get(str(e))
        if idx is None:
            out.append([0.0] * int(emb.shape[1]))
        else:
            out.append(emb[int(idx)].tolist())
    return out
```

---

## Workflow - LSTM Training

Intro: Trains an LSTM regression model on the assembled `TrainingSet` (sequences of edge vectors + total travel time) and writes trained weights to disk.

```csharp
string url = $"http://127.0.0.1:8000/Python/train-lstm/{ModelName}";
HttpResponseMessage response = await client.PostAsync(url, null);
response.EnsureSuccessStatusCode();
string responseContent = await response.Content.ReadAsStringAsync();
Console.WriteLine(responseContent);
```
-- `LstmTraining(string ModelName)` POSTs to `/Python/train-lstm/{ModelName}` (no body) and waits for completion. The method writes `TrainingSet.JSON` to `Python/Service/Data/` before calling.

```csharp
string url = $"http://127.0.0.1:8000/Python/train-lstm/{ModelName}";
HttpResponseMessage response = await client.PostAsync(url, null);
response.EnsureSuccessStatusCode();
string responseContent = await response.Content.ReadAsStringAsync();
Console.WriteLine(responseContent);
```

What Python does (general):

- The controller calls `TrainLSTMModel(ModelName)` (in `Python/Service/TrainingModels/LSTMTraining.py`).
- The trainer loads `TrainingSet.JSON`, prepares batches, optionally normalises inputs, builds an LSTM model, and trains to predict total travel time.
- Trained models are saved to `Python/Service/Data/TrainedModels/{ModelName}.pt` (or another configured format).

Python error handling:

- Dataset errors (missing or malformed `TrainingSet.JSON`) raise exceptions mapped to HTTP 500 by the controller.
- Training-time exceptions (OOM, convergence issues) propagate to the controller; the controller returns a 500 and includes the error message.
- Because training is typically long-running, consider running training asynchronously (job queue) in production rather than blocking the HTTP caller.

Controller wrapper example:

```python
@app.post("/Python/train-lstm/{ModelName}")
def trainLSTMModel(ModelName: str):
    TrainLSTMModel(ModelName)
    return {"status": "LSTM model trained successfully."}
```

---

## Workflow - Predict Time

Intro: Exposes model inference to predict travel time for a sequence of edge vectors.

 - If you have edge IDs: first call `/Python/vectors` to get vectors, then call `/Python/predict-time/{ModelName}` with the sequence of vectors.
 - If you already have vectors: POST them to `/Python/predict-time/{ModelName}`.

C# example (pseudo):

```csharp
// 1) Get vectors (if needed)
// 2) POST List<List<double>> vectors to /Python/predict-time/{ModelName}
```

What Python does (general):

- Controller `PredictTime` calls `predict_total_time(edges, ModelName)` (in `Python/Service/TrainingModels/predictTime.py`) which loads the model and runs inference on the provided sequence.
- Returns `{ "predicted_time": <numeric> }` in the same time unit used during training.

Python error handling:

- Missing model file: trainer raises an error (e.g. FileNotFoundError); controller returns HTTP 500.
- Input validation: malformed payloads return HTTP 400 automatically via FastAPI; explicit checks in `predict_total_time` can return clear messages for wrong shapes.

Controller snippet:

```python
@app.post("/Python/predict-time/{ModelName}")
def PredictTime(edges: List[List[float]], ModelName: str):
    return {"predicted_time": predict_total_time(edges, ModelName)}
```

---
