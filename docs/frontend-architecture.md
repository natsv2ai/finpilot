# Frontend Architecture

## Page Routing

The frontend uses Next.js App Router with route groups for layout separation.

```mermaid
graph TD
  Root["/ (Root Layout)"]
  Root --> Login["/login (Public)"]
  Root --> Register["/register (Public)"]
  Root --> DashGroup["(dashboard) Layout Group"]

  DashGroup --> AuthGuard["AuthGuard Component"]
  AuthGuard --> Sidebar["Sidebar + Header"]

  Sidebar --> Dashboard["/ Dashboard"]
  Sidebar --> Portfolio["/portfolio"]
  Sidebar --> Insights["/insights"]
  Sidebar --> Watchlist["/watchlist"]
  Sidebar --> Settings["/settings"]
```

The `(dashboard)` route group wraps all authenticated pages in a shared layout with Sidebar and Header. The `AuthGuard` component redirects to `/login` if no JWT token is found.

## Feature Module Pattern

Each feature follows the same structure for consistency and maintainability:

```mermaid
graph LR
  subgraph Feature Module
    Types["types.ts<br/>(interfaces)"]
    Service["services/<br/>featureService.ts"]
    Hook["hooks/<br/>useFeature.ts"]
  end

  Page["Page Component"]
  API["Backend API"]

  Page --> Hook
  Hook --> Service
  Service --> API
  Hook --> Types
  Service --> Types
```

### Example: Portfolio Feature

| File | Purpose |
|------|---------|
| `features/portfolio/types.ts` | `Holding`, `PortfolioSummary`, `AllocationItem`, `CSVUploadResult` |
| `features/portfolio/services/portfolioService.ts` | API calls: `getHoldings()`, `getPortfolioSummary()`, `uploadCSV()` |
| `features/portfolio/hooks/usePortfolio.ts` | React hook with state, loading, demo fallback |

## State Management

```mermaid
graph TD
  subgraph Zustand Store
    AuthStore["useAuthStore<br/>user, token, login(), logout()"]
  end

  subgraph Feature Hooks
    UP["usePortfolio()"]
    UI["useInsights()"]
    UW["useWatchlist()"]
  end

  subgraph localStorage
    JWT["finpilot_token"]
  end

  AuthStore -->|"persist token"| JWT
  JWT -->|"read on init"| AuthStore
  AuthStore -->|"isAuthenticated"| AuthGuard["AuthGuard"]
  UP -->|"API calls"| Axios
  UI -->|"API calls"| Axios
  UW -->|"API calls"| Axios
  Axios -->|"attach token"| JWT
```

- **Global state:** Only auth (user + token) is in Zustand
- **Feature state:** Each page's data lives in its own hook (`useState` + `useEffect`)
- **Demo fallback:** If API calls fail, hooks serve hardcoded demo data — the app works without a running backend

## Component Hierarchy

```mermaid
graph TD
  DashLayout["Dashboard Layout"]
  DashLayout --> SB["Sidebar"]
  DashLayout --> HD["Header"]
  DashLayout --> Main["Main Content Area"]

  Main --> DashPage["Dashboard Page"]
  DashPage --> StatsGrid["Stats Grid (4 cards)"]
  DashPage --> PerfChart["Performance AreaChart"]
  DashPage --> AllocDonut["Allocation PieChart"]
  DashPage --> Movers["Top Gainers / Losers"]

  Main --> PortPage["Portfolio Page"]
  PortPage --> Filters["Tab Filters"]
  PortPage --> HoldTable["Holdings DataTable"]
  PortPage --> CSVModal["CSV Upload Modal"]

  Main --> InsPage["Insights Page"]
  InsPage --> Cards["Insight Cards"]
  InsPage --> RiskDash["Risk Metrics Grid"]
  InsPage --> Rebal["Rebalancing Suggestions"]
  InsPage --> Ideas["Trade Ideas Grid"]

  Main --> WatchPage["Watchlist Page"]
  WatchPage --> WatchGrid["Stock Cards Grid"]
  WatchPage --> AddModal["Add Stock Modal"]
```

## Design System

The design uses CSS custom properties defined in `globals.css`:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0e1a` | Page background |
| `--bg-card` | `rgba(17,24,39,0.7)` | Glass card background |
| `--accent` | `#6366f1` | Primary accent (indigo) |
| `--green` | `#10b981` | Positive values, gains |
| `--red` | `#ef4444` | Negative values, losses |
| `--border` | `rgba(255,255,255,0.08)` | Subtle glass borders |

Key CSS classes: `.card`, `.stat-card`, `.data-table`, `.btn`, `.badge`, `.tab-pills`, `.upload-zone`
