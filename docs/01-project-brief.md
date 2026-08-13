# Project Brief

## 1. Problem statement

Small teams — student project groups, early-stage startups, campus clubs —
routinely coordinate work through a scatter of tools that were never
designed for the job: WhatsApp threads for status updates, a shared Google
Doc for "who's doing what," and email for anything that needs a paper
trail. Nothing tracks _state_ (what stage is this task at?), nothing
notifies the right person when something changes, and nothing gives a
newcomer a single place to see the whole project at a glance.

## 2. Solution

**TaskFlow** is a focused, self-hosted team task-management system. A team
creates a project, invites members by email, and organizes work as tasks on
a three-column Kanban board (**To do → In progress → Done**). Each task
carries a priority, an optional due date, and a comment thread; moving a
task or assigning it automatically notifies the right person.

TaskFlow deliberately does **not** try to be Jira. It has one board style,
one role model (project owner vs. contributor), and no configuration
screens — the entire product is comprehensible in under two minutes, which
is exactly what a five-person student team or a small startup needs.

## 3. Target users

| Persona                            | Need                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| **Project owner** (e.g. team lead) | Create a project, add teammates, see overall progress, keep the team accountable.     |
| **Contributor** (team member)      | See what's assigned to them, update status as they work, discuss blockers in context. |
| **Admin** (platform-level role)    | Reserved for future org-wide administration (see Product Roadmap).                    |

## 4. Core features (MVP scope, fully implemented)

1. **Account & authentication** — email/password registration and login,
   JWT-based sessions, passwords hashed with bcrypt.
2. **Projects** — create, rename, describe, delete; owner-only mutation
   rights.
3. **Membership** — owner adds/removes contributors by email.
4. **Tasks** — create, edit, delete, assign, prioritize, set due dates,
   drag between Kanban columns.
5. **Comments** — threaded discussion attached to each task.
6. **Notifications** — in-app (and simulated email) notification whenever a
   user is assigned a task, a task they're assigned to changes status, or
   someone comments on their task.
7. **Role-based access control** — only project owners can rename/delete a
   project or manage membership; only project members can view or act on
   its tasks.

## 5. Out of scope (explicitly, for this iteration)

- Real-time collaborative editing (websocket-pushed live updates — the
  notification bell polls instead, a deliberate and documented trade-off).
- File attachments on tasks.
- Third-party integrations (Slack, calendar sync).
- Multi-workspace/organization billing.

These are captured as backlog items in
[`09-project-management.md`](09-project-management.md).

## 6. Success criteria

- A new user can register, create a project, invite a teammate, create a
  task, assign it, and see it move across the board — **in under two
  minutes**, without instructions.
- The backend enforces every authorization rule from the API layer down
  (never trusting the frontend alone), verified by integration tests.
- The system runs identically via `npm run dev` and via
  `docker compose up`, proving it is genuinely deployment-ready.

## 7. Technology summary

| Layer    | Technology                                     | Why                                                                                                                  |
| -------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Backend  | Node.js, TypeScript, Express, TypeORM          | Strong typing end-to-end; TypeORM gives a clean Active-Record-free Repository layer via `DataSource.getRepository`.  |
| Database | SQLite (dev/test), PostgreSQL (Docker/prod)    | Zero-setup local dev; production-grade RDBMS in deployment, switched purely through configuration.                   |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS       | Fast dev loop, small bundle, utility-first styling that keeps the design system centralized in `tailwind.config.js`. |
| Auth     | JWT (jsonwebtoken), bcryptjs                   | Stateless auth suited to a REST API; industry-standard password hashing.                                             |
| Testing  | Jest, Supertest, Vitest, React Testing Library | Full-stack automated coverage — see [Testing Report](05-testing-report.md).                                          |
| DevOps   | Docker, Docker Compose, GitHub Actions         | Reproducible environments and automated quality gates — see [DevOps Report](06-devops-report.md).                    |

## 8. Stakeholders

- **Development team** (see [Team Documentation](08-team-documentation.md))
- **Course instructor / examiner** — grading against the SWE2030XA rubric
- **End users** — the demo team accounts seeded in `npm run seed`
