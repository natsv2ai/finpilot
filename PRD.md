# FinPilot — Product Requirements Document (PRD)

## Product Vision
**FinPilot** is an AI-powered personal finance manager that consolidates a user's entire financial portfolio across multiple brokers, depositories (NSDL/CDSL), and asset classes into a single unified dashboard. It provides intelligent analysis, predictions, and actionable insights using LLM-powered AI — making complex financial data simple and actionable.

---

## Target Users
- **Retail Indian investors** with holdings across multiple brokers (Zerodha, Groww, Upstox, Angel One, etc.)
- **HNIs** tracking diverse portfolios (stocks, mutual funds, insurance, real estate)
- **Families** managing combined household finances

---

## Core Modules

### 1. Authentication & User Management
| Feature | Status | Notes |
|---------|--------|-------|
| Email + Password registration | ✅ Done | |
| Login with JWT tokens | ✅ Done | |
| Forgot/Reset password | ✅ Done | Email-based |
| Change password (authenticated) | ✅ Done | |
| Phone number capture | ✅ Done | +91 prefix, 10-digit |
| Phone OTP login | 🔲 Planned | SMS gateway integration |
| MFA (Two-Factor) | 🔲 Planned | TOTP or SMS |

### 2. Dashboard
| Feature | Status |
|---------|--------|
| Portfolio summary widgets | ✅ Done |
| Total net worth | ✅ Done |
| Asset allocation pie | ✅ Done |
| Top gainers/losers | ✅ Done |
| Day change overview | ✅ Done |

### 3. Portfolio Management
| Feature | Status | Notes |
|---------|--------|-------|
| View all holdings (stocks + MF) | ✅ Done | |
| Filter by broker, asset type | ✅ Done | |
| CSV upload (manual import) | ✅ Done | |
| CSV auto-format detection | 🔄 In Progress | Accepts any broker export format |
| Individual stock detail page | ✅ Done | AdminLTE v3 style |
| Balance sheet summary (4Q + 2Y) | ✅ Done | Static data for 5 stocks |
| Management earnings call tracker | ✅ Done | Promise delivery analysis |
| Growth projections (CAGR) | ✅ Done | |
| XIRR calculation | ✅ Done | |

### 4. Broker Integration
| Feature | Status | Notes |
|---------|--------|-------|
| Upstox OAuth2 | ✅ Done | API key required |
| Zerodha Kite Connect | ✅ Done | API key required |
| Groww OAuth | ✅ Done | API key required |
| Angel One TOTP | ✅ Done | TOTP-based |
| Universal broker wrapper | 🔲 Planned | Plugin architecture |
| Custom broker registration | 🔲 Planned | User-provided config |

### 5. Depository Integration (NSDL/CDSL)
| Feature | Status | Notes |
|---------|--------|-------|
| CAS PDF upload + parsing | 🔲 Planned | pdfplumber |
| NSDL e-services redirect | 🔲 Planned | TPIN verification |
| CDSL Easi/Easiest parsing | 🔲 Planned | |

### 6. AI/LLM-Powered Features
| Feature | Status | Notes |
|---------|--------|-------|
| Multi-LLM provider support | ✅ Done | Intelligent dynamic routing (OpenAI, Anthropic, Gemini, HuggingFace Fallback) |
| Stock analysis (LLM) | 🔲 Planned | Balance sheet + management commentary |
| News feed (LLM summarized) | 🔲 Planned | |
| Real Estate Predictor | ✅ Done | LLM guided by DuckDuckGo live web-crawling |
| RAG for company filings | 🔲 Planned | ChromaDB + sentence-transformers |

### 7. Other Financial Modules
| Module | Status |
|--------|--------|
| Net Worth tracker | ✅ Done |
| Asset management | ✅ Done |
| Watchlist | ✅ Done |
| Insurance tracker | ✅ Done |
| Expense tracker | ✅ Done |
| Family finance | ✅ Done |
| Market Intelligence/Insights | ✅ Done |

### 8. Infrastructure
| Feature | Status | Notes |
|---------|--------|-------|
| MCP servers (stock data, news, depository) | 🔲 Planned | |
| RAG vector store | 🔲 Planned | ChromaDB |
| Settings (profile, theme, security, brokers) | ✅ Done | AdminLTE v3 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Inline CSS (AdminLTE v3 design) |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic |
| **Database** | PostgreSQL (psycopg) |
| **Auth** | JWT (python-jose), bcrypt, localStorage |
| **AI/LLM** | Ollama (default), HuggingFace, OpenAI, Gemini, Anthropic |
| **RAG** | ChromaDB, sentence-transformers |
| **MCP** | FastMCP Python SDK |
| **PDF Parsing** | pdfplumber |
| **State** | Zustand (frontend), SQLAlchemy ORM (backend) |

---

## UI Design Language
- **AdminLTE v3** — white backgrounds, clean cards with colored left-border headers
- All inline styles (no Tailwind CSS classes in component JSX)
- Professional typography: system fonts, proper weight hierarchy
- Color palette: `#007bff` (primary), `#28a745` (green), `#dc3545` (red), `#ffc107` (amber), `#6f42c1` (purple)
- Cards use `.adminlte-card`, `.adminlte-card-header`, `.adminlte-card-body` classes
- Badges, filter pills, and tables follow consistent styling

---

## API Architecture
- Base URL: `http://localhost:8000/api/v1`
- Auth: Bearer token in `Authorization` header
- CORS: `localhost:3000`
- Key routes: `/auth/*`, `/holdings/*`, `/brokers/*`, `/users/*`, `/expenses/*`, `/insurance/*`, `/family/*`, `/insights/*`, `/market/*`, `/networth/*`, `/assets/*`, `/watchlist/*`
- Planned: `/ai/*`, `/depositories/*`

---

## Non-Functional Requirements
1. **Performance**: Dashboard loads under 2 seconds
2. **Security**: Passwords hashed (bcrypt), JWT tokens with 7-day expiry
3. **Responsiveness**: All pages work on mobile (sidebar collapses)
4. **Extensibility**: Broker wrapper supports adding new brokers via plugins
5. **Cost**: Free LLM tier available for development (Ollama/HuggingFace)
6. **Data Privacy**: All financial data stored locally, no third-party data sharing
