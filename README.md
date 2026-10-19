# 🎓 EduTech — Cloud LMS Platform Skeleton

An enterprise-ready, containerized Learning Management System (LMS) skeleton engineered with **Next.js 16 (App Router)**, **PostgreSQL 16**, **Prisma ORM 6.4**, and **Docker Compose** orchestration.

---

## 🏛️ Architecture Overview

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Network                          │
│                                                                        │
│   ┌─────────────────────────┐               ┌───────────────────────┐  │
│   │       edutech-app       │               │      edutech-db       │  │
│   │   Next.js 16 Standalone │ ──[Prisma]──> │     PostgreSQL 16     │  │
│   │        Port: 3000       │               │       Port: 5432      │  │
│   └─────────────────────────┘               └───────────┬───────────┘  │
│                ▲                                        │              │
│                │                                        ▼              │
│          HTTP / Browser                       [Named Volume Storage]   │
│       http://localhost:3000                    edutech_postgres_data   │
│                                                                        │
│   ┌─────────────────────────┐                                          │
│   │    edutech-db-setup     │                                          │
│   │  (One-off Seed/Migrate) │ ──[Push Schema & Seed Data]──────────────┘  │
│   └─────────────────────────┘                                          │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart Options

### Option 1: Run Entire Stack with Docker (Recommended for Container Testing)

Prerequisites: [Docker Desktop](https://www.docker.com/products/docker-desktop/) running on your system.

```bash
# 1. Start PostgreSQL and the Next.js application containers
docker compose up -d

# 2. Push Prisma schema and seed sample courses, users, and progress
docker compose --profile tools run --rm db-setup

# 3. Open the application in your browser
# Web UI:       http://localhost:3000
# Healthcheck:  http://localhost:3000/api/health
```

To stop the containers:
```bash
docker compose down
```

---

### Option 2: Local Development with Hot-Reload + Docker Database

Ideal for rapid iterative UI and API development:

```bash
# 1. Start only the PostgreSQL database container
docker compose up -d db

# 2. Synchronize database schema and seed sample data
npm run prisma:push
npm run prisma:seed

# 3. Launch Next.js in hot-reloading development mode
npm run dev

# 4. Open in browser
# http://localhost:3000
```

---

## 🗄️ Relational Database Schema (`prisma/schema.prisma`)

The database is built on **PostgreSQL** and managed using **Prisma ORM**. The LMS schema models include:

| Model | Description | Relations |
| :--- | :--- | :--- |
| **`User`** | System users with roles (`STUDENT`, `INSTRUCTOR`, `ADMIN`) | Authored courses, enrollments, reviews, progress |
| **`Category`** | Subject classification (Web Dev, AI/ML, Cloud DevOps) | Courses (1-to-many) |
| **`Course`** | Courses with slug, difficulty level, pricing, metadata | Instructor, Category, Modules, Enrollments, Reviews |
| **`Module`** | Ordered curriculum sections within a course | Course, Lessons (1-to-many) |
| **`Lesson`** | Individual lessons (video URL, markdown text, duration) | Module, Progress records |
| **`Enrollment`** | Student course registration and aggregate progress % | User, Course |
| **`LessonProgress`**| Granular completion tracking and playback timestamp | User, Lesson |
| **`Review`** | Student 1-5 star ratings and written reviews | User, Course |
| **`DocSource`** | Ingested GitHub repositories (`tiangolo/fastapi`, commit SHA, sync status) | DocPages, SyncLogs |
| **`DocPage`** | Ingested markdown documentation (title, category, path, content, SHA) | DocSource |
| **`SyncLog`** | History of sync jobs (added, updated, unchanged counts, commit SHA) | DocSource |

---

## ⚡ FastAPI GitHub Ingestion & Sync Pipeline

EduTech includes an automated ingestion pipeline that connects directly to the official [tiangolo/fastapi](https://github.com/tiangolo/fastapi) repository:

1. **Commit-Aware Ingestion**: Checks latest upstream commit SHA and compares git blob SHAs to only fetch new or updated markdown documents.
2. **Dual-Mode Presentation**:
   - **Documentation Hub** (`/docs/fastapi`): Split-view markdown reader with search, category filtering, and 1-click sync button.
   - **Auto-Generated LMS Course** (`/courses`): Automatically maps ingested documentation into structured curriculum modules and lessons.
3. **Continuous Synchronization**:
   - **Web UI**: 1-click `Sync Now` trigger on the `/docs/fastapi` dashboard.
   - **CLI Script**: `npm run sync:fastapi` (or `npm run sync:fastapi -- --force`).
   - **REST API**: `POST /api/sync/fastapi`.

---

## 🛠️ Available NPM Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts local Next.js development server with hot-reload |
| `npm run build` | Produces optimized production Next.js standalone build |
| `npm run start` | Starts production Next.js server |
| `npm run sync:fastapi` | Ingests & synchronizes real FastAPI docs from GitHub into PostgreSQL |
| `npm run prisma:generate` | Generates latest Prisma Client types |
| `npm run prisma:push` | Pushes Prisma schema changes directly to PostgreSQL |
| `npm run prisma:migrate` | Runs formal Prisma migrations in development |
| `npm run prisma:seed` | Runs `prisma/seed.ts` with sample users & courses |
| `npm run prisma:studio` | Opens interactive database GUI at `http://localhost:5555` |
| `npm run docker:up` | Runs `docker compose up -d` |
| `npm run docker:down` | Runs `docker compose down` |
| `npm run docker:logs` | Streams live Docker Compose logs |

---

## 📡 REST API Reference

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Healthcheck reporting PostgreSQL connection status, latency, uptime, and database counts. |
| `/api/courses` | `GET` | Fetches published courses with modules, lessons, instructor details, and ratings. Supports `?category=slug`, `?level=BEGINNER`, `?q=search`. |
| `/api/stats` | `GET` | Returns platform aggregates (total courses, students, instructors, lessons, enrollments). |
| `/api/sync/fastapi` | `GET` | Checks FastAPI sync status, tracked commit SHA, and recent sync audit logs. |
| `/api/sync/fastapi` | `POST` | Triggers GitHub ingestion and updates the local PostgreSQL database and LMS course. Supports `{ "force": true }`. |
| `/api/docs/fastapi` | `GET` | Returns list of ingested FastAPI docs grouped by category with search filter (`?q=term`). |
| `/api/docs/fastapi/[slug]` | `GET` | Fetches full markdown content of a specific documentation page with prev/next navigation. |

---

## 🐳 Docker Stack Specification

- **`Dockerfile`**: Multi-stage production build using lightweight `node:20-alpine`, `openssl`, and `libc6-compat`. Produces an ultra-lean Next.js standalone container run by a non-root `nextjs` user.
- **`docker-compose.yml`**:
  - `db`: PostgreSQL 16 Alpine with automatic `pg_isready` healthcheck and named volume `edutech_postgres_data`.
  - `app`: Next.js web application built from `Dockerfile`, awaiting database readiness.
  - `db-setup`: Migration & seed container running under the `tools` compose profile.
- **`.dockerignore`**: Excludes `node_modules`, `.next`, cache, and local secrets.

---

## ⚙️ Environment Variables

Defined in `.env` (and documented in `.env.example`):

```ini
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

POSTGRES_USER=edutech_user
POSTGRES_PASSWORD=edutech_secure_pass123
POSTGRES_DB=edutech_db
POSTGRES_PORT=5432

DATABASE_URL="postgresql://edutech_user:edutech_secure_pass123@localhost:5432/edutech_db?schema=public"
```
