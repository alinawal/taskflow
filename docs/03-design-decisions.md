# Design Decisions

Each entry follows the same shape: the decision, the alternatives we
weighed, and why we chose what we chose. This is deliberately written as an
ADR-style (Architecture Decision Record) log.

## DD-01: Layered architecture with Service Layer + Repository pattern

**Decision:** Split the backend into Controller → Service → Repository
layers, each behind an interface boundary where it matters (Service →
Repository).

**Alternatives considered:**
- *Fat controllers* (business logic directly in route handlers) — rejected;
  it couples HTTP concerns to business rules and makes unit testing
  impossible without spinning up Express.
- *Active Record* (entities with `save()`/`find()` methods calling the ORM
  directly from services) — rejected; it hard-wires business logic to
  TypeORM, defeating swappability and testability.

**Consequence:** Every service is unit-testable with in-memory fakes (see
`tests/fixtures/fakeRepositories.ts`), and the persistence technology can
change without touching business logic.

## DD-02: Manual composition root instead of a DI framework

**Decision:** Wire dependencies by hand in `backend/src/container.ts`
rather than adopting InversifyJS or a decorator-based DI framework.

**Alternatives considered:** InversifyJS/tsyringe — powerful, but add a
learning curve, decorator/reflect-metadata coupling, and a runtime
container the team would need to debug. For a project this size
(5 services, 6 repositories), one hand-written factory function is easier
to read top-to-bottom and just as effective at enforcing Dependency
Inversion.

**Consequence:** `container.ts` is the *only* file that imports both an
interface and its concrete implementation together — a single, auditable
place to verify correct wiring.

## DD-03: SQLite for dev/test, PostgreSQL for Docker/production

**Decision:** `DB_TYPE` env var switches TypeORM's driver; SQLite backs
local development and the entire automated test suite (in-memory,
`:memory:`), PostgreSQL backs the Docker Compose stack.

**Alternatives considered:** Running Postgres everywhere via Docker even in
local dev — rejected for contributor friction (`npm install && npm run dev`
should work with zero external services); using SQLite in production —
rejected, it doesn't handle concurrent writes or match a realistic
production RDBMS.

**Consequence:** Integration tests run in milliseconds with zero setup, and
the production configuration is still proven end-to-end via Docker Compose.

## DD-04: JWT authentication over session cookies

**Decision:** Stateless JWTs signed with a server secret, sent as a Bearer
token.

**Alternatives considered:** Server-side sessions with a session store
(Redis) — adds infrastructure for no real benefit at this scale, and
complicates horizontal scaling more than JWT does.

**Consequence:** The API is trivially stateless and horizontally scalable;
the trade-off (no server-side token revocation before expiry) is accepted
and documented, with a short 1-day expiry limiting the blast radius.

## DD-05: Factory pattern for notification delivery channels

**Decision:** `NotificationFactory` returns `INotificationChannel`
implementations (`InAppNotificationChannel`, `EmailNotificationChannel`);
`NotificationService` never instantiates a concrete channel.

**Alternatives considered:** A single `NotificationService.deliver()`
method with an `if/else` on channel type — rejected because every new
channel (SMS, Slack, push) would require editing that method, violating
Open/Closed.

**Consequence:** Adding a channel is a two-step, additive change: write the
class, register it in the factory. `NotificationService` is untouched —
demonstrated directly in `tests/unit/NotificationFactory.test.ts`.

## DD-06: Zod for request validation (DTO pattern)

**Decision:** Every mutating endpoint validates `req.body` against a Zod
schema in `backend/src/dto/schemas.ts` via a generic `validateBody`
middleware.

**Alternatives considered:** Manual `if` checks inside controllers —
rejected as repetitive, error-prone, and untestable in isolation from HTTP;
class-validator/decorators — workable, but Zod's inferred TypeScript types
(`z.infer<...>`) give us compile-time and run-time validation from one
source of truth with less boilerplate.

**Consequence:** Validation is declarative, colocated, unit-testable on its
own, and its error shape is consistent across every endpoint.

## DD-07: Centralized error handling via a typed `AppError`

**Decision:** Services/controllers `throw AppError.notFound(...)` etc.;
one Express error-handling middleware converts any thrown error into a
consistent JSON shape.

**Alternatives considered:** Per-controller try/catch with manual
`res.status().json()` — rejected as repetitive and inconsistent (easy to
forget a case, easy to leak stack traces in production by accident).

**Consequence:** No controller contains a raw `res.status(...)` error
response; all error responses are uniform and covered by integration tests
asserting exact status codes.

## DD-08: React + Vite + Tailwind over a heavier meta-framework

**Decision:** Plain React SPA with Vite and Tailwind, no Next.js/Remix.

**Alternatives considered:** Next.js — its server-rendering and
file-routing features solve problems TaskFlow doesn't have (no SEO
requirement, single logged-in-user experience); adopting it would add
build complexity for no measurable benefit at this scope.

**Consequence:** A fast dev/build loop, a small, auditable bundle, and a
component structure the whole team could onboard onto in under a day.

## DD-09: Optimistic UI updates for drag-and-drop, with reconciliation

**Decision:** Moving a task between Kanban columns updates local state
immediately, then persists via `PATCH /tasks/:id`; on failure, the board
re-fetches from the server rather than silently leaving stale state.

**Alternatives considered:** Waiting for the server response before
moving the card — rejected, it makes drag-and-drop feel laggy, which is a
core "feel" of the product's UI.

**Consequence:** The UI feels responsive; the explicit failure-reconciliation
path is covered by manual QA in the Testing Report and is a known,
documented limitation (no automatic retry/queueing yet).

## DD-10: Polling instead of WebSockets for notifications

**Decision:** `NotificationBell` polls `GET /notifications` every 15
seconds rather than opening a WebSocket connection.

**Alternatives considered:** Socket.IO for real-time push — genuinely
better UX, but adds a stateful connection layer, a second protocol to
secure and test, and infrastructure (sticky sessions or a pub/sub adapter)
disproportionate to a small-team tool. Documented as a Phase 2 roadmap item
in the Project Management docs.

**Consequence:** Simpler, fully stateless backend; a small (≤15s) latency
on notification delivery, an accepted trade-off for this scope.
