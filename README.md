# FinPilot — AI-Powered Wealth Management Platform

A full-stack personal finance platform for Indian retail investors. Consolidates portfolios across multiple brokers, provides AI-powered stock analysis, IPO insights, NSDL/CDSL depository integration, and intelligent recommendations via pluggable LLM providers.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 18, **npm**
- **Python** ≥ 3.11, **pip**
- **Docker** & **Docker Compose** (recommended for database setup)

### 1. Clone the Repository

```bash
git clone https://github.com/natsv2ai/finpilot.git
cd finpilot
```

### 2. Database Setup

Using Docker Compose (Recommended):
```bash
docker-compose up -d
```
This will start a PostgreSQL instance on port `5433` with the default database `finpilot`. If you prefer to run PostgreSQL locally or use SQLite, modify the `DATABASE_URL` in your `.env` file accordingly.

### 3. Backend Setup

```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate
.venv\Scripts\activate

pip install -r requirements.txt

# Create your environment file from the provided example
cp .env.example .env
```
Open `backend/.env` and configure your keys. You can add your preferred AI provider API Keys (OpenAI, Anthropic, Gemini, HuggingFace) and Broker APIS here.

```bash
# Run the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
Backend API: `http://localhost:8000` · Swagger UI: `http://localhost:8000/docs`

### 4. Frontend Setup

```bash
# Open a new terminal from the project root
cd frontend
npm install
npm run dev
```
Start building your portfolio at `http://localhost:3000`

### 5. Create an Account

Navigate to `http://localhost:3000/register` and create an account.
> **Note:** FinPilot is completely self-hosted. There are no hardcoded demo accounts; authentication is dynamic via the backend API.

### 6. AI Models Configuration

FinPilot supports pluggable LLMs. Simply add your keys in `backend/.env`.

To run entirely free and locally without cloud API keys, use **Ollama**:
1. Install [Ollama](https://ollama.com)
2. Run `ollama pull llama3.2` and `ollama serve`
3. Set `OLLAMA=true` and `OLLAMA_MODEL=llama3.2` in your `backend/.env`.

---

## 📁 Project Structure

```
FinPilot/
├── PRD.md                         # Product Requirements Document
├── ARCHITECTURE.md                # Architecture & knowledge base
├── MCP_LLM_GUIDE.md              # How MCP & LLMs are implemented
│
├── backend/                       # FastAPI Python backend
│   ├── app/
│   │   ├── api/api_v1/           # REST API routes
│   │   │   ├── auth.py           # Register, login, forgot/reset/change password
│   │   │   ├── holdings.py       # Holdings CRUD + CSV auto-format upload
│   │   │   ├── brokers.py        # Broker connections + dynamic listing
│   │   │   ├── ai.py             # LLM-powered stock analysis, chat, news
│   │   │   ├── ipos.py           # IPO tracking + AI analysis
│   │   │   ├── depositories.py   # NSDL/CDSL CAS PDF upload
│   │   │   ├── mcp_router.py     # Unified MCP tool API
│   │   │   └── ... (insights, market, networth, etc.)
│   │   ├── services/
│   │   │   ├── brokers/          # Universal broker wrapper (plugin architecture)
│   │   │   ├── llm/              # Multi-LLM providers (Ollama, HuggingFace, etc.)
│   │   │   ├── depositories/     # CAS PDF parser
│   │   │   └── rag/              # RAG pipeline (ChromaDB + retriever)
│   │   ├── mcp/                  # MCP servers (stock data, news, depository)
│   │   ├── models/               # SQLAlchemy ORM
│   │   └── core/                 # Config, security, dependencies
│   └── requirements.txt
│
└── frontend/                      # Next.js 14 TypeScript
    ├── app/
    │   ├── (dashboard)/           # Protected pages
    │   │   ├── page.tsx           # Dashboard
    │   │   ├── portfolio/         # Portfolio (holdings table + CSV upload)
    │   │   ├── ipos/              # IPO Insights (AI-powered)
    │   │   ├── stock/[symbol]/    # Stock detail + balance sheet + earnings
    │   │   └── settings/          # Profile, security, theme, brokers
    │   ├── login/, register/      # Auth pages (dynamic, no hardcoded values)
    │   ├── forgot-password/       # Password reset flow
    │   └── reset-password/
    ├── components/
    │   ├── layout/                # Sidebar (width-based collapse), Header
    │   └── ui/                    # PasswordInput (eye toggle)
    ├── features/auth/             # Auth hooks, types, services
    └── store/                     # Zustand (auth persistence + logout redirect)
```

---

## ✨ Features

| Category | Feature | Status |
|----------|---------|--------|
| **Auth** | Email/password, phone capture, forgot/reset/change password | ✅ |
| **Dashboard** | Net worth, P&L, day change, allocation, top movers | ✅ |
| **Portfolio** | Holdings, XIRR, broker filter, CSV auto-format upload | ✅ |
| **Stock Detail** | Balance sheet (4Q + 2Y), management earnings call tracker | ✅ |
| **IPO Insights** | Track, filter, AI-powered subscribe/avoid reasoning | ✅ |
| **Broker Integration** | Universal wrapper (Upstox, Zerodha, Groww, AngelOne) | ✅ |
| **NSDL/CDSL** | CAS PDF upload + parsing (pdfplumber) | ✅ |
| **AI/LLM** | Multi-provider (Ollama free, HuggingFace, OpenAI, Gemini, Anthropic) | ✅ |
| **MCP** | 10 tools across stock data, news, depository servers | ✅ |
| **RAG** | ChromaDB vector store + LLM synthesis | ✅ |
| **Other** | Insurance, expenses, family, watchlist, market intelligence | ✅ |

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, AdminLTE v3 inline styles, Zustand |
| **Backend** | FastAPI, SQLAlchemy, Pydantic, python-jose (JWT), bcrypt |
| **Database** | PostgreSQL (psycopg) |
| **AI/LLM** | Ollama (default free), HuggingFace, OpenAI, Gemini, Anthropic |
| **RAG** | ChromaDB, keyword fallback |
| **MCP** | Custom tool servers (stock, news, depository) |
| **PDF** | pdfplumber (CAS parsing) |

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [PRD.md](./PRD.md) | Product requirements, module status, roadmap |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Codebase structure, design decisions, DB schema |
| [MCP_LLM_GUIDE.md](./MCP_LLM_GUIDE.md) | How MCP servers & LLMs work, user journey |

---

## 📝 License MIT

