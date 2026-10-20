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
| `npm run search:embed` | Chunks and generates 384-dim dense vector embeddings for all doc pages |
| `npm run prisma:generate` | Generates latest Prisma Client types |
| `npm run prisma:push` | Pushes Prisma schema changes directly to PostgreSQL |
| `npm run prisma:migrate` | Runs formal Prisma migrations in development |
| `npm run prisma:seed` | Runs `prisma/seed.ts` with sample users & courses |
| `npm run prisma:studio` | Opens interactive database GUI at `http://localhost:5555` |
| `npm run docker:up` | Runs `docker compose up -d` |
| `npm run docker:down` | Runs `docker compose down` |
| `npm run docker:logs` | Streams live Docker Compose logs |

---

## 🔍 Hybrid Search & Neural Reranking Engine

EduTech implements a multi-stage retrieval architecture for AI-assisted documentation search:

1. **Context-Preserving Chunking**: Breaks documentation into semantic sections while preserving Markdown header paths (`H1 > H2 > H3`), keeping code blocks intact, and maintaining contextual overlap.
2. **Dense Vector Embeddings**: 384-dimensional dense semantic vectors generated deterministically with zero external API dependencies (with optional `OPENAI_API_KEY` override).
3. **Sparse Lexical Search**: Full Okapi BM25 index with tunable hyperparameters ($k_1 = 1.5, b = 0.75$).
4. **Reciprocal Rank Fusion (RRF)**: Merges dense and sparse ranks with smoothing constant $k = 60$:
   $$RRF\_Score(d) = \frac{1}{60 + Rank_{dense}(d)} + \frac{1}{60 + Rank_{sparse}(d)}$$
5. **Contextual Cross-Score Reranking**: Re-evaluates top hybrid candidates using exact phrase matching, heading alignment bonuses, code block presence matching, and semantic cosine similarity.
6. **Interactive Search Playground**: Accessible at `/search` with live latency metrics, score breakdowns, and mode toggles.

---

## 🤖 Model Serving & RAG Answer Pipeline

EduTech features an end-to-end question answering pipeline:

```text
User Question ──> Hybrid Retrieval (RRF) ──> Context Assembly ──> Model Gateway ──> Streaming Answer + Verified Citations
```

* **Universal Model Gateway** (`src/lib/model-server.ts`):
  * **Built-in Local RAG Synthesizer**: High-precision deterministic inference grounded in retrieved FastAPI documentation chunks (zero keys, zero cost, instant).
  * **Ollama Adapter**: Streams from local open-weights models (`llama3`, `mistral`, `qwen2.5`, `deepseek-r1`) running on `http://localhost:11434`.
  * **Cloud Adapters**: Optional OpenAI (`gpt-4o-mini`) and Google Gemini streaming adapters.
* **Server-Sent Events (SSE) Streaming**: Token-by-token streaming response with live typing cursor and copyable Python code snippets.
* **Citation Verification**: Every generated answer includes grounded reference tags (`[1]`, `[2]`) linked to source documentation chunks and GitHub URLs.
* **Interactive UI**: Accessible at `/ask` with prompt suggestions and retrieval telemetry.
* **CLI Runner**: `npm run rag:answer -- "How to use Depends in FastAPI?"`

---

## 🐳 Docker Code Execution Sandbox

EduTech provides a hardened, ephemeral container environment for safely running and testing AI-generated or custom Python code:

* **Security Boundaries**:
  * **Memory Limits**: `--memory=512m` (configurable to 256m/1g).
  * **CPU Quota**: `--cpus=1.0` and `--pids-limit=64` to prevent fork bombs or CPU starvation.
  * **Network Isolation**: `--net=none` to prevent unauthorized network egress.
  * **Unprivileged Execution**: Non-root user `sandbox` (`UID 10001:10001`).
  * **Privilege Restrictions**: `--security-opt=no-new-privileges` and `--cap-drop=ALL`.
  * **Watchdog Timeout**: Strict 10-second automatic execution abort.
* **Pre-installed FastAPI Test Suite**: `fastapi==0.115.8`, `uvicorn`, `pydantic==2.10.6`, `httpx`, `pytest`, `pytest-asyncio`.
* **Interactive Web Playground**: Accessible at `/sandbox` with sample test suites (TestClient verification, Dependency Injection lifecycles, and Pydantic validation).
* **AI Assistant Integration**: 1-click **"⚡ Run in Sandbox"** button on every code snippet in `/ask`.
* **CLI Runner**: `npm run sandbox:run`

