# FinPilot Backend

FastAPI backend with JWT auth, PostgreSQL, universal broker wrapper, multi-LLM AI, MCP tool servers, NSDL/CDSL CAS parsing, and RAG pipeline.

## Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Optional extras
pip install pdfplumber    # CAS PDF parsing
pip install yfinance      # Live stock data (MCP)
pip install chromadb      # RAG vector store

# Run the server
python -m uvicorn app.main:app --reload --port 8000
```

API: `http://localhost:8000` · Swagger docs: `http://localhost:8000/docs`

## Environment Variables (.env)

```env
DATABASE_URL=postgresql+psycopg://finpilot:finpilot123@localhost:5433/finpilot
SECRET_KEY=change-this-in-production

# LLM (Ollama is free default — install from https://ollama.com)
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2

# Optional paid LLMs
OPENAI_API_KEY=
GEMINI_API_KEY=
ANTHROPIC_API_KEY=
HUGGINGFACE_API_KEY=

# Broker API keys (optional)
UPSTOX_API_KEY=
ZERODHA_API_KEY=
GROWW_API_KEY=
ANGELONE_API_KEY=

# Email (password reset)
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | No | Register (name, email, phone, password) |
| POST | `/api/v1/auth/login` | No | Login → JWT token |
| GET | `/api/v1/auth/me` | Yes | Current user profile |
| POST | `/api/v1/auth/forgot-password` | No | Send reset email |
| POST | `/api/v1/auth/reset-password` | No | Reset with token |
| PUT | `/api/v1/auth/change-password` | Yes | Change password |

### Portfolio & Holdings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/holdings` | List holdings (filter: broker, asset_type) |
| POST | `/api/v1/holdings` | Create holding |
| POST | `/api/v1/holdings/upload-csv` | CSV upload (auto-format detection) |
| POST | `/api/v1/holdings/import` | Mock broker import |

### AI / LLM
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ai/providers` | List available LLM providers |
| PUT | `/api/v1/ai/provider` | Switch active LLM |
| POST | `/api/v1/ai/analyze-stock` | AI stock analysis |
| POST | `/api/v1/ai/chat` | General AI chat |
| POST | `/api/v1/ai/summarize-news` | News summarization |

### IPO
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/ipos` | List IPOs (filter: status, sector) |
| POST | `/api/v1/ipos` | Create IPO |
| PUT | `/api/v1/ipos/{id}` | Update IPO data |
| POST | `/api/v1/ipos/analyze` | AI IPO analysis |

### MCP
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/mcp/tools` | List all MCP tools |
| POST | `/api/v1/mcp/call` | Execute an MCP tool |

### Depository
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/depositories/upload-cas` | Upload CAS PDF |
| GET | `/api/v1/depositories/info` | NSDL/CDSL instructions |

### Brokers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/brokers/available` | List registered brokers (dynamic) |
| GET | `/api/v1/brokers/status` | User's broker connections |
| GET | `/api/v1/brokers/connect/{broker}` | Get OAuth URL |
| POST | `/api/v1/brokers/callback/{broker}` | OAuth callback |
| POST | `/api/v1/brokers/sync/{broker}` | Sync holdings |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST/DELETE | `/api/v1/watchlist` | Watchlist CRUD |
| GET/PUT | `/api/v1/users/profile` | Profile CRUD |
| GET | `/api/v1/insights/*` | Risk, rebalance, ideas |
| GET | `/api/v1/networth/*` | Net worth summary |
| GET | `/api/v1/expenses/*` | Expense tracking |
| GET | `/api/v1/insurance/*` | Insurance tracking |

## Key Architecture

```
app/
├── services/
│   ├── brokers/         # BrokerBase → registry → 4 implementations
│   ├── llm/             # LLMBase → registry → Ollama, HuggingFace, etc.
│   ├── depositories/    # CAS PDF parser (pdfplumber)
│   └── rag/             # VectorStore (ChromaDB) + Retriever
├── mcp/                 # 3 MCP servers (stock data, news, depository)
└── api/api_v1/          # REST routes
```
