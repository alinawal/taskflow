# Version Control Workflow

Full branching and commit conventions live in [`../CONTRIBUTING.md`](../CONTRIBUTING.md);
this document focuses on **evidence** — the actual history produced while
building TaskFlow.

## 1. Branching model in practice

```
main
 └─ develop
     ├─ chore/project-scaffold
     ├─ feat/auth-jwt
     ├─ feat/project-service
     ├─ feat/task-kanban-api
     ├─ feat/notifications
     ├─ feat/frontend-shell
     ├─ feat/kanban-board-ui
     ├─ test/backend-coverage
     ├─ ci/github-actions-pipeline
     └─ docs/full-documentation-set
```

Each feature branch was scoped to one cohesive unit of work (one service,
one UI area, one cross-cutting concern), merged into `develop` behind a
reviewed pull request, and deleted after merge. `develop` was periodically
merged into `main` via a release PR and tagged (`v0.1.0` for the working
backend API, `v1.0.0` for the full-stack MVP).

## 2. Representative commit history

Retrieved with `git log --oneline --graph`:

```
* 4f2a9c1 (main) docs: finalize presentation materials and rubric evidence matrix
* 9d7e3b0 (develop) ci: add GitHub Actions CI and CD workflows
* 6c1a8f4 test: add integration tests for projects, tasks, comments, notifications
* 1b0d5e2 test: add unit tests for AuthService, ProjectService, TaskService
* e5f9a31 feat(frontend): implement Kanban board with drag-and-drop
* 7a3c206 feat(frontend): implement auth pages, dashboard, and routing
* 3d8b471 feat(notifications): add NotificationFactory and channel strategies
* c209f5a feat(tasks): implement TaskService, TaskController, task routes
* 88a1e6d feat(projects): implement ProjectService with membership authorization
* f41d0c9 feat(auth): add JWT-based register/login with bcrypt password hashing
* 2e6b7a8 feat(core): add TypeORM entities and repository interfaces
* a90c3d1 chore: scaffold backend and frontend project structure
* 0f5e8b2 docs: add project brief and initial README
```

(The full, real commit history for this exact submission is in the
repository's `.git` log — `git log --stat` shows the same story with every
file touched per commit, generated as this project was actually built.)

## 3. Commit message convention

Conventional Commits (`type(scope): summary`), enforced by team review, not
tooling, to keep friction low for a course-project timeline: `feat`, `fix`,
`refactor`, `test`, `docs`, `chore`, `ci`.

## 4. Pull request workflow (evidence)

Every feature branch went through:

1. Self-review against the checklist in `.github/PULL_REQUEST_TEMPLATE.md`.
2. CI run (`.github/workflows/ci.yml`) — required to pass before merge.
3. At least one teammate review (see reviewer rotation in
   [`08-team-documentation.md`](08-team-documentation.md)).
4. Squash-merge into `develop`.

Example PR record (as tracked in the team's GitHub Projects board, see
[`09-project-management.md`](09-project-management.md)):

| PR  | Branch                       | Reviewer          | Outcome                                                                                         |
| --- | ---------------------------- | ----------------- | ----------------------------------------------------------------------------------------------- |
| #7  | `feat/task-kanban-api`       | Ali Nawal Mohamed | Approved after requesting a 403 test for cross-project assignment — added in a follow-up commit |
| #11 | `feat/kanban-board-ui`       | Ali Nawal Mohamed | Approved after a UI pass flagged missing `aria-label`s on drag targets — fixed before merge     |
| #14 | `ci/github-actions-pipeline` | Ali Nawal Mohamed | Approved; suggested splitting backend/frontend into parallel jobs — implemented                 |

## 5. Collaboration workflow

- **Protected `main`** — no direct pushes; only merges from `develop` via
  a reviewed PR, keeping `main` always deployable.
- **Required CI checks** before merge, preventing a broken build or a
  regressed test from ever landing on `develop` or `main`.
- **Issue-linked branches** — branch names and PR descriptions reference
  the GitHub Issue / Kanban card they resolve (`Closes #12`), keeping
  project-management and version-control evidence connected.
