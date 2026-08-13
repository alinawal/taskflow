# Contributing to TaskFlow

This guide documents the version-control and collaboration workflow the
team used to build TaskFlow. It complements `docs/07-version-control.md`
and `docs/08-team-documentation.md`, which give the full rationale.

## Branching strategy (GitHub Flow + a `develop` integration branch)

```
main         ── always deployable; tagged releases; protected branch
 └─ develop  ── integration branch; feature branches merge here first
     ├─ feature/task-kanban-board
     ├─ feature/auth-jwt
     ├─ fix/notification-duplicate-bug
     └─ chore/ci-pipeline
```

- `main` — production-ready code only. Merges come exclusively from `develop`
  via a reviewed PR, and every merge is tagged (`v1.0.0`, `v1.1.0`, ...).
- `develop` — where finished features land before a release. CI must pass
  before merging into it.
- `feature/*`, `fix/*`, `chore/*`, `docs/*` — short-lived branches created
  from `develop` for a single unit of work, deleted after merge.

## Commit message convention (Conventional Commits)

```
<type>(<scope>): <short summary>

[optional body]
[optional footer, e.g. "Closes #12"]
```

Types used in this project: `feat`, `fix`, `refactor`, `test`, `docs`,
`chore`, `ci`, `style`.

Examples from this repository's history:

```
feat(auth): add JWT-based register and login endpoints
feat(tasks): notify assignee when a task is created or reassigned
fix(projects): prevent removing the project owner from membership
test(task-service): cover status-change notification side effect
docs(readme): add Docker quick-start instructions
ci(workflows): add lint, test and docker-build jobs
refactor(repositories): extract BaseTypeOrmRepository to remove duplication
```

## Pull request workflow

1. Branch from `develop`: `git checkout -b feature/my-change develop`.
2. Commit in small, logical units using the convention above.
3. Push and open a PR **into `develop`** using `.github/PULL_REQUEST_TEMPLATE.md`.
4. CI (`.github/workflows/ci.yml`) must pass: lint, unit tests, integration
   tests, and both builds.
5. At least **one other team member reviews and approves** before merge
   (see `docs/08-team-documentation.md` for the reviewer rotation).
6. Squash-merge into `develop` with a Conventional Commit message.
7. Periodically, `develop` is merged into `main` via a release PR and tagged.

## Code review checklist (used for every PR)

- Does the change respect the layering (controller → service → repository)?
- Are new services/repositories covered by unit tests?
- Are new endpoints covered by an integration test, including at least one
  failure/validation case?
- Does the diff avoid duplicating logic that already exists in a shared
  utility, base class, or the factory?
- Is user-facing text clear and consistent with existing copy?

## Local setup

See the root [README.md](README.md) and [docs/11-installation-guide.md](docs/11-installation-guide.md).
