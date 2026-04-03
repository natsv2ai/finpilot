# FinPilot — System Architecture

## High-Level Overview

FinPilot is a full-stack portfolio management application with a clear separation between the Next.js frontend and FastAPI backend, connected via REST API over HTTP.

```mermaid
graph TB
  subgraph Client["Frontend (Next.js 16)"]
    Browser["Browser"]
    Pages["App Router Pages"]
    Features["Feature Modules"]
    Store["Zustand Store"]
    Axios["Axios + JWT Interceptor"]
  end

  subgraph Server["Backend (FastAPI)"]
    Router["API Router /api/v1"]
    Auth["Auth Middleware"]
    Routes["Route Handlers"]
    Models["SQLAlchemy Models"]
    DB["SQLite Database"]
    XIRR["XIRR Engine (scipy)"]
  end

  Browser --> Pages
  Pages --> Features
  Features --> Store
  Features --> Axios
  Axios -->|"HTTP + JWT Bearer"| Router
  Router --> Auth
  Auth --> Routes
  Routes --> Models
  Models --> DB
  Routes --> XIRR
```

### How it works

1. **User opens browser** → Next.js serves the SPA
2. **Login** → Frontend sends credentials to `/api/v1/auth/login`, receives JWT
3. **JWT is stored** in `localStorage` and attached to every subsequent request via Axios interceptor
4. **Protected pages** (dashboard, portfolio, etc.) are wrapped in `AuthGuard` which redirects to `/login` if no token
5. **API calls** hit the FastAPI backend, which validates the JWT, queries SQLite, and returns JSON
6. **Demo mode** — if the backend is unreachable, all hooks fall back to hardcoded demo data

---

## Request Flow

```mermaid
sequenceDiagram
  participant U as User (Browser)
  participant F as Next.js Frontend
  participant A as Axios Interceptor
  participant B as FastAPI Backend
  participant D as SQLite DB

  U->>F: Navigate to /portfolio
  F->>F: AuthGuard checks token
  F->>A: getHoldings()
  A->>A: Attach JWT to header
  A->>B: GET /api/v1/holdings
  B->>B: Verify JWT, extract user_id
  B->>D: SELECT * FROM holdings WHERE user_id=?
  D-->>B: Holdings rows
  B-->>A: JSON response
  A-->>F: Holding[] data
  F-->>U: Render holdings table
```

---

## Deployment Architecture

```mermaid
graph LR
  subgraph Development
    FE["npm run dev :3000"]
    BE["uvicorn :8000"]
    DB["finpilot.db (SQLite)"]
  end

  FE -->|API calls| BE
  BE --> DB
```

For production, the frontend can be built as a static export (`next build`) and served via any CDN/static hosting. The backend can be deployed to any Python hosting (Railway, Render, EC2) with the SQLite file, or swapped to PostgreSQL by changing `DATABASE_URL`.
