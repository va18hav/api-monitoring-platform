# API Monitor (API Guard)

API Monitor is a distributed API uptime and response-time monitoring system. It allows users to group HTTP endpoints under projects, schedule automatic periodic health checks, track real-time and historical latency, and receive simulated email alerts when services go down.

The platform is built as a monorepo featuring a decoupled React frontend and a multi-process Node/TypeScript backend driven by an asynchronous, Redis-backed job queue.

---

## Repository Structure

The project is divided into two primary directories at the root:

```text
├── Backend/                     # Node.js/TypeScript backend monorepo
│   ├── apps/
│   │   ├── scheduler/           # REST API server (Express) & job scheduler
│   │   └── worker/              # Background job execution engine (BullMQ)
│   ├── packages/
│   │   ├── db/                  # Prisma ORM & PostgreSQL client database layer
│   │   └── shared/              # Pino logger & Prometheus telemetry metrics setup
│   ├── docker-compose.yml       # Dev setup for local PostgreSQL & Redis
│   └── package.json             # NPM workspaces configuration
│
└── Frontend/                    # React frontend application
    ├── src/
    │   ├── features/
    │   │   ├── auth/            # LoginPage & RegisterPage components
    │   │   └── monitors/        # Dashboard, list, details, and charting views
    │   ├── shared/              # Global UI layout, navigation sidebar, & axios API instance
    │   └── store/               # Zustand authentication store
    └── package.json             # React, Vite, & Tailwind CSS v4 setup
```

---

## Core Components

### 1. Scheduler Service (`Backend/apps/scheduler`)
An Express-based REST API that serves as the administrative gateway.
* **Authentication**: Cookie-based session tracking with JSON Web Tokens (JWT).
* **Scheduling**: Registers repeatable check tasks with BullMQ under custom minute intervals.
* **Metrics**: Exposes a `/metrics` Prometheus scrape endpoint to expose HTTP server request telemetry.
* **Middlewares**: Enforces structured request-ID tracing, child logger scoping, token validation, and global error handling.

### 2. Execution Worker (`Backend/apps/worker`)
A dedicated background daemon that processes asynchronous queue tasks.
* **Health Checks**: Listens for the `ping_endpoint` job type, pings the targeted URL with a 10-second request timeout, and saves the HTTP status code and roundtrip latency.
* **Alert System**: Enqueues a simulated `send_email` dispatch job if a target responds with a non-success HTTP status code or times out.
* **Heartbeat & Telemetry**: Exposes an independent HTTP metrics server on port `3001` for Prometheus monitoring. Handles clean shutdown sequences upon system termination signals.

### 3. Database Layer (`Backend/packages/db`)
* Driven by **Prisma ORM** with a PostgreSQL adapter.
* **Schema Schema**:
  * `User`: Managed accounts and authentication metadata.
  * `Project`: Logical groups of monitored web endpoints.
  * `Endpoint`: Monitored targets storing URLs, HTTP methods, intervals, and active status (`UP`, `DOWN`, `PENDING`).
  * `Response`: Historical latency logs, status codes, timestamps, and error messages.
  * `Worker`: Simple registry logs monitoring active worker process health.

### 4. Shared Utilities (`Backend/packages/shared`)
* **Logger**: Consolidates logging using Pino, configured with standard JSON logs in production and clean console output via `pino-pretty` in development.
* **Metrics**: Sets up default Prometheus node metrics and custom instrumentation tracking overall processed jobs count and job execution durations.

### 5. Frontend Client (`Frontend`)
* Built using **React 19**, **Vite**, **TypeScript**, and **Tailwind CSS v4** styling.
* **State Management**: Uses **Zustand** for user session state and **TanStack Query** (React Query) for caching, optimistic updates, and background refetch polling.
* **Visual Data**: Plots response time metrics over the latest 20 checks using an inline edge-to-edge SVG chart.

---

## Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [Docker](https://www.docker.com/)

---

### Step 1: Run Infrastructure Services
From the `Backend/` directory, spin up PostgreSQL and Redis instances:
```bash
cd Backend
docker compose up -d
```

### Step 2: Configure Environment Files
Copy or verify environment configurations in the workspace folders:

#### Backend Database config (`Backend/packages/db/.env`):
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scheduler"
```

#### Scheduler Service (`Backend/apps/scheduler/.env`):
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scheduler"
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET="your-jwt-signing-secret"
PORT=3000
```

#### Worker Service (`Backend/apps/worker/.env`):
```ini
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scheduler"
REDIS_HOST=localhost
REDIS_PORT=6379
WORKER_CONCURRENCY=5
MAX_RETRIES=5
```

---

### Step 3: Setup the Database
1. Run `npm install` inside the `Backend` directory to install dependencies for all monorepo packages.
2. Generate the Prisma client and apply database migrations:
```bash
cd Backend
npm install
npx prisma migrate dev --schema=packages/db/prisma/schema.prisma
```

---

### Step 4: Run the Backend Services
To start both the scheduler API and the background worker locally:
```bash
# In one terminal: Start the Scheduler REST API
npm run dev --workspace=scheduler

# In a second terminal: Start the Background Worker
npm run dev --workspace=worker
```

---

### Step 5: Start the Frontend Client
Open a third terminal, install the frontend dependencies, and start the Vite dev server:
```bash
cd Frontend
npm install
npm run dev
```
Open your browser to [http://localhost:5173](http://localhost:5173).

---

## Telemetry Metrics Scrape
* The **Scheduler API** exposes Prometheus metrics on [http://localhost:3000/metrics](http://localhost:3000/metrics).
* The **Worker Process** exposes its telemetry port on [http://localhost:3001/metrics](http://localhost:3001/metrics).
