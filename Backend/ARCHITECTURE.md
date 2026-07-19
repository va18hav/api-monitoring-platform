# Architecture

How PingDeck's backend is structured and why.

---

## The two services

The backend is split into two independent Node.js processes:

**Scheduler** (`apps/scheduler`) is the REST API. It handles user accounts, project and endpoint configuration, and managing monitor schedules. When a user creates a monitor, the scheduler registers a repeatable job in BullMQ backed by Redis. That's its only involvement in the actual pinging — after registration, it steps back.

**Worker** (`apps/worker`) runs separately and knows nothing about HTTP clients or auth. It just listens to the BullMQ queue, picks up jobs when they're due, makes the HTTP request to the configured endpoint, and writes the result to the database. If the ping fails, it enqueues a secondary `send_email` job for alert dispatch.

The reason for the split is straightforward — HTTP pings are I/O-heavy and unpredictable in duration. Keeping them out of the API process means a slow external endpoint never affects API response times.

---

## Request flow

```
User configures endpoint + interval
        ↓
Scheduler writes config to PostgreSQL
Scheduler registers repeatable BullMQ job in Redis
        ↓
[every N minutes]
Redis triggers job → Worker picks it up
Worker fetches endpoint config from PostgreSQL
Worker makes HTTP request to target
Worker writes response (status, latency, body) to PostgreSQL
If DOWN → Worker enqueues send_email job → Resend API
```

---

## Data model (simplified)

```
User
 └─ Project
     └─ Folder (optional grouping)
     └─ Endpoint (url, method, headers, auth config)
         └─ Monitor (interval, BullMQ repeat key, current status)
         └─ Response (status code, latency, timestamp)
```

---

## Auth

Cookie-based sessions using JWTs (httpOnly, Secure in production). Email verification via OTP stored in Redis with a 5-minute TTL. Google OAuth using server-side ID token verification. Password reset also uses Redis-stored OTPs with the same 5-minute TTL.

Rate limiting on auth routes uses a custom `FallbackStore` that prefers Redis but gracefully falls back to in-memory if Redis is unavailable.

---

## Observability

In development, Pino outputs human-readable logs. In production (`NODE_ENV=production`), it writes raw JSON to stdout.

Promtail picks up stdout from all Docker containers via the Docker socket and ships logs to Grafana Loki. Grafana is deployed alongside the application stack on the same EC2 instance.

The worker exposes Prometheus metrics on port `3001` — `jobs_processed_total` and `job_execution_duration_seconds`. The scheduler exposes default Node.js process metrics on `/metrics`.

---

## Deployment

Production runs on a single AWS EC2 instance behind an Nginx reverse proxy with a Let's Encrypt TLS certificate. The full stack (scheduler, worker, Redis, Loki, Promtail, Grafana) runs as Docker Compose services. PostgreSQL is hosted on AWS RDS.

The frontend is deployed to Vercel. Vercel's `vercel.json` rewrites `/api/*` to the EC2 backend so both share the same origin, which keeps auth cookies working correctly on mobile browsers.
