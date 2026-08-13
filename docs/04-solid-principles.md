# SOLID Principles — Evidence Mapping

Every principle below is demonstrated with a **specific file and
mechanism** in this codebase, not just asserted in the abstract.

## S — Single Responsibility Principle

Each class has exactly one reason to change:

| Class | Sole responsibility | File |
|---|---|---|
| `AuthController` | Translate HTTP ⇄ `AuthService` calls | `backend/src/controllers/AuthController.ts` |
| `AuthService` | Registration/login business rules | `backend/src/services/AuthService.ts` |
| `UserRepository` | Persist/query `User` rows | `backend/src/repositories/UserRepository.ts` |
| `validateBody` | Validate a request body against a schema | `backend/src/middlewares/validate.ts` |
| `errorHandler` | Translate a thrown error into an HTTP response | `backend/src/middlewares/errorHandler.ts` |
| `env` (config module) | Read and expose environment configuration | `backend/src/config/env.ts` |

Counter-example we avoided: a "god" `TaskService` that also sent emails
directly. Instead, `TaskService` *delegates* to `NotificationService`
(composition) — each keeps its one job (`backend/src/services/TaskService.ts`,
constructor injecting `NotificationService`).

## O — Open/Closed Principle

**`NotificationFactory` + `INotificationChannel`**
(`backend/src/factories/NotificationFactory.ts`,
`backend/src/interfaces/INotificationChannel.ts`): adding a new delivery
channel (e.g. Slack) means adding a new class implementing
`INotificationChannel` and registering it in the factory's `Map`.
**`NotificationService` requires zero changes.** This is proven by
`tests/unit/NotificationFactory.test.ts`, which asserts the registry
returns the right channel per type without any service-level branching.

**`BaseTypeOrmRepository`** (`backend/src/repositories/BaseTypeOrmRepository.ts`):
new entities get a new repository by *extending* the base class and adding
entity-specific query methods (e.g. `findByEmail` on `UserRepository`) —
the base CRUD implementation is never modified per-entity.

## L — Liskov Substitution Principle

Every concrete repository (`UserRepository`, `TaskRepository`, ...)
implements an `IXxxRepository` interface and is fully substitutable by it.
This is not just a type-checking exercise — it's *exercised* in the test
suite: `tests/fixtures/fakeRepositories.ts` provides in-memory
`FakeUserRepository`, `FakeTaskRepository`, etc., that implement the exact
same interfaces. `AuthService`, `ProjectService`, and `TaskService` are
instantiated with these fakes in unit tests and behave identically to how
they behave with the real TypeORM-backed repositories in integration
tests — proof that the abstraction is genuinely substitutable, not just
nominally typed.

## I — Interface Segregation Principle

`backend/src/interfaces/repositories.ts` splits `IReadRepository<T>` and
`IWriteRepository<T>` as separate, minimal contracts, composed together
only where a repository actually needs both:

```ts
export interface IReadRepository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
}
export interface IWriteRepository<T, ID = string> {
  create(data: Partial<T>): Promise<T>;
  update(id: ID, data: Partial<T>): Promise<T | null>;
  delete(id: ID): Promise<boolean>;
}
export interface IUserRepository extends IReadRepository<User>, IWriteRepository<User> {
  findByEmail(email: string): Promise<User | null>;
}
```

No repository is forced to implement a method it doesn't need, and no
service is forced to depend on a wider surface than it uses — e.g.
`INotificationChannel` (`interfaces/INotificationChannel.ts`) exposes a
single `deliver()` method, nothing more, so a future read-only reporting
channel wouldn't need to fake a `deliver()` it can't support.

## D — Dependency Inversion Principle

This is the architecture's organizing principle, not an afterthought.
High-level modules (services) depend on abstractions
(`interfaces/repositories.ts`), and low-level modules (TypeORM
repositories) implement those abstractions:

```ts
// AuthService depends on the ABSTRACTION, never on TypeORM directly.
export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}
  ...
}
```

`backend/src/container.ts` is the single **Composition Root** where
concrete classes are wired into these abstractions — the only file in the
codebase that imports both an interface and its implementation together.
Every other file imports interfaces, not implementations.

**Direct evidence this isn't theoretical:** the entire unit test suite
(`tests/unit/*.test.ts`) instantiates services with fake, in-memory
repositories instead of a real database, and every test still passes —
which is only possible because services never reach past the interface to
a concrete TypeORM class.

## Summary table

| Principle | Primary evidence | Test proving it |
|---|---|---|
| SRP | Controller/Service/Repository split, one class per concern | All unit tests (each test file targets exactly one class) |
| OCP | `NotificationFactory` + channel interface | `NotificationFactory.test.ts` |
| LSP | Fakes substitute real repositories with identical behavior | Entire `tests/unit/` suite runs against fakes |
| ISP | Split `IReadRepository`/`IWriteRepository` | Type-checked at compile time across all repositories |
| DIP | Services depend on interfaces; `container.ts` wires concretions | Unit tests never touch a database |
