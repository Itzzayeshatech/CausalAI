# CausalAI System Architecture

## Overview

CausalAI is composed of three main services and persistent storage:

- Frontend: React + Vite + Tailwind UI
- Backend: Node.js + Express REST API
- AI Service: Python Flask analytics engine
- Database: MongoDB

## Architecture Diagram

```
+---------------------+      +----------------------+
|     Frontend        | <--> |     Backend API      | <--> MongoDB
|  React + Tailwind   |      | Express + JWT Auth   |      | Mongoose Models |
+---------------------+      +----------------------+      +----------------+
                                   |
                                   v
                             +------------------+
                             |   AI Service     |
                             | Python Flask API |
                             +------------------+
```

## Data flow

1. User logs in/registers through frontend.
2. Frontend sends auth credentials to backend `/api/auth`.
3. Backend returns JWT and securely stores user profile.
4. User uploads dataset via `/api/datasets/upload`.
5. Backend persists metadata in MongoDB and stores file on disk.
6. For analysis, backend reads dataset, sends rows to AI service.
7. AI service performs correlation/regression and returns results.
8. Backend saves analysis history and returns results to frontend.

## Services

- `frontend/`: UI, routing, charts, forms.
- `backend/`: security, dataset ingestion, API orchestration.
- `ai-service/`: statistical modeling, root cause, simulation.
- `docker-compose.yml`: local multi-container deployment.
