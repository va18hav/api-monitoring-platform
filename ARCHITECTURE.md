# System Architecture

This document describes the high-level architecture, component communication flows, and data relationships of the API Monitor system.

---

## 1. System Component Overview

The system uses a decoupled, event-driven architecture to ensure web servers are not blocked by synchronous HTTP check calls. Uptime monitoring checks are offloaded to asynchronous worker processes using a message queue.

```mermaid
flowchart TD
    subgraph Client ["Client Interface"]
        UI["React Frontend (Vite)"]
    end

    subgraph Backend ["Backend Monorepo"]
        API["Express Scheduler API (Port 3000)"]
        Worker["BullMQ Worker Daemon (Concurreny: 5)"]
        Prom["Prometheus Telemetry"]
    end

    subgraph Data ["Data & Messaging Layer"]
        DB[(PostgreSQL Database)]
        Queue[(Redis Queue - BullMQ)]
    end

    subgraph External ["External Services"]
        Target["Target HTTP/HTTPS Endpoints"]
        Email["Simulated SMTP Service"]
    end

    %% Client Interactions
    UI -- "REST Requests (Cookies / JWT)" --> API
    
    %% API Actions
    API -- "Read/Write Metadata" --> DB
    API -- "Schedule Repeatable Jobs" --> Queue
    
    %% Queue & Worker Operations
    Queue -- "Fetch Jobs" --> Worker
    Worker -- "Query Endpoint Spec" --> DB
    Worker -- "Ping Target URLs" --> Target
    Worker -- "Save Latency & Status" --> DB
    Worker -- "Enqueue alert job" --> Queue
    Worker -- "Simulated Dispatch" --> Email

    %% Monitoring
    API -- "Scrape /metrics" --> Prom
    Worker -- "Scrape /metrics (Port 3001)" --> Prom
```

---

## 2. Dynamic Workflows

### Scheduling a Health Check
When a user adds a new endpoint monitor from the dashboard, the following sequence occurs:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Browser)
    participant API as Scheduler API
    participant DB as PostgreSQL
    participant Redis as Redis (BullMQ)

    User->>API: POST /endpoint (Name, URL, Interval, ProjectID)
    Note over API: Verify JWT token & check Project ownership
    API->>DB: INSERT INTO Endpoint (PENDING status)
    DB-->>API: Created Endpoint record
    API->>Redis: jobQueue.add("ping_endpoint", { endpointId }) with repeat options
    Redis-->>API: Scheduled Job Metadata (repeatJobKey)
    API->>DB: UPDATE Endpoint SET repeatJobKey = key
    DB-->>API: Update confirmation
    API-->>User: Response with created monitor details
```

### Health Check Execution Loop
Workers process scheduled jobs concurrently. Below is the operational lifecycle of a single check:

```mermaid
sequenceDiagram
    autonumber
    participant Redis as Redis (Queue)
    participant Worker as Worker Process
    participant DB as PostgreSQL
    participant Target as External Target API

    Redis->>Worker: Trigger "ping_endpoint" job
    Worker->>DB: Fetch Endpoint URL, Method, and User details
    DB-->>Worker: Endpoint configurations
    
    rect rgb(240, 248, 255)
        Note over Worker: Setup 10-second timeout abort controller
        Worker->>Target: HTTP Request (Fetch)
        alt Success (HTTP 2xx)
            Target-->>Worker: Response status and time
            Note over Worker: Status = UP
        else Failure or Timeout (>10s)
            Target-->>Worker: Error or Timeout
            Note over Worker: Status = DOWN
        end
    end

    Worker->>DB: createResponse() (latency, status, errors)
    Worker->>DB: update Endpoint status ('UP' or 'DOWN')
    
    alt Status is DOWN
        Note over Worker: Retrieve associated Project User's email
        Worker->>Redis: jobQueue.add("send_email", alertDetails)
        Worker-->>Redis: Job queued
    end
```

### Alert Dispatch Workflow
If an endpoint transitions to a `DOWN` status, it spawns a separate notification task:

```mermaid
sequenceDiagram
    autonumber
    participant Redis as Redis (Queue)
    participant Worker as Worker Process
    participant Log as Pino Console Output

    Redis->>Worker: Trigger "send_email" job
    Note over Worker: Simulate SMTP delay (500ms sleep)
    Worker->>Log: [SIMULATED EMAIL DISPATCH] Alert sent to user@domain.com
    Worker-->>Redis: Mark job completed
```

---

## 3. Data Relationships (ERD)

The database schema models user organization, monitored workspaces, status histories, and background task statuses.

```mermaid
erDiagram
    USER ||--o{ PROJECT : "owns"
    PROJECT ||--o{ ENDPOINT : "contains"
    ENDPOINT ||--o{ RESPONSE : "logs"

    USER {
        string id PK
        string email UK
        string password
        datetime createdAt
        datetime updatedAt
    }

    PROJECT {
        string id PK
        string name
        string description
        string userId FK
        datetime createdAt
        datetime updatedAt
    }

    ENDPOINT {
        string id PK
        string name
        string url
        string method
        int interval
        string status
        string projectId FK
        string repeatJobKey
        datetime createdAt
        datetime updatedAt
    }

    RESPONSE {
        string id PK
        string endpointId FK
        int statusCode
        int responseTime
        string status
        string error
        datetime createdAt
    }

    WORKER {
        string id PK
        string hostName
        datetime startedAt
        datetime lastSeenAt
        string status
    }
```

*Note: The `Worker` entity exists independently to log operational processes and metadata, checking the runtime health of daemon instances.*

---

## 4. Telemetry and System Monitoring

The system uses Prometheus to expose application performance metrics, defined inside the shared backend module (`packages/shared`):

1. **HTTP Requests Metrics**: Tracks Express HTTP requests throughput, route-matching latencies, and response codes.
2. **`jobs_processed_total`**: A counter tracking total processed jobs labeled by type (`ping_endpoint` or `send_email`) and outcome status (`completed` or `failed`).
3. **`job_execution_duration_seconds`**: A histogram tracking the execution runtime of background worker jobs to detect Redis or API connection bottlenecks.
