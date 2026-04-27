# Mini FAKTRI

Mini FAKTRI is a visual deployment builder for defining multi-service systems, validating hardware/software compatibility, generating YAML deployment configs, and storing draft/built systems for later redeploy.

## Stack

- Frontend: React + TypeScript + Tailwind + Vite
- Backend: Flask + Jinja2 + SQLite
- Tests: Pytest (backend), Playwright (frontend E2E)
- Tooling: ESLint, Ruff
- Runtime: Docker + docker-compose
- Node version: pinned to `22` in `.nvmrc`

## Features

- Drag-and-drop resource and software definitions:
  - Resources: CPU, Memory, Disk, GPU
  - Software categories: OS, DB, Comms, Mapping, Drone control center, VPN, Other defense software
- Backend validation rules:
  - CPU limit (`<= 1`)
  - No mixed storage types
  - Service dependency rules (e.g., `drone_control_center` requires `db`)
- Structured validation errors: `code`, `path`, `message`
- Deterministic YAML generation for valid deployments
- Persist and reload systems from SQLite as `draft` or `built`

## Project Layout

- `frontend` React app and Playwright tests
- `backend` Flask API and validation engine
- `docker-compose.yml` full stack local container orchestration
- `package.json` root command entrypoints for lint/test workflows

## API Endpoints

- `GET /health` - health check
- `POST /api/validate` - validate config payload
- `POST /api/generate-yaml` - validate then return generated YAML
- `POST /api/deployments` - persist deployment as `draft` or `built`
- `GET /api/deployments` - list saved deployments

### Validate Request Example

```json
{
  "name": "mission-alpha",
  "resources": [
    { "id": "r1", "type": "cpu", "count": 1 },
    { "id": "r2", "type": "disk", "storageType": "ssd" }
  ],
  "services": [
    { "id": "s1", "name": "AtlasDB", "category": "db" },
    { "id": "s2", "name": "Falcon Control", "category": "drone_control_center" }
  ]
}
```

### Validation Error Example

```json
{
  "valid": false,
  "errors": [
    {
      "code": "missing_dependency",
      "path": "services",
      "message": "drone_control_center requires db to be included."
    }
  ]
}
```

## Local Development

### Prerequisites

- Node.js 22 (`nvm use`)
- Python 3.11+

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python run.py
```

Backend runs on `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Quality Commands

From repo root:

```bash
npm run lint:frontend
npm run lint:backend
npm run test:backend
npm run test:e2e
npm run check
```

## Playwright E2E

Playwright tests live in `frontend/tests/e2e` and cover:

- Builder page rendering
- Validation error behavior for invalid service relationships
- YAML generation for valid configurations
- Draft save and list display flow

## Docker Deployment

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

SQLite data is persisted to local `./data`.

## Troubleshooting

- **CORS errors**: ensure backend is running and reachable at `http://localhost:8000`.
- **Lint issues**: run `npm run lint:frontend` and `npm run lint:backend` separately for clearer output.
- **E2E failures**: ensure backend is running before `npm run test:e2e`, because frontend actions call backend APIs.
- **Node mismatch**: run `nvm use` to switch to Node 22.
