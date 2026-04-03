# FinPilot — Architecture & Knowledge Base

## Project Structure

```
d:\FinPilot\
├── PRD.md                          # Product Requirements Document
├── ARCHITECTURE.md                 # This file
├── backend/                        # FastAPI Python backend
│   ├── app/
│   │   ├── main.py                 # FastAPI app entry point
│   │   ├── api/api_v1/             # All API route handlers
│   │   │   ├── auth.py             # Login, register, forgot/reset/change password
│   │   │   ├── holdings.py         # Portfolio holdings CRUD + CSV upload
│   │   │   ├── brokers.py          # Broker OAuth2 connect/sync/disconnect
│   │   │   ├── expenses.py         # Expense tracking
│   │   │   ├── insurance.py        # Insurance policies
│   │   │   ├── family.py           # Family members
│   │   │   ├── insights.py         # Market intelligence
│   │   │   ├── market.py           # Market data endpoints
│   │   │   ├── networth.py         # Net worth calculation
│   │   │   ├── assets.py           # Asset management
│   │   │   ├── watchlist.py        # Stock watchlist
│   │   │   ├── users.py            # User profile updates
│   │   │   └── router.py           # Router aggregation
│   │   ├── models/                 # SQLAlchemy ORM models
│   │   │   ├── user.py             # User (email, password, name, phone, risk_appetite)
│   │   │   ├── holding.py          # Holding + Transaction
│   │   │   └── broker_connection.py # Stored broker OAuth tokens
│   │   ├── schemas/                # Pydantic schemas
│   │   ├── core/
│   │   │   ├── config.py           # Settings (DB, SMTP, broker keys, CORS)
│   │   │   ├── security.py         # JWT, password hashing
│   │   │   └── dependencies.py     # get_current_user dependency
│   │   ├── db/
│   │   │   ├── database.py         # Engine + SessionLocal
│   │   │   └── base.py             # SQLAlchemy Base
│   │   └── utils/
│   │       ├── helpers.py          # XIRR calculation
│   │       ├── constants.py        # DEMO_STOCKS data
│   │       └── email_service.py    # Password reset emails
│   └── requirements.txt            # Python dependencies
│
└── frontend/                       # Next.js 14 TypeScript frontend
    ├── app/
    │   ├── (dashboard)/            # Authenticated layout group
    │   │   ├── layout.tsx          # Sidebar + Header + content
    │   │   ├── page.tsx            # Dashboard
    │   │   ├── networth/page.tsx
    │   │   ├── portfolio/page.tsx
    │   │   ├── assets/page.tsx
    │   │   ├── watchlist/page.tsx
    │   │   ├── insurance/page.tsx
    │   │   ├── expenses/page.tsx
    │   │   ├── family/page.tsx
    │   │   ├── insights/page.tsx
    │   │   ├── settings/page.tsx   # Profile, Security, Theme, Risk, Brokers
    │   │   └── stock/[symbol]/
    │   │       ├── page.tsx        # Stock detail (AdminLTE + financials)
    │   │       └── financialData.ts # Balance sheet + earnings calls data
    │   ├── login/page.tsx          # Login (dynamic, no demo credentials)
    │   ├── register/page.tsx       # Register (name, email, phone, password)
    │   ├── forgot-password/page.tsx
    │   └── reset-password/page.tsx
    ├── components/
    │   ├── layout/
    │   │   ├── Sidebar.tsx         # Width-based collapse (0/260px)
    │   │   └── Header.tsx          # Pure inline styles, theme/user dropdowns
    │   ├── ui/
    │   │   └── PasswordInput.tsx   # Eye toggle show/hide password
    │   └── ThemeProvider.tsx       # 4 themes: midnight, ocean, forest, light
    ├── features/
    │   ├── auth/
    │   │   ├── hooks/useAuth.ts    # Login, register, logout (no demo fallback)
    │   │   ├── services/authService.ts
    │   │   └── types.ts            # User, LoginPayload, RegisterPayload
    │   └── portfolio/
    │       ├── hooks/usePortfolio.ts
    │       ├── services/portfolioService.ts
    │       └── types.ts
    ├── store/
    │   └── useAuthStore.ts         # Zustand store, persists user, logout→/login
    └── lib/
        ├── api.ts                  # Axios instance with token interceptor
        ├── utils.ts                # formatCurrency, formatPercent
        └── constants.ts            # TOKEN_KEY
```

## Key Design Decisions

### 1. UI: AdminLTE v3 with Inline Styles
- All components use **inline styles** (React `style={{}}` props)
- No Tailwind CSS classes in JSX — only global AdminLTE CSS classes for cards
- Cards use: `.adminlte-card`, `.adminlte-card-header` (with left border color), `.adminlte-card-body`
- Color palette: `#007bff` blue, `#28a745` green, `#dc3545` red, `#ffc107` amber, `#6f42c1` purple

### 2. Auth: JWT + Zustand
- Backend creates JWT with `{sub: user_id}`, 7-day expiry
- Frontend stores token in `localStorage` via Zustand (`useAuthStore`)
- `useAuth` hook wraps login/register/logout — NO demo fallback
- Logout clears localStorage and redirects to `/login` via `window.location.href`

### 3. Sidebar: Width-Based Collapse
- Uses CSS transition on `width` property (0px ↔ 260px)
- Starts open by default (`useState(true)` in layout.tsx)
- Main content uses `marginLeft` matching sidebar width

### 4. Broker Integration Architecture
- Current: 4 hardcoded brokers with OAuth2 URLs in `brokers.py`
- Planned: Universal wrapper with `BrokerBase` abstract class and registry pattern

### 5. Data Flow
```
User → Frontend (Next.js) → API call → FastAPI → SQLAlchemy → PostgreSQL
                                          ↓
                                    Broker APIs (OAuth2) & Web Scraper (DuckDuckGo Search)
                                          ↓
                                    Premium LLM Providers (OpenAI/Anthropic) or HuggingFace Fallback
```

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | Integer PK | Auto-increment |
| email | String UNIQUE | Login identifier |
| hashed_password | String | bcrypt hash |
| name | String | Display name |
| phone | String nullable | For MFA/OTP |
| risk_appetite | String | conservative/moderate/aggressive |
| reset_token | String nullable | Password reset |
| reset_token_expiry | DateTime nullable | |
| created_at | DateTime | Server default now() |

### holdings
| Column | Type |
|--------|------|
| id | Integer PK |
| user_id | Integer FK→users |
| symbol | String |
| name | String |
| asset_type | String (stock/mutual_fund) |
| quantity | Float |
| avg_price | Float |
| current_price | Float |
| broker | String |
| sector | String |

### transactions
| Column | Type |
|--------|------|
| id | Integer PK |
| holding_id | Integer FK→holdings |
| user_id | Integer FK→users |
| txn_type | String (buy/sell) |
| quantity | Float |
| price | Float |
| date | DateTime |

### broker_connections
| Column | Type |
|--------|------|
| id | Integer PK |
| user_id | Integer FK→users |
| broker_name | String |
| access_token | String |
| status | String |
| last_synced | DateTime nullable |

## Environment Variables (.env)
```
DATABASE_URL=postgresql+psycopg://finpilot:finpilot123@localhost:5433/finpilot
SECRET_KEY=<change-in-production>
UPSTOX_API_KEY=
ZERODHA_API_KEY=
GROWW_API_KEY=
ANGELONE_API_KEY=
NEWS_API_KEY=
SMTP_HOST=
LLM_PROVIDER=huggingface
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
HUGGINGFACE_API_KEY=
```
