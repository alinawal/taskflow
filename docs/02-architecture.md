# Architecture Documentation

## 1. Architectural style

TaskFlow's backend follows a **layered (n-tier) architecture** with an
explicit **MVC** shape for the HTTP boundary, a **Service Layer** for
business logic, and a **Repository Layer** for persistence — each layer
depending only on the abstraction of the layer below it.

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React SPA) — the "View"                          │
│  pages/ → components/ → api/client.ts (typed HTTP client)   │
└───────────────────────────────┬─────────────────────────────┘
                                 │ HTTPS / JSON (REST)
┌───────────────────────────────▼─────────────────────────────┐
│  Express App (backend/src/app.ts)                            │
│  ┌───────────────┐   ┌────────────────┐   ┌────────────────┐│
│  │ Middlewares    │→ │ Controllers     │→ │ Routes          ││
│  │ auth, validate,│   │ (MVC "Controller")│  (Express Router)││
│  │ errorHandler   │   │ HTTP <-> Service │  │                ││
│  └───────────────┘   └────────┬───────┘   └────────────────┘│
└────────────────────────────────┼──────────────────────────────┘
                                  │ calls
┌────────────────────────────────▼──────────────────────────────┐
│  Service Layer (backend/src/services)                          │
│  AuthService, ProjectService, TaskService, CommentService,     │
│  NotificationService — ALL business rules & authorization live │
│  here. Depend only on Repository *interfaces*.                 │
└────────────────────────────────┬──────────────────────────────┘
                                  │ depends on (interfaces)
┌────────────────────────────────▼──────────────────────────────┐
│  Repository Layer (backend/src/repositories)                   │
│  UserRepository, ProjectRepository, TaskRepository, ...        │
│  Implements interfaces from src/interfaces/repositories.ts.    │
│  Only place that talks to TypeORM.                             │
└────────────────────────────────┬──────────────────────────────┘
                                  │
┌────────────────────────────────▼──────────────────────────────┐
│  Database (SQLite in dev/test, PostgreSQL in Docker/prod)      │
└──────────────────────────────────────────────────────────────┘
```

Every arrow above points **downward through an interface**, never a
concrete class from two layers away — see
[`04-solid-principles.md`](04-solid-principles.md) for how this realizes
the Dependency Inversion Principle, and why it made the entire service
layer unit-testable without a database (see
[`05-testing-report.md`](05-testing-report.md)).

## 2. Component diagram (Mermaid)

```mermaid
flowchart TB
    subgraph Frontend
        Pages[Pages: Login, Register, Dashboard, ProjectBoard]
        Components[Components: Navbar, KanbanColumn, TaskCard, TaskModal]
        ApiClient[api/client.ts]
        Pages --> Components
        Pages --> ApiClient
    end

    subgraph Backend
        Routes[Routes]
        Middlewares[Middlewares: auth, validate, errorHandler]
        Controllers[Controllers]
        Services[Services]
        Factories[NotificationFactory]
        Repositories[Repositories]
        Container[container.ts — Composition Root]

        Routes --> Middlewares --> Controllers --> Services
        Services --> Repositories
        Services --> Factories
        Container -.wires.-> Controllers
        Container -.wires.-> Services
        Container -.wires.-> Repositories
    end

    DB[(SQLite / PostgreSQL)]

    ApiClient -- REST/JSON --> Routes
    Repositories --> DB
