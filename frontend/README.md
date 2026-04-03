# FinPilot Frontend

Next.js 14 (App Router) with TypeScript, AdminLTE v3 inline styles, and Zustand for state management.

## Setup

```bash
npm install
npm run dev
```

App: `http://localhost:3000` · Backend must be running on port `8000`.

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | Dynamic auth (no demo credentials) |
| `/register` | Register | Name, email, phone (+91), password |
| `/forgot-password` | Forgot Password | Email-based password reset |
| `/reset-password` | Reset Password | Token-based reset |
| `/` | Dashboard | Net worth, P&L, allocation, top movers |
| `/networth` | Net Worth | Net worth breakdown |
| `/portfolio` | Portfolio | Holdings table, broker filters, CSV upload |
| `/assets` | Assets | Asset management |
| `/watchlist` | Watchlist | Track stocks with 52-week range |
| `/ipos` | **IPO Insights** | IPO tracking with AI analysis (NEW) |
| `/insurance` | Insurance | Policy tracking |
| `/expenses` | Expenses | Expense tracking |
| `/family` | Family | Family financial overview |
| `/insights` | Market Intelligence | Risk, rebalancing, trade ideas |
| `/settings` | Settings | Profile, security, theme, brokers |
| `/stock/[symbol]` | Stock Detail | Balance sheet, earnings calls, analysis |

## Architecture

```
frontend/
├── app/
│   ├── (dashboard)/          # Protected layout (Sidebar + Header + content)
│   │   ├── page.tsx          # Dashboard
│   │   ├── portfolio/        # Holdings table + CSV upload
│   │   ├── ipos/             # IPO Insights (AI-powered)
│   │   ├── stock/[symbol]/   # Stock detail + financials
│   │   └── settings/         # Profile, security, theme, risk, brokers
│   ├── login/                # Dynamic login (no hardcoded credentials)
│   ├── register/             # Register (name, email, phone, password)
│   ├── forgot-password/      # Forgot password flow
│   └── reset-password/       # Reset password flow
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Width-based collapse (0/260px)
│   │   └── Header.tsx        # Title, theme switcher, user menu
│   ├── ui/
│   │   └── PasswordInput.tsx # Eye toggle password visibility
│   └── ThemeProvider.tsx     # 4 themes: midnight, ocean, forest, light
├── features/
│   └── auth/
│       ├── hooks/useAuth.ts  # Login, register, logout (no demo fallback)
│       ├── services/         # API calls
│       └── types.ts          # User, LoginPayload, RegisterPayload (with phone)
├── store/
│   └── useAuthStore.ts       # Zustand — persist user, logout → /login redirect
└── lib/
    ├── api.ts                # Axios instance with token interceptor
    └── utils.ts              # formatCurrency, formatPercent
```

## Design System

- **Style:** AdminLTE v3 — white backgrounds, colored left-border cards
- **CSS:** All inline styles (React `style={{}}`) — no Tailwind in JSX
- **Colors:** `#007bff` blue, `#28a745` green, `#dc3545` red, `#ffc107` amber, `#6f42c1` purple
- **Cards:** `.adminlte-card`, `.adminlte-card-header`, `.adminlte-card-body`
- **Components:** `PasswordInput` (eye toggle) on all auth pages + settings