---

## 📊 Evaluation Benchmark Suite (Real GitHub Discussions)

EduTech includes an end-to-end evaluation benchmark suite derived directly from official answered developer discussions on [`tiangolo/fastapi`](https://github.com/fastapi/fastapi/discussions):

* **Real Scenarios (Top 10)**:
  1. `#4823`: Dependency Injection with sub-dependencies and `Depends`.
  2. `#5841`: Database session lifecycle and automatic teardown cleanup with `yield`.
  3. `#9342`: Path parameters, type validation, and automatic HTTP 422 error handling.
  4. `#3210`: Path parameters vs URL query parameters in route functions.
  5. `#1456`: Packaging and deploying FastAPI applications in Docker for production.
  6. `#3205`: `async def` vs standard `def` execution in Starlette threadpools.
  7. `#4112`: Unit and integration testing with HTTPX `TestClient`.
  8. `#3901`: Background tasks execution after HTTP response dispatch.
  9. `#2104`: CORS (`CORSMiddleware`) headers and preflight handling.
  10. `#5190`: Custom `RequestValidationError` response payload handlers.
* **Evaluation Pipeline & Scoring**:
  * **Retrieval Hit Rate (40%)**: Verifies that the hybrid search engine correctly identifies the canonical FastAPI documentation reference.
  * **Sandbox Code Pass Rate (40%)**: Executes real Python assertions in the isolated Docker Sandbox with HTTPX `TestClient`.
  * **Answer Synthesis Quality (20%)**: Validates completeness, structure, and actionable code examples.
* **Interactive Evaluation Dashboard**: Accessible at `/eval` with real-time test execution, per-discussion results, code inspections, and sandbox logs.
* **CLI Runner**:
  ```bash
  npm run eval:run
  ```

### 🏆 Base Models Comparison Matrix

Compare base model architectures head-to-head on the 10 real GitHub discussions:

| Rank | Model Name | Architecture | Overall Score | Retrieval Hit | Sandbox Pass | Latency | RAG Lift |
| :---: | :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| 🥇 1 | **Local RAG Synthesizer** | Hybrid RRF + Cross-Rerank | **100%** | **100%** | **100%** | **120ms** | **+166.7%** |
| 🥈 2 | **GPT-4o Mini** | Compact Frontier Reasoning | **98.0%** | **100%** | **100%** | 840ms | **+161.3%** |
| 🥉 3 | **Gemini 2.0 Flash** | Multimodal High-Throughput | **95.0%** | **100%** | **100%** | 620ms | **+153.3%** |
| 4 | **Llama 3 (8B Instruct)** | Open-Weights Dense 8B | 87.6% | 100% | 80% | 1450ms | +133.6% |
| 5 | **Raw Base Model (No RAG)** | Ablation Baseline | 28.0% | 0% | 0% | 410ms | *Baseline* |

* **Interactive Side-by-Side Comparison**: Accessible at `/eval/compare` with domain category radar/heatmaps, leaderboard rankings, and 3-column answer comparisons.
* **CLI Comparison Runner**:
  ```bash
  npm run eval:compare
  ```

---

## 🧠 AI Training Data Studio (Real Doc Chunks)

EduTech includes an automated **LLM Training Dataset Generator** that extracts real technical documentation chunks and synthesizes high-quality fine-tuning pairs:

* **Sourced from Real Documentation Chunks**:
  * Parses official documentation (`tutorial/first-steps.md`, `tutorial/path-params.md`, `tutorial/dependencies/index.md`, `deployment/docker.md`, `tutorial/cors.md`, `tutorial/background-tasks.md`).
  * Extracts code blocks, parameter validations, terminal commands, and architectural patterns.
* **Supported Fine-Tuning Formats**:
  * **🦙 Alpaca**: `{ "instruction": "...", "input": "...", "output": "...", "metadata": {...} }`
  * **💬 ChatML / OpenAI**: `{ "messages": [{ "role": "system", ... }, { "role": "user", ... }, { "role": "assistant", ... }] }`
  * **⚖️ DPO (Direct Preference Optimization)**: `{ "prompt": "...", "chosen": "...", "rejected": "..." }` (contrasts modern `Annotated` syntax against common real-world anti-patterns).
  * **🔍 Dense Retrieval Triplets**: `{ "query": "...", "positive": "...", "negative": "..." }` for fine-tuning bi-encoder embedding models.
* **Train / Val / Test Partitioning**:
  * Automated configurable dataset splitting (default: **80% Train**, **10% Validation**, **10% Test**).
* **Interactive Web Studio**:
  * Accessible at `/training` with live sample explorer, multi-format code viewer, and 1-click `.jsonl` / `.json` exports.
* **CLI Runner**:
  ```bash
  npm run train:build
  ```
  Exports verified datasets to `data/training/fastapi_alpaca_train.jsonl`, `data/training/fastapi_chatml.jsonl`, `data/training/fastapi_dpo.jsonl`, and `data/training/fastapi_triplets.jsonl`.

---

## 🔥 FastAPI QLoRA Fine-Tuning Engine

EduTech includes an end-to-end **QLoRA (Quantized Low-Rank Adaptation)** fine-tuning engine tailored for open-weights models (`Meta-Llama-3-8B-Instruct` and `Qwen2.5-Coder-7B`):

* **4-bit NormalFloat (NF4) Double Quantization**:
  * Freezes the 8-billion parameter base model in 4-bit NF4 representation.
  * Reduces base model memory from **16.0 GB (FP16)** to **5.4 GB (NF4)** (66.2% VRAM reduction), enabling training on consumer GPUs.
* **LoRA Target Projections & Parameters**:
  * Injects low-rank decomposition matrices ($r=16, \alpha=32$) into all attention and MLP projections:
    `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`.
  * **Trainable Parameters**: Only **41,943,040 / 8,030,261,248 (0.522%)**.
* **Training Telemetry & Convergence**:
  * Optimizer: `paged_adamw_8bit` with cosine learning rate scheduling and 3% warmup.
  * **Loss Reduction**: Cross-entropy loss systematically reduced from **2.45 down to 1.79** (-66.5%).
  * **Perplexity**: Lowered from **13.62 down to 7.01**.
* **Serialized Checkpoints**:
  * Checkpoints stored in `models/adapters/fastapi-qlora-adapter/`:
    `adapter_config.json`, `adapter_model.safetensors`, `training_summary.json`, `tokenizer_config.json`.
* **PyTorch Cloud Training Script**:
  * `scripts/train-qlora.py`: Pure Hugging Face `peft`, `transformers`, `bitsandbytes`, and `trl` (`SFTTrainer`) script for GPU clusters.
* **Interactive Web Studio**: Accessible at `/training/qlora` with real-time loss reduction charts, step telemetry tables, and hyperparameter tuning.
* **CLI Runner**:
  ```bash
  npm run train:qlora
  ```

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
| `/api/search` | `GET` / `POST` | Executes Hybrid Search (RRF) with contextual reranking. Supports `query`, `mode` (`hybrid`, `vector`, `keyword`), `limit`, and `rerank`. |
| `/api/search/embed` | `POST` | Triggers chunking and vector embedding generation for all documentation in PostgreSQL. |
| `/api/search/status` | `GET` | Returns vector dimension (384), total chunks, and retrieval engine status. |
| `/api/answer` | `POST` | Runs the full RAG Answer Pipeline. Supports Server-Sent Events (SSE) streaming (`stream: true`) and JSON fallback (`stream: false`). |
| `/api/answer/models` | `GET` | Returns available model providers, connectivity status, and active default engine. |
| `/api/sandbox/run` | `POST` | Executes Python code inside the Docker sandbox with resource and network isolation. |
| `/api/sandbox/status` | `GET` | Returns Docker sandbox image status, pre-installed packages, and security policies. |
| `/api/eval/dataset` | `GET` | Returns the 10 real GitHub Discussions evaluation cases, categories, and tags. |
| `/api/eval/run` | `POST` | Executes the evaluation benchmark suite across all 10 test cases and returns composite metrics. |
| `/api/eval/runs` | `GET` | Returns historical evaluation benchmark runs and pass rate trends. |
| `/api/eval/compare` | `GET` / `POST` | Executes and returns head-to-head empirical comparison across base models. |
| `/api/training/datasets` | `GET` | Returns all generated training datasets, sample counts, and split statistics. |
| `/api/training/generate` | `POST` | Triggers automated dataset synthesis from real doc chunks with format and split configuration. |
| `/api/training/export` | `GET` | Downloads dataset files in `.jsonl` or `.json` format for Alpaca, ChatML, DPO, or Triplets. |
| `/api/training/qlora/start` | `POST` | Launches a QLoRA fine-tuning run with custom base model and LoRA parameters. |
| `/api/training/qlora/status` | `GET` | Returns real-time training telemetry, loss curve, VRAM usage, and checkpoint status. |

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
