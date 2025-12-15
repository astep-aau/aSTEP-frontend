# Models Directory (Unused)

This directory is **not used** in the current implementation.

## Why it exists

The directory structure was created before the final module organization was determined.

## What happened

During refactoring, it was determined that:
- Each module should own its constants (MODEL_TIME_INTERVALS in `roads/`, MOCK_MODEL_TYPES in `model-types/`, etc.)
- A shared "models" module would create unnecessary coupling
- No functions from `mock-data.ts` corresponded to a "models" export

## Status

- **Exports**: Removed from `/app/group6/services/index.ts`
- **Content**: Empty
- **Can be deleted**: Yes, this directory can be safely removed

## Date

Created: 2025-12-15 (during mock data refactoring)
