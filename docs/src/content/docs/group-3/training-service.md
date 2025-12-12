# Training Service

A hybrid C#/.NET and Python microservice for training LSTM-based Travel Time Estimation (TTE) models. The service orchestrates ML model training pipelines by generating training datasets from road network data, computing edge vector embeddings, and training neural networks to predict route traversal times.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [C# Backend](#c-backend)
- [Python Backend](#python-backend)
- [Required Data Files](#required-data-files)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Workflow](#workflow)
- [Troubleshooting](#troubleshooting)
- [Performance Considerations](#performance-considerations)

---

## Overview

The Training Service is responsible for:

1. **Route Generation for Training** - Creating random traversable routes from a road network graph to use for training the model
2. **Feature Engineering** - Converting route edges to vector embeddings with temporal encoding
3. **Time Calculation** - Computing ground-truth traversal times from historical data
4. **Model Training** - Training LSTM neural networks on the generated datasets
5. **Model Inference** - Predicting travel times for new routes using trained models

The service uses a two-tier architecture where a C# ASP.NET Core API handles request orchestration, job queuing, and authentication, while a Python FastAPI backend performs the computationally intensive ML operations.

---

## Prerequisites

### .NET (C# Backend)

- **.NET SDK**: 9.0 or later
- **Runtime**: ASP.NET Core 9.0

### Python (Python Backend)

- **Python**: 3.11 or later
- **Package Manager**: pip

---

## C# Backend

The C# backend is an ASP.NET Core 9.0 Web API that handles:

- **Request Handling**: REST API endpoints for training operations
- **Authentication**: API key-based security for protected endpoints
- **Job Queuing**: Thread-safe queue for background training jobs
- **Orchestration**: Coordinates with Python backend for ML operations
- **Status Tracking**: Real-time training progress monitoring

### Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `Swashbuckle.AspNetCore` | 6.6.1 | Swagger/OpenAPI documentation |
| `Microsoft.NET.Test.Sdk` | 18.0.1 | Testing infrastructure |
| `Moq` | 4.20.72 | Mocking framework |
| `xunit` | 2.9.3 | Unit testing framework |

### Key Components

#### TrainingController
Exposes the REST API:
- `GET /Training/status` - Get current training status
- `POST /Training/start-training` - Queue a new training job (requires API key)

#### Service
Orchestrates the training pipeline:
1. Calls Python backend to generate routes
2. Processes routes concurrently (up to 40 parallel tasks)
3. Retrieves edge vectors and calculates traversal times
4. Uploads training set to Python backend
5. Triggers LSTM training

#### TrainingWorker
Background service that:
- Continuously monitors the job queue
- Processes training requests sequentially
- Updates status tracker throughout the process

---

## Python Backend

The Python backend is a FastAPI application that handles:

- **Route Generation**: Random walk on road network graph
- **Vector Embedding**: Edge2Vec using Node2Vec algorithm
- **Time Calculation**: Historical traversal time lookup with fallback
- **Model Training**: LSTM training with PyTorch
- **Inference**: Travel time prediction for routes

### Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `fastapi` | >=0.109.1 | Web framework |
| `uvicorn` | >=0.27.0 | ASGI server |
| `python-multipart` | >=0.0.6 | File upload support |
| `numpy` | >=1.26.0 | Numerical computing |
| `matplotlib` | >=3.8.0 | Training visualization |
| `networkx` | >=3.2.0 | Graph operations |
| `node2vec` | >=0.4.6 | Graph embedding |
| `gensim` | >=4.3.0 | Word2Vec backend |
| `torch` | (CPU) | Deep learning framework |

### Key Components

#### PythonController
FastAPI router exposing:
- `GET /Python/generate-routes/{count}/{min}/{max}` - Generate random routes
- `POST /Python/calculate-route-time` - Calculate traversal time
- `POST /Python/vectors` - Convert edges to vectors
- `POST /Python/train-lstm/{modelName}` - Train LSTM model
- `POST /Python/predict-time/{modelName}` - Predict route time
- `POST /Python/TrainingFile` - Upload training dataset
- `POST /Python/vector-embedding` - Generate edge embeddings

#### LookupTableManager
Thread-safe singleton providing:
- Memory-mapped access to embeddings (`.npy` file)
- Indexed CSV access for traversal times
- Nearest-neighbor fallback for missing edge data

#### LSTMModel
PyTorch neural network:
- LSTM layer for sequence processing
- Feedforward layers (128 → 64 → 32 → 16 → 1)
- Dropout regularization
- Dynamic per-batch padding

---

## Required Data Files

The following data files must be present for the service to function:

### `/Python/Service/Data/LookupTableData/`

| File | Format | Description |
|------|--------|-------------|
| `RoadNetwork.json` | JSON | Road network graph with nodes and edges. Each node contains `outward_edges` and `outward_vertices` arrays. |
| `embeddings.npy` | NumPy | Pre-computed 32-dimensional edge embeddings. Shape: `(num_edges, 32)`. Edge ID is the array index. |
| `traversals.csv` | CSV | Historical edge traversal data. Columns: `edge_id`, `traversal_id` (time bucket 0-287), `time_s`. |

### Data File Formats

#### RoadNetwork.json
```json
{
  "0": {
    "outward_edges": [1, 2, 3],
    "outward_vertices": [10, 20, 30]
  },
  "10": {
    "outward_edges": [4, 5],
    "outward_vertices": [0, 40]
  }
}
```

#### traversals.csv
```csv
edge_id,traversal_id,time_s
0,144,5.2
0,145,5.8
1,144,3.1
```

> **Note**: The `traversal_id` represents 5-minute time buckets (0-287 covering 24 hours). Bucket 0 = 00:00-00:05, Bucket 144 = 12:00-12:05, etc.

---

## Configuration

### appsettings.json

```json
{
  "ApiKey": "your-secret-api-key",
  "PythonBackend": {
    "BaseUrl": "http://127.0.0.1:8000",
    "Endpoints": {
      "GenerateRoutes": "/Python/generate-routes/{numberOfSequences}/{minLength}/{maxLength}",
      "CalculateRouteTime": "/Python/calculate-route-time",
      "Vectors": "/Python/vectors",
      "TrainingFile": "/Python/TrainingFile",
      "TrainLstm": "/Python/train-lstm/{modelName}"
    }
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "TrainingService": "Debug"
    }
  },
  "AllowedHosts": "*"
}
```

### Configuration Options

| Key | Description | Default |
|-----|-------------|---------|
| `ApiKey` | Secret key for authenticated endpoints | Required |
| `PythonBackend:BaseUrl` | Python backend URL | `http://127.0.0.1:8000` |
| `Logging:LogLevel:Default` | Minimum log level | `Information` |

---

## API Reference

### C# Backend Endpoints

#### Get Training Status

```http
GET /Training/status
```

**Response**
```json
{
  "Status": "Idle"
}
```

**Status Values**:
- `Idle` - No training in progress
- `Queued job` - Job added to queue
- `Training in progress` - Worker processing job
- `Creating Routes` - Generating route data
- `Processing sequence X of Y` - Processing individual routes
- `LSTM Training` - Neural network training phase
- `Completed` - Training finished successfully
- `Error: <message>` - Training failed

---

#### Start Training

```http
POST /Training/start-training
Content-Type: application/json
X-API-Key: your-secret-api-key
```

**Request Body**
```json
{
  "modelName": "LSTM 2.0",
  "numberOfRoutes": 1000,
  "minLength": 5,
  "maxLength": 20
}
```

| Field | Type | Description |
|-------|------|-------------|
| `modelName` | string | Name for the trained model (used for saving) |
| `numberOfRoutes` | int | Number of training routes to generate |
| `minLength` | int | Minimum edges per route |
| `maxLength` | int | Maximum edges per route |

**Response (200 OK)**
```json
{
  "Status": "Queued",
  "Message": "Training started in background."
}
```

**Error Responses**
- `400 Bad Request` - Invalid request body
- `401 Unauthorized` - Missing or invalid API key
- `500 Internal Server Error` - Failed to queue request

---

### Python Backend Endpoints

#### Generate Routes

```http
GET /Python/generate-routes/{numberOfSequences}/{minLength}/{maxLength}
```

**Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `numberOfSequences` | int | Number of routes to generate |
| `minLength` | int | Minimum route length |
| `maxLength` | int | Maximum route length |

**Response**
```json
{
  "routes": [
    [1, 5, 12, 8],
    [3, 7, 2, 9, 15]
  ]
}
```

---

#### Calculate Route Time

```http
POST /Python/calculate-route-time?time_bucket=144
Content-Type: application/json
```

**Request Body**
```json
[1, 5, 12, 8]
```

**Query Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `time_bucket` | int | Time bucket (0-287) for time lookup |

**Response**
```json
[3.2, 4.1, 2.8, 5.0]
```

---

#### Get Edge Vectors

```http
POST /Python/vectors?time_bucket=144
Content-Type: application/json
```

**Request Body**
```json
[1, 5, 12, 8]
```

**Response**
```json
[
  [0.12, 0.34, ..., 0.87, 0.5, 0.866],
  [0.23, 0.45, ..., 0.91, 0.5, 0.866]
]
```

> Each vector is 34-dimensional: 32 from Node2Vec embedding + 2 sinusoidal time encoding (sin, cos).

---

#### Train LSTM Model

```http
POST /Python/train-lstm/{modelName}
```

**Parameters**
| Parameter | Type | Description |
|-----------|------|-------------|
| `modelName` | string | Name for the saved model |

**Response**
```json
{
  "status": "LSTM model trained successfully."
}
```

---

#### Predict Time

```http
POST /Python/predict-time/{modelName}
Content-Type: application/json
```

**Request Body**
```json
[
  [0.12, 0.34, ..., 0.5, 0.866],
  [0.23, 0.45, ..., 0.5, 0.866]
]
```

**Response**
```json
{
  "predicted_time": 45.7
}
```

---

#### Upload Training File

```http
POST /Python/TrainingFile
Content-Type: multipart/form-data
```

**Form Data**
| Field | Type | Description |
|-------|------|-------------|
| `file` | file | JSON file containing training data |

**Response**
```json
{
  "status": "ok",
  "file_saved": "/path/to/TrainingSet.json"
}
```

---

#### Generate Vector Embeddings

```http
POST /Python/vector-embedding
```

Regenerates edge embeddings from the road network graph using Node2Vec.

**Response**
```json
{
  "status": "Edge embeddings generated successfully."
}
```

---

## Workflow

### Training Pipeline

```
┌─────────────────┐
│  Client Request │
│  POST /Training │
│  /start-training│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  API Key Auth   │
│  Validation     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  TrainingQueue  │
│  Enqueue Job    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────────────────────────┐
│ TrainingWorker  │────▶│ 1. Generate Routes                  │
│ Dequeue & Run   │     │    GET /Python/generate-routes      │
└─────────────────┘     └────────────────┬────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────────┐
                        │ 2. For each route (40 concurrent):  │
                        │    a. Random time bucket (0-287)    │
                        │    b. Get vectors: POST /vectors    │
                        │    c. Get time: POST /calculate-    │
                        │       route-time                    │
                        └────────────────┬────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────────┐
                        │ 3. Build TrainingSet                │
                        │    { Sequences: [                   │
                        │      { Edges: [[...]], TotalTime }  │
                        │    ]}                               │
                        └────────────────┬────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────────┐
                        │ 4. Upload Training Set              │
                        │    POST /Python/TrainingFile        │
                        └────────────────┬────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────────┐
                        │ 5. Train LSTM Model                 │
                        │    POST /Python/train-lstm          │
                        │    - 70% train / 10% val / 20% test │
                        │    - Outlier smoothing              │
                        │    - Learning rate scheduling       │
                        │    - Generate training plots        │
                        └────────────────┬────────────────────┘
                                         │
                                         ▼
                        ┌─────────────────────────────────────┐
                        │ 6. Save Model Checkpoint            │
                        │    /Data/TrainedModels/{name}/      │
                        │    - {name}.pt (weights)            │
                        │    - training_plots.png             │
                        └─────────────────────────────────────┘
```

### Running the Service

1. **Start Python Backend**
   ```bash
   cd Python
   pip install -r requirements.txt
   uvicorn Controller.PythonController:app --host 0.0.0.0 --port 8000
   ```

2. **Start C# Backend**
   ```bash
   cd C#
   dotnet run
   ```

3. **Trigger Training**
   ```bash
   curl -X POST http://localhost:5000/Training/start-training \
     -H "Content-Type: application/json" \
     -H "X-API-Key: your-secret-api-key" \
     -d '{
       "modelName": "MyModel",
       "numberOfRoutes": 1000,
       "minLength": 5,
       "maxLength": 20
     }'
   ```

4. **Monitor Status**
   ```bash
   curl http://localhost:5000/Training/status
   ```

---

## Troubleshooting

### Common Issues

#### "RoadNetwork.json does not exist"
**Cause**: Missing road network data file.  
**Solution**: Ensure `Python/Service/Data/LookupTableData/RoadNetwork.json` exists and contains valid graph data.

#### "embeddings.npy not found"
**Cause**: Edge embeddings not generated.  
**Solution**: Run the vector embedding endpoint first:
```bash
curl -X POST http://localhost:8000/Python/vector-embedding
```

#### "No traversals for edge X"
**Cause**: Missing historical data for some edges.  
**Solution**: The system uses nearest-neighbor fallback. Check if `traversals.csv` has sufficient coverage.

#### "HTTP error while creating routes"
**Cause**: Python backend not reachable.  
**Solution**:
1. Verify Python backend is running on configured port
2. Check `PythonBackend:BaseUrl` in `appsettings.json`
3. Check firewall/network settings

#### "Training timed out"
**Cause**: LSTM training exceeded 5-hour limit.  
**Solution**:
1. Reduce `numberOfRoutes`
2. Reduce route length range
3. Increase timeout in `Service.cs`

#### "API key is missing"
**Cause**: Protected endpoint called without authentication.  
**Solution**: Include `X-API-Key` header with valid key from `appsettings.json`.

#### "Invalid API key"
**Cause**: Provided key doesn't match configuration.  
**Solution**: Check `ApiKey` value in `appsettings.json`.

### Logging

Enable debug logging for detailed diagnostics:

```json
{
  "Logging": {
    "LogLevel": {
      "TrainingService": "Debug"
    }
  }
}
```

Log prefixes:
- `[C# Controller]` - API layer logs
- `[C# Service]` - Orchestration layer logs
- `Python Controller` - FastAPI logs

---

## Performance Considerations

### Concurrency

- **Route Processing**: Currently 40 concurrent tasks process routes in parallel
- **Semaphore Control**: Prevents resource exhaustion during batch processing
- **Thread-Safe Collections**: `ConcurrentBag` and locks ensure data integrity

### Memory Optimization

- **Memory-Mapped Files**: Embeddings loaded via `numpy.mmap_mode='r'` to reduce RAM usage
- **Dynamic Padding**: LSTM batches padded per-batch rather than global max, saving memory
- **Lazy Loading**: Lookup tables initialized on first access

### Training Optimization

- **Reproducibility**: Random seed (currently 42) for consistent results
- **Outlier Smoothing**: Clips extreme values to 5th-95th percentile bounds (toggleable)
- **Learning Rate Scheduling**: `ReduceLROnPlateau` adapts learning rate during training
- **Early Stopping**: Prevents overfitting on validation loss plateau (changeable patience)

### Recommended Configurations

| Use Case       | Routes  | Min Length | Max Length | Est. Time |
|----------------|---------|------------|------------|-----------|
| Functionality  | 1000    | 5 | 15         | ~1 min    |
| Model Training | 10,000  | 5 | 100        | ~5 min    |
| Production     | 25,000+ | 5 | 100        | ~30+ min  |

### Scaling Tips

1. **Increase Parallelism**: Modify semaphore limit in `Service.cs` (default: 40)
2. **GPU Training**: Install CUDA-enabled PyTorch for faster training
3. **Batch Size**: Adjust in `LSTMTraining.py` based on available memory
4. **Data Sharding**: For very large datasets, consider chunking training data

