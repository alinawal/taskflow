# TaskFlow — Team Task & Project Management System

TaskFlow is a full-stack, production-ready web application that lets small
teams create projects, break work into tasks, assign owners, track status on
a Kanban board, and discuss progress through comments — all with role-based
access control and real-time-style in-app notifications.

Built for **SWE2030XA — Software Engineering Requirements**, this repository
contains the complete system: backend API, frontend client, automated test
suite, Docker/CI-CD configuration, and full project documentation.

## Repository layout

```
taskflow/
├── backend/                 REST API (Node.js + TypeScript + Express + TypeORM)
│   ├── src/
│   │   ├── entities/         Domain models (TypeORM entities)
│   │   ├── interfaces/       Abstractions (Repository & Service contracts) — DIP
│   │   ├── repositories/     Data-access layer — Repository pattern
│   │   ├── services/         Business logic — Service Layer pattern
│   │   ├── controllers/      HTTP request handlers — MVC "Controller"
│   │   ├── routes/           Express route definitions
│   │   ├── middlewares/      Auth, validation, error handling
│   │   ├── factories/        Object-creation logic — Factory pattern
│   │   ├── dto/               Request/response validation schemas
│   │   └── utils/
│   └── tests/
│       ├── unit/              Service-layer unit tests (mocked repositories)
│       └── integration/       End-to-end API tests (Supertest)
├── frontend/                 SPA client (React + TypeScript + Vite + Tailwind)
│   ├── src/
│   │   ├── api/               Typed API client
│   │   ├── components/        Reusable UI components
│   │   ├── pages/              Route-level views — MVC "View"
│   │   ├── context/            App-wide state (Auth)
│   │   └── hooks/
│   └── tests/
├── docs/                     Full documentation set (see docs/README.md)
├── docker/                   Dockerfiles & docker-compose
└── .github/workflows/        CI/CD pipelines
```

## Quick start (Docker — recommended)

```bash
docker compose -f docker/docker-compose.yml up --build
```

- API: http://localhost:4000
- Client: http://localhost:5173
- Default seeded accounts: `admin@taskflow.dev` / `Password123!` (Admin),
  `alice@taskflow.dev` / `Password123!` (Member)

## Quick start (local, no Docker)

```bash
# Backend
cd backend
npm install
npm run seed      # creates SQLite dev DB + demo data
npm run dev        # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev        # http://localhost:5173
```

## Running tests

```bash
cd backend && npm test -- --coverage
cd frontend && npm test
```

## Documentation

Full documentation index: [`docs/README.md`](docs/README.md) — includes the
Project Brief, Architecture, Design Decisions, SOLID mapping, Testing Report,
DevOps Report, Version Control workflow, Team & Project Management
documentation, User Guide, Installation Guide, and Presentation materials
(speaker notes, demo script, Q&A prep, rubric-to-evidence matrix).

## License

MIT — see [LICENSE](LICENSE).
