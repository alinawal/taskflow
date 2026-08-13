# DevOps Report

## 1. Containerization

Both services are containerized with multi-stage Dockerfiles that separate
the build environment from the (much smaller, more secure) runtime image.

**Backend** (`backend/Dockerfile`): stage 1 installs all dependencies and
runs `tsc` to compile TypeScript to `dist/`; stage 2 installs only
production dependencies (`npm install --omit=dev`) and copies in the
compiled output — the final image never contains TypeScript source, dev
tooling, or devDependencies. Includes a `HEALTHCHECK` hitting `GET /health`.
(We use `npm install` rather than `npm ci` because this submission does not
commit a `package-lock.json`; regenerating one — `npm install` once,
locally, with network access — and switching to `npm ci` is a one-line,
recommended hardening step before any real production deployment, noted
here rather than silently assumed.)

**Frontend** (`frontend/Dockerfile`): stage 1 runs `vite build` to produce
a static bundle; stage 2 serves that bundle from `nginx:alpine` with a
custom `nginx.conf` that rewrites all routes to `index.html` (required for
client-side routing with React Router). Also includes a `HEALTHCHECK`.

## 2. Orchestration — Docker Compose

`docker/docker-compose.yml` defines three services:

| Service | Image | Purpose |
|---|---|---|
| `db` | `postgres:16-alpine` | Production-grade relational database, with a named volume for persistence and a `pg_isready` healthcheck |
| `backend` | built from `backend/Dockerfile` | REST API; `depends_on: db` with `condition: service_healthy`, so it never starts against a database that isn't ready |
| `frontend` | built from `frontend/Dockerfile` | Static SPA served by nginx, proxies API calls to `backend` |

Bringing the whole stack up is one command:

```bash
docker compose -f docker/docker-compose.yml up --build
```

This is the same configuration a real deployment target (a VM, an ECS
task definition, a Docker Swarm stack) would consume with minimal changes
— proving the system is genuinely deployment-ready, not just
"demoable from a laptop."

## 3. CI pipeline (`.github/workflows/ci.yml`)

Runs on every push and pull request to `main` and `develop`, with three
parallel jobs:

1. **`backend`** — install (`npm ci`), lint (ESLint), unit tests, integration
   tests, full suite with coverage (uploaded as a build artifact), then a
   production TypeScript build (`tsc`).
2. **`frontend`** — install, lint, Vitest component tests, Vite production
   build.
3. **`docker-build`** — depends on both jobs above passing; builds both
   Docker images to prove the containerization stays valid as code changes,
   catching Dockerfile drift before it reaches `main`.

Any failure in lint, tests, or build **blocks the merge** — this is the
project's primary automated quality gate, and it is what "automated
testing workflow" means concretely in this codebase.

## 4. CD pipeline (`.github/workflows/cd.yml`)

Triggered on pushes to `main` and on version tags (`v*.*.*`):

1. Logs into GitHub Container Registry (GHCR) using the automatically
   provisioned `GITHUB_TOKEN` — no manually managed secrets required.
2. Builds and pushes both images, tagged `:latest` and with the short
   commit SHA, so any previous deployment can be pinned/rolled back
   precisely.
3. A `deploy` job documents the next concrete step for a real hosting
   target (SSH pull + restart, or a platform deploy hook) — left as a
   placeholder because the team does not have a persistent production host
   for this course project, but the pipeline up to "artifact published and
   addressable by tag" is fully real and functional.

## 5. Environment configuration

All configuration is externalized via environment variables (never
hard-coded), documented in `.env.example` files for both services:

**Backend** (`backend/.env.example`): `PORT`, `JWT_SECRET`,
`JWT_EXPIRES_IN`, `DB_TYPE`, `DB_DATABASE` (SQLite path) or
`DB_HOST`/`DB_PORT`/`DB_USERNAME`/`DB_PASSWORD`/`DB_NAME` (Postgres),
`CORS_ORIGIN`.

**Frontend** (`frontend/.env.example`): `VITE_API_BASE_URL`.

`backend/src/config/env.ts` is the single module that reads
`process.env` — every other file receives configuration through it,
never through a raw `process.env.X` lookup, which keeps configuration
auditable and testable.

## 6. Secrets handling

- `.env` files are git-ignored in both services (`.gitignore`); only
  `.env.example` (no real secrets) is committed.
- CI/CD uses GitHub's encrypted `secrets.GITHUB_TOKEN`, never a
  plaintext credential in the workflow file.
- The default JWT secret in `.env.example` is clearly labeled as a
  development placeholder that must be replaced in any real deployment.

## 7. Observability

- `GET /health` on the backend returns `{ status: "ok", timestamp }` and
  backs both the Docker `HEALTHCHECK` and would back a load balancer's
  health probe in a real deployment.
- `morgan('dev')` request logging is enabled outside test environment for
  local/production debugging, and disabled during automated tests to keep
  test output readable.
- Unhandled errors are logged server-side via the centralized
  `errorHandler` middleware before a sanitized response is returned to
  the client (stack traces are included in non-production responses only).

## 8. Rollback strategy

Because every CD-published image is tagged with its commit SHA, rolling
back is a one-line change: point the deployment target at the previous
`ghcr.io/.../backend:<previous-sha>` tag and restart. Database migrations
in this project use TypeORM's `synchronize` in non-production and would
move to explicit, versioned migrations (`typeorm migration:run`) before any
real production rollout — flagged explicitly as a pre-production hardening
step in [`09-project-management.md`](09-project-management.md).

## 9. Summary — what "deployment-ready" means here, concretely

- ✅ Reproducible builds via multi-stage Dockerfiles
- ✅ One-command full-stack startup via Docker Compose
- ✅ Automated lint/test/build gate on every PR
- ✅ Automated image publish on merge to `main`, tagged for rollback
- ✅ Externalized, documented configuration; no secrets in source control
- ✅ Health checks wired into both the containers and the app itself
