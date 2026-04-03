# Backend API Architecture

## Route Structure

The backend organizes routes under a single versioned prefix `/api/v1`, with each domain in its own router module.

```mermaid
graph TD
  Main["FastAPI App (main.py)"]
  Router["API Router (/api/v1)"]

  Main --> Router

  Router --> AuthR["auth.py<br/>/auth"]
  Router --> HoldR["holdings.py<br/>/holdings"]
  Router --> PortR["portfolios.py<br/>/portfolio"]
  Router --> InsR["insights.py<br/>/insights"]
  Router --> WatchR["watchlist.py<br/>/watchlist"]
  Router --> UserR["users.py<br/>/users"]

  AuthR --> A1["POST /register"]
  AuthR --> A2["POST /login"]
  AuthR --> A3["GET /me"]

  HoldR --> H1["GET /"]
  HoldR --> H2["POST /"]
  HoldR --> H3["POST /upload-csv"]
  HoldR --> H4["POST /import"]
  HoldR --> H5["GET /{id}/xirr"]

  PortR --> P1["GET /summary"]
  PortR --> P2["GET /allocation"]
  PortR --> P3["GET /performance"]

  InsR --> I1["GET /risk"]
  InsR --> I2["GET /sectors"]
  InsR --> I3["GET /rebalance"]
  InsR --> I4["GET /ideas"]
  InsR --> I5["GET /cards"]

  WatchR --> W1["GET /"]
  WatchR --> W2["POST /"]
  WatchR --> W3["DELETE /{id}"]
```

## Authentication Flow

```mermaid
sequenceDiagram
  participant C as Client
  participant A as Auth Router
  participant S as Security Module
  participant D as Database

  Note over C,D: Registration
  C->>A: POST /register {email, password}
  A->>S: hash_password(password)
  S-->>A: hashed
  A->>D: INSERT User(email, hashed_password)
  A->>S: create_token(user_id)
  A-->>C: {user, token}

  Note over C,D: Login
  C->>A: POST /login {email, password}
  A->>D: SELECT User WHERE email=?
  A->>S: verify_password(password, hash)
  S-->>A: True
  A->>S: create_token(user_id)
  A-->>C: {user, token}

  Note over C,D: Protected Request
  C->>A: GET /me (Authorization: Bearer token)
  A->>S: decode_token(token) → user_id
  A->>D: SELECT User WHERE id=user_id
  A-->>C: {id, email, name}
```

## Dependency Injection

FastAPI's dependency injection system provides:

- **`get_db`** — yields a SQLAlchemy session, auto-closes after request
- **`get_current_user`** — extracts JWT from `Authorization` header, decodes it, and loads the User from DB

All protected routes use `Depends(get_current_user)` to automatically authenticate.

## CSV Upload Pipeline

```mermaid
flowchart TD
  A["Client sends CSV file"] --> B["FastAPI receives UploadFile"]
  B --> C["Read CSV with csv.DictReader"]
  C --> D{"Has required columns?<br/>symbol, quantity, avg_price"}
  D -->|No| E["Return 400 error"]
  D -->|Yes| F["Loop through rows"]
  F --> G{"Row valid?"}
  G -->|No| H["Add to errors list"]
  G -->|Yes| I["Resolve current_price<br/>from DEMO_STOCKS"]
  I --> J["Create Holding record"]
  J --> K["Create Transaction<br/>(for XIRR)"]
  K --> L["Increment success count"]
  H --> M["Continue to next row"]
  L --> M
  M --> N["Return {success, failed, errors}"]
```

## XIRR Calculation

XIRR (Extended Internal Rate of Return) calculates annualized return from irregular cash flows:

1. Fetch all transactions for a holding
2. Map each to `(date, amount)` — buys are negative, sells are positive
3. Add current portfolio value as final positive cash flow (today's date)
4. Use `scipy.optimize.brentq` to find the rate `r` such that `Σ cashflow_i / (1+r)^(days_i/365) = 0`
5. Return `r * 100` as percentage
