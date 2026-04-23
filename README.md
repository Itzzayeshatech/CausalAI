# CausalAI — Root Cause & What-If Intelligence Engine

A full-stack AI analytics platform built with React, Tailwind CSS, Node.js, Express, MongoDB, and Python analytics. This system enables dataset upload, root cause discovery, what-if simulation, reporting, and admin controls.

## Architecture

- `frontend/`: React + Vite UI with Tailwind, Recharts, Axios, and React Router.
- `backend/`: Express REST API with JWT auth, Mongoose models, file upload, dataset management, analysis routes, and AI service integration.
- `ai-service/`: Python Flask service with Pandas, NumPy, and scikit-learn for correlation, regression, root cause detection, and scenario simulation.
- `docker-compose.yml`: Local deployment with MongoDB, backend, frontend, and AI service.

## Folder structure

- `backend/`
  - `config/`: DB connection.
  - `controllers/`: API logic.
  - `middleware/`: auth, validation, file upload, rate limiting.
  - `models/`: Mongoose schema definitions.
  - `routes/`: Express routes.
  - `services/`: file parsing and AI HTTP client.
  - `uploads/`: dataset file storage.
  - `logs/`: request and error logging.

- `frontend/`
  - `src/`: React application source.
  - `components/`: shared UI components.
  - `pages/`: dashboard, upload, analysis, and admin views.
  - `services/`: Axios API client.

- `ai-service/`
  - `app.py`: Flask AI endpoint.
  - `requirements.txt`: Python dependencies.

- `sample-data/`: sample dataset CSV.

## Install & run locally

### Backend

1. Open a terminal and run:
```powershell
cd backend
npm install
```
2. Copy `.env.example` to `.env` and update values.
3. Start backend:
```powershell
npm run dev
```

### Frontend

1. Open a terminal and run:
```powershell
cd frontend
npm install
npm run dev
```

### AI Service

1. Open a terminal and run:
```powershell
cd ai-service
python -m pip install -r requirements.txt
python app.py
```

### Docker Compose

Run from repository root:
```powershell
docker-compose up --build
```

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `POST /api/datasets/upload`
- `GET /api/datasets`
- `DELETE /api/datasets/:id`
- `POST /api/analysis/root-cause`
- `POST /api/analysis/what-if`
- `GET /api/analysis/history`
- `GET /api/admin/users`

## Sample dataset

Use `sample-data/sales-sample.csv` for upload and analysis.

## Example API response

### Login

```json
{
  "id": "643d0f4a4ee2b6c3b0d9f221",
  "name": "Data Analyst",
  "email": "analyst@causalai.com",
  "role": "user",
  "token": "eyJhbGciOi..."
}
```

### Root cause analysis result

```json
{
  "dataset": "Sales sample",
  "targetColumn": "Sales",
  "correlation": {
    "Traffic": 0.92,
    "MarketingSpend": 0.88,
    "Price": 0.60,
    "Inventory": 0.42
  },
  "regression": {
    "coefficients": {
      "Price": -120.4,
      "MarketingSpend": 0.90,
      "Inventory": 4.2,
      "Traffic": 0.55
    },
    "intercept": 1800.22,
    "score": 0.87
  },
  "importance": [
    { "feature": "Traffic", "score": 0.92 },
    { "feature": "MarketingSpend", "score": 0.88 }
  ],
  "rootCause": {
    "feature": "Traffic",
    "correlation": 0.92,
    "coefficient": 0.55,
    "score": 0.92,
    "description": "Top impact factor for Sales is Traffic."
  },
  "summary": "Traffic is the strongest factor affecting Sales."
}
```

### What-if simulation result

```json
{
  "dataset": "Sales sample",
  "targetColumn": "Revenue",
  "scenarioName": "Increase marketing spend",
  "simulation": {
    "baseline": 14500.0,
    "scenarios": [
      {
        "variable": "MarketingSpend",
        "deltaPercent": 20.0,
        "predicted": 15500.0
      }
    ]
  },
  "recommendation": "Review the top change variables for impact and adjust strategy accordingly."
}
```

## Testing instructions

### Backend Tests
```powershell
cd backend
npm install
npm test
```

### AI Service Tests
```powershell
cd ai-service
pip install -r requirements.txt
python -m pytest
```

### Frontend Build Test
```powershell
cd frontend
npm install
npm run build
```

### CI/CD
GitHub Actions runs tests on push/PR to main branch.

## Notes

- The backend uses JWT authentication with secure password hashing.
- File uploads are validated for CSV and Excel formats.
- The Python AI service performs statistical analysis and scenario simulation.
- Docker Compose provisions MongoDB and service containers for local development.
