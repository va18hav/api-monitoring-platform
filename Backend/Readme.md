# Backend

Node.js/TypeScript monorepo for PingDeck. Uses npm workspaces with two apps and two shared packages.

```
apps/
  scheduler/    REST API (auth, projects, endpoints, monitor config)
  worker/       Background job processor (HTTP pings, alert dispatch)
packages/
  db/           Prisma client + PostgreSQL setup
  shared/       Pino logger + Prometheus metrics
```

---

## Prerequisites

- Node.js v18+
- Docker (for local Postgres and Redis)

---

## Local setup

**1. Start infrastructure**

```bash
docker compose up -d
```

This spins up PostgreSQL on port `5433` and Redis on port `6380`.

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment files**

Create `.env` files in the relevant app directories. Examples are provided as `.env.example` in each.

`packages/db/.env`
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scheduler"
```

`apps/scheduler/.env`
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scheduler"
REDIS_HOST=localhost
REDIS_PORT=6380
JWT_SECRET=your-secret
PORT=3000
NODE_ENV=development
RESEND_API_KEY=your-resend-key
GOOGLE_CLIENT_ID=your-google-client-id
FRONTEND_URL=http://localhost:5173
```

`apps/worker/.env`
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/scheduler"
REDIS_HOST=localhost
REDIS_PORT=6380
WORKER_CONCURRENCY=5
MAX_RETRIES=5
NODE_ENV=development
```

**4. Push the database schema**

```bash
npx prisma db push --schema=packages/db/prisma/schema.prisma
```

**5. Run the services**

Open two terminals:

```bash
# Terminal 1 — API server
npm run dev -w apps/scheduler

# Terminal 2 — Background worker
npm run dev -w apps/worker
```

API runs at `http://localhost:3000`. Prometheus metrics are at `http://localhost:3000/metrics` (scheduler) and `http://localhost:3001/metrics` (worker).

---

## Build

```bash
npm run build
```

Compiles all packages and apps into their respective `dist/` folders.

---

## Production

Uses `docker-compose.prod.yml` with environment variables injected from a `.env` file on the server. Includes Loki, Promtail, and Grafana for log aggregation. See `ARCHITECTURE.md` for the full deployment picture.
