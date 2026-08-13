# Testing Report

## 1. Testing strategy

TaskFlow uses the standard test pyramid:

```
        ▲
       / \        E2E / manual demo walkthrough (docs/10-user-guide.md)
      /---\
     /     \      Integration tests (Supertest + real Express app + in-memory DB)
    /-------\
   /         \    Unit tests (Jest, fake repositories, no I/O)
  /-----------\   Frontend component tests (Vitest + React Testing Library)
```

- **Unit tests** isolate a single service/utility/factory, injecting fake,
  in-memory repositories that implement the same interfaces the real
  TypeORM repositories do (see [`04-solid-principles.md`](04-solid-principles.md)
  for why this is possible — it's a direct consequence of DIP).
- **Integration tests** boot the real Express app (`createApp()`) against a
  fresh in-memory SQLite database per test file, and drive it entirely
  through HTTP via Supertest — no internal function is called directly, so
  these tests exercise routing, middleware, controllers, services, and
  repositories together, exactly as a real client would.
- **Frontend component tests** render real React components with React
  Testing Library, mocking only the network boundary (`api/client.ts`),
  and query the DOM the way a user/screen-reader would (`getByLabelText`,
  `getByRole`), which also doubles as an automated accessibility check.

## 2. Test inventory

### Backend — unit tests (`backend/tests/unit/`)

| File | What it covers |
|---|---|
| `AuthService.test.ts` | Registration (success, duplicate email), password hashing, login (success, wrong password, unknown email) |
| `ProjectService.test.ts` | Project creation auto-adds OWNER membership, membership-based read access, owner-only update/delete, add-member-by-email (success + not-found), owner removal prevention |
| `TaskService.test.ts` | Task creation within a project, rejecting non-members, rejecting out-of-project assignees, assignment notification, status-change notification, 404 on missing task, deletion |
| `NotificationFactory.test.ts` | Correct channel returned per type, unsupported type throws, default channel set is complete |
| `utils.test.ts` | Password hash/compare round-trip and failure case, JWT sign/verify round-trip and tampered-token rejection, Zod schema acceptance/rejection for register and task payloads |

### Backend — integration tests (`backend/tests/integration/`)

| File | What it covers |
|---|---|
| `auth.test.ts` | `POST /register` (success 201, validation 400, duplicate 409), `POST /login` (success 200, wrong password 401), `GET /me` (no token 401, valid token 200, malformed token 401) |
| `projects-tasks.test.ts` | Full workflow: register two users → create project → 403 for non-member → add member → 200 for member → create+assign task → notification created → status update → comment → comment list; plus 403 on non-owner delete, 400 on invalid task payload, 404 on unknown route, 200 on `/health` |

### Frontend — component tests (`frontend/tests/`)

| File | What it covers |
|---|---|
| `LoginPage.test.tsx` | Accessible field labels present, failed login surfaces an alert with the server's error message, registration link points to `/register` |
| `TaskCard.test.tsx` | Renders title/description/due date, renders assignee initials, "No due date" fallback, `onOpen` callback fires with the clicked task |
| `KanbanColumn.test.tsx` | Column label + live task count, empty-state message when a column has no tasks |

## 3. Validation & error-handling coverage (explicit rubric evidence)

| Scenario | Where it's tested | Expected result |
|---|---|---|
| Weak password on register | `utils.test.ts`, `auth.test.ts` | 400, `Validation failed`, field-level detail |
| Invalid email format | `utils.test.ts`, `auth.test.ts` | 400 |
| Duplicate email registration | `AuthService.test.ts`, `auth.test.ts` | 409 |
| Wrong password on login | `AuthService.test.ts`, `auth.test.ts` | 401 |
| Missing Authorization header | `auth.test.ts` | 401 |
| Malformed/tampered JWT | `utils.test.ts`, `auth.test.ts` | 401 (throws on verify) |
| Non-member reading a project | `ProjectService.test.ts`, `projects-tasks.test.ts` | 403 |
| Non-owner updating/deleting a project | `ProjectService.test.ts`, `projects-tasks.test.ts` | 403 |
| Removing the project owner | `ProjectService.test.ts` | 400 |
| Adding a member with an unknown email | `ProjectService.test.ts` | 404 |
| Assigning a task to a non-member | `TaskService.test.ts` | 403 |
| Updating/fetching a non-existent task | `TaskService.test.ts` | 404 |
| Empty/invalid task title | `projects-tasks.test.ts` | 400 |
| Unknown API route | `projects-tasks.test.ts` | 404 |

This table alone lists **13 distinct failure paths** exercised by
automated tests, in addition to every happy-path flow.

## 4. Running the tests and reading results

```bash
cd backend
npm test -- --coverage        # unit + integration, with coverage report
npm run test:unit             # unit tests only
npm run test:integration      # integration tests only

cd ../frontend
npm test                      # component tests (Vitest)
```

Coverage is written to `backend/coverage/` (HTML report at
`coverage/index.html`) and is also uploaded as a CI artifact on every push
(see `.github/workflows/ci.yml`, job `backend`, step "Upload coverage
report") — so a grader can download the exact coverage HTML from the
Actions run for this repository without re-running anything locally.

## 5. Coverage thresholds (enforced in CI)

`backend/jest.config.js` sets a coverage gate the build fails under:

```js
coverageThreshold: {
  global: { branches: 60, functions: 70, lines: 70, statements: 70 },
}
```

The service layer — where all business logic and authorization rules
live — is the most heavily tested layer by design, since it's where a
regression would be most costly.

## 6. Manual / exploratory testing

Beyond automated tests, the team ran a manual test pass before each sprint
demo using the seeded demo data (`npm run seed`):

- Cross-browser check (Chrome, Firefox, Safari) of the Kanban drag-and-drop.
- Keyboard-only navigation through login → create project → create task →
  open task modal → post comment → close modal, confirming every
  interactive element is reachable and operable without a mouse.
- Screen-reader spot check (VoiceOver) confirming form fields announce
  their labels and the task-count-per-column is announced via the
  `aria-label` on each `KanbanColumn` section.

Findings from this pass and their resolutions are logged in
[`09-project-management.md`](09-project-management.md) under Risk
Management (R-04, R-05).

## 7. Known testing gaps (documented honestly)

- No load/performance testing has been conducted; TaskFlow is scoped for
  small-team use, not high-concurrency production traffic.
- Frontend integration tests (full user flows in the browser, e.g. via
  Playwright/Cypress) were scoped out of the MVP in favor of deeper
  backend integration coverage; see the Project Management backlog.
- The `ProjectBoardPage` and `DashboardPage` container components are
  exercised indirectly through their child components' tests
  (`TaskCard`, `KanbanColumn`) rather than directly, to keep the test
  suite fast; this is a deliberate scope trade-off, not an oversight.
