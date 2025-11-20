---
title: Training Service overview
description: Training Service documentation
---

## Purpose
Training Service trains the LSTM model and publices weights.


## Explanation
...


## Inputs
- Map matched data containing nodes, latitude and longtitude
- Learning rates etc.

## Outputs
- Updated weights (The model itself basically)
- Traning graph picture

## Workflow
- Prepare features
- Run training job
- Log results and save the model

```python
# Example of code snippet for the documentation page
def train(batch):
    loss = model.update(batch)
    logger.info("loss=%s", loss)
```


| Parameter     | Value | Description                |
|---------------|-------|----------------------------|
| Epocs         |21     | Number of runs             |
| Leaning Rate  |0.001  | Step size for learning rate|