```

## 3. Entity-relationship diagram

```mermaid
erDiagram
    USER ||--o{ PROJECT_MEMBER : "has memberships"
    PROJECT ||--o{ PROJECT_MEMBER : "has members"
    PROJECT ||--o{ TASK : "contains"
    USER ||--o{ TASK : "is assignee of"
    TASK ||--o{ COMMENT : "has"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ NOTIFICATION : "receives"

    USER {
        uuid id PK
        string email UK
        string passwordHash
        string name
        enum role
    }
    PROJECT {
        uuid id PK
        string name
        string description
        uuid ownerId FK
    }
    PROJECT_MEMBER {
        uuid id PK
        uuid projectId FK
        uuid userId FK
        enum role
    }
    TASK {
        uuid id PK
        string title
        string description
        enum status
        enum priority
        date dueDate
        uuid projectId FK
        uuid assigneeId FK
    }
    COMMENT {
        uuid id PK
        string body
        uuid taskId FK
        uuid authorId FK
    }
    NOTIFICATION {
        uuid id PK
        uuid recipientId FK
        enum type
        string message
        boolean read
    }
```

## 4. Key sequence: assigning a task triggers a notification

```mermaid
sequenceDiagram
    participant U as Owner (browser)
    participant C as TaskController
    participant S as TaskService
    participant TR as TaskRepository
    participant NS as NotificationService
    participant NF as NotificationFactory
    participant NR as NotificationRepository

    U->>C: POST /projects/:id/tasks {assigneeId}
    C->>S: createTask(projectId, ownerId, input)
    S->>S: assertIsMember(projectId, ownerId)
    S->>S: assertIsMember(projectId, assigneeId)
    S->>TR: create(taskData)
    TR-->>S: Task
    S->>NS: notify(assigneeId, TASK_ASSIGNED, message)
    NS->>NR: create(notification)
    NR-->>NS: Notification
    NS->>NF: getDefaultChannels()
    NF-->>NS: [InAppChannel, EmailChannel]
    NS->>NS: deliver() on each channel
    S-->>C: Task
    C-->>U: 201 Created {task}
```

## 5. Folder-to-responsibility map

| Folder | Responsibility | Pattern |
|---|---|---|
| `backend/src/entities` | Persistence-shape of domain objects (TypeORM decorators) | Model (MVC) |
| `backend/src/interfaces` | Contracts services depend on, not concretions | Dependency Inversion |
| `backend/src/repositories` | Data access, one class per aggregate | Repository |
| `backend/src/services` | Business rules, authorization, orchestration | Service Layer |
| `backend/src/factories` | Selects and constructs notification channels | Factory |
| `backend/src/controllers` | Translates HTTP requests to service calls | Controller (MVC) |
| `backend/src/routes` | Express route wiring, one file per resource | — |
| `backend/src/middlewares` | Cross-cutting concerns: auth, validation, errors | — |
| `backend/src/dto` | Zod input-validation schemas | DTO |
| `backend/src/container.ts` | Wires concrete classes into interfaces | Composition Root / DI |
| `frontend/src/pages` | Route-level views | View (MVC) |
| `frontend/src/components` | Reusable, presentational + lightly-stateful UI | — |
| `frontend/src/api/client.ts` | Single point of contact with the backend | Facade |
| `frontend/src/context` | App-wide state (authenticated user) | — |

## 6. Data flow example: loading the Kanban board

1. `ProjectBoardPage` mounts, calls `api.projects.get`, `api.tasks.listForProject`,
   `api.projects.listMembers` in parallel via `Promise.all`.
2. Each call goes through `api/client.ts`'s single `request()` helper,
   which attaches the JWT and normalizes errors into `ApiError`.
3. Express routes authenticate the JWT (`middlewares/auth.ts`), validate
   any body (`middlewares/validate.ts`), then delegate to the relevant
   controller.
4. Controllers call the corresponding service method and return its result
   as JSON — controllers contain **no** business logic.
5. Services enforce authorization (project membership) and call
   repositories for persistence.
6. The rendered board groups tasks client-side by `status` into three
   `KanbanColumn`s; drag-and-drop optimistically updates local state, then
   persists via `PATCH /tasks/:id`, reconciling with a re-fetch on failure.

## 7. Deployment architecture

```mermaid
flowchart LR
    subgraph "Docker Compose network"
        FE["frontend container\n(nginx serving Vite build)"]
        BE["backend container\n(Node.js API)"]
        DB[("db container\nPostgreSQL 16")]
        FE -- "REST /api" --> BE
        BE -- "TypeORM" --> DB
    end
    Browser -- "http://localhost:5173" --> FE
    Browser -- "http://localhost:4000 (dev only)" --> BE
```

See [`06-devops-report.md`](06-devops-report.md) for the full container and
pipeline design.
