# Installation Guide

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | 20.x or later |
| npm | 10.x or later |
| Docker & Docker Compose | Docker 24+ (only needed for the Docker route) |

## Option A — Docker Compose (recommended, closest to production)

This starts PostgreSQL, the backend API, and the frontend together.

```bash
git clone <repository-url> taskflow
cd taskflow
docker compose -f docker/docker-compose.yml up --build
```

Wait for all three containers to report healthy (the backend waits for
Postgres automatically). Then:

- Frontend: **http://localhost:5173**
- Backend API: **http://localhost:4000** (health check at `/health`)

To seed demo data into the Dockerized Postgres database:

```bash
docker compose -f docker/docker-compose.yml exec backend node -e "
require('dotenv').config();
process.env.DB_TYPE='postgres';
process.env.DB_HOST='db';
require('./dist/utils/seed.js');
"
```

(Or, more simply for local grading, use Option B, which seeds a local
SQLite file with a single command — see below.)

To stop everything: `docker compose -f docker/docker-compose.yml down`
(add `-v` to also delete the database volume).

## Option B — Local development (no Docker)

### 1. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run seed      # creates ./data/taskflow.sqlite with demo accounts
npm run dev        # starts on http://localhost:4000
```

Confirm it's running:

```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"..."}
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** and sign in with a seeded account
(`admin@taskflow.dev` / `Password123!`) or register your own.

## Running the automated test suite

```bash
# Backend — unit + integration tests with coverage
cd backend
npm install
npm test -- --coverage

# Frontend — component tests
cd ../frontend
npm install
npm test
```

## Production build (without Docker)

```bash
# Backend
cd backend
npm run build
npm start          # runs dist/server.js — set NODE_ENV=production and
                    # real DB_* / JWT_SECRET values in your environment first

# Frontend
cd ../frontend
npm run build       # outputs static files to frontend/dist/
npm run preview     # serve the production build locally to sanity-check it
```

Serve `frontend/dist/` from any static host (nginx, S3+CloudFront,
Netlify, Vercel) pointed at your deployed backend's URL via
`VITE_API_BASE_URL` at build time.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `EADDRINUSE` on port 4000 or 5173 | Another process is using the port; stop it or change `PORT`/Vite's `server.port`. |
| Frontend can't reach the API (CORS error) | Ensure `CORS_ORIGIN` in the backend `.env` matches the frontend's actual origin. |
| `npm run seed` fails with "table already exists" | Delete `backend/data/taskflow.sqlite` and re-run — the seed script assumes a fresh database. |
| Docker Compose backend keeps restarting | Run `docker compose -f docker/docker-compose.yml logs backend` — usually a `DB_*` env mismatch with the `db` service. |
| Tests fail locally but not in CI (or vice versa) | Ensure `NODE_ENV=test` is set — `npm test` sets this via `cross-env` already; check you're not overriding it in a shell profile. |
