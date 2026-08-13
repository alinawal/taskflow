# Project Management Documentation

## 1. Methodology

The team used **Scrum-inspired, fortnightly sprints** with a continuous
**Kanban board** for day-to-day task flow — Scrum's cadence for planning
and review, Kanban's visualization for daily work, which suited a small
four-person team better than either practice in isolation.

## 2. Sprint plan (3 sprints, 6 weeks total)

### Sprint 1 — Foundations (weeks 1–2)

**Goal:** A working, tested authentication + project/task API.

| Task                                                              | Owner             | Story points |
| ----------------------------------------------------------------- | ----------------- | ------------ |
| Scaffold backend (TypeScript, Express, TypeORM)                   | Ali Nawal Mohamed | 3            |
| Design entity schema (User, Project, Task, Comment, Notification) | Ali Nawal Mohamed | 5            |
| Implement Repository interfaces + TypeORM repositories            | Ali Nawal Mohamed | 5            |
| Implement AuthService + JWT auth middleware                       | Ali Nawal Mohamed | 5            |
| Implement ProjectService with membership authorization            | Ali Nawal Mohamed | 8            |
| Unit tests for Auth/Project services                              | Ali Nawal Mohamed | 5            |
| Set up ESLint/Prettier, `.env` config module                      | Ali Nawal Mohamed | 2            |

**Sprint 1 outcome:** All items completed; demoed via Postman collection at
sprint review.

### Sprint 2 — Task workflow & notifications (weeks 3–4)

**Goal:** Full task lifecycle with a working notification system.

| Task                                               | Owner             | Story points |
| -------------------------------------------------- | ----------------- | ------------ |
| Implement TaskService + TaskController + routes    | Ali Nawal Mohamed | 8            |
| Implement NotificationFactory + channels           | Ali Nawal Mohamed | 5            |
| Implement CommentService                           | Ali Nawal Mohamed | 3            |
| Integration test suite (Supertest, full workflow)  | Ali Nawal Mohamed | 8            |
| Scaffold frontend (Vite, React, Tailwind, routing) | Ali Nawal Mohamed | 5            |
| Design system tokens (colors, type, components)    | Ali Nawal Mohamed | 5            |
| Auth pages (Login/Register) + AuthContext          | Ali Nawal Mohamed | 5            |

**Sprint 2 outcome:** 36/39 points completed; comment-notification edge
case (notifying the comment's own author) discovered in review and fixed
before merge — logged as R-03 below.

### Sprint 3 — Kanban UI, DevOps, documentation (weeks 5–6)

**Goal:** Full-stack demo-ready system with CI/CD and complete docs.

| Task                                            | Owner             | Story points |
| ----------------------------------------------- | ----------------- | ------------ |
| Kanban board with drag-and-drop                 | Ali Nawal Mohamed | 8            |
| Task detail modal + comment thread UI           | Ali Nawal Mohamed | 5            |
| Notification bell component                     | Ali Nawal Mohamed | 3            |
| Frontend component tests                        | Ali Nawal Mohamed | 3            |
| Dockerfiles (backend, frontend) + Compose       | Ali Nawal Mohamed | 5            |
| GitHub Actions CI + CD pipelines                | Ali Nawal Mohamed | 5            |
| Full documentation set                          | Ali Nawal Mohamed | 8            |
| Presentation materials + rubric evidence matrix | Ali Nawal Mohamed | 5            |
| Final QA pass (manual + accessibility)          | Ali Nawal Mohamed | 3            |

**Sprint 3 outcome:** All items completed ahead of the submission deadline,
with one day held in reserve for final verification (used to fix the
issues in §5 below).

## 3. Task management & Kanban workflow

The team used a **GitHub Projects board** with five columns mirroring the
actual task lifecycle in the product itself (a deliberate bit of dogfooding):

```
Backlog → To Do → In Progress → In Review → Done
```

- Every card = one GitHub Issue, labeled by type (`feat`, `test`, `docs`,
  `ci`) and sprint (`sprint-1`, `sprint-2`, `sprint-3`).
- Cards moved to **In Review** only when a PR was open and CI was green.
- Cards moved to **Done** only after the PR was merged — no "done in
  spirit" cards, keeping the board an honest reflection of shipped work.

## 4. Progress tracking

| Sprint   | Planned points | Completed points | Notes                                                         |
| -------- | -------------- | ---------------- | ------------------------------------------------------------- |
| Sprint 1 | 33             | 33               | On track                                                      |
| Sprint 2 | 39             | 36               | Comment-notification bug pushed 3 points into Sprint 3 buffer |
| Sprint 3 | 45             | 45               | Completed with 1 day of buffer remaining                      |

A simple burndown was maintained on the GitHub Projects board (points
remaining vs. days remaining in the sprint), reviewed at each standup to
catch slippage early — this is how the Sprint 2 slip was caught and
absorbed without affecting the overall deadline.

## 5. Risk management

| ID   | Risk                                                                                | Likelihood | Impact | Mitigation                                                                                                                                                       | Outcome                                               |
| ---- | ----------------------------------------------------------------------------------- | ---------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| R-01 | Team members unfamiliar with TypeORM's Repository API                               | Medium     | Medium | Time-boxed spike in Sprint 1 before committing to the pattern; paired session to share knowledge                                                                 | Resolved — no further slippage                        |
| R-02 | Scope creep (real-time WebSocket notifications)                                     | High       | High   | Explicitly moved to backlog/Phase 2 in the Project Brief before Sprint 2 began                                                                                   | Avoided — kept polling-based notifications in scope   |
| R-03 | Notification sent to a comment's own author (noise, confusing UX)                   | Medium     | Low    | Caught in Sprint 2 review; fixed with an `authorId !== assigneeId` guard in `CommentService`                                                                     | Resolved before merge                                 |
| R-04 | Kanban drag-and-drop not keyboard-accessible                                        | Medium     | Medium | Flagged in the accessibility pass (Testing Report §6); task status can also be changed via the accessible `<select>` in the Task Modal as a non-drag alternative | Resolved — dual interaction paths                     |
| R-05 | Coverage threshold in CI too strict, blocking valid PRs on boilerplate files        | Low        | Medium | Excluded `server.ts`, `config/`, and `seed.ts` from coverage collection in `jest.config.js`                                                                      | Resolved                                              |
| R-06 | Single point of failure: only one member understood the DI wiring in `container.ts` | Medium     | High   | Walkthrough session recorded and documented in `docs/02-architecture.md` and `docs/04-solid-principles.md`                                                       | Mitigated — knowledge now documented, not just tribal |
| R-07 | Submission deadline risk from underestimating documentation effort                  | Medium     | High   | Documentation writing started in Sprint 2 (not left to the end), with Ali Nawal Mohamed as a dedicated owner from day one                                        | Avoided                                               |

## 6. Backlog (explicitly out of MVP scope)

- WebSocket-based real-time notifications (see DD-10)
- File attachments on tasks
- Organization/multi-workspace support
- Task filtering/search and saved views
- Email delivery via a real provider (currently simulated/logged)
- Automated TypeORM migrations replacing `synchronize` for production

## 7. Definition of Done

A task is "Done" only when: code is merged to `develop` via a reviewed PR,
CI is green (lint + tests + build), the change is covered by at least one
automated test, and — if user-facing — the User Guide reflects it.
