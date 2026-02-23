# Candor — Product Architecture

> Real-time observability platform for AI agents. Intercepts, logs, and visualizes every action AI agents take through MCP servers.

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.1.6 | App Router, React Server Components, API Routes |
| Language | TypeScript | 5.x | Type safety across frontend and backend |
| UI | React | 19.2.3 | Component rendering |
| Styling | Tailwind CSS | 4.x | Utility-first CSS with `@theme inline` for custom tokens |
| PostCSS | @tailwindcss/postcss | 4.x | Tailwind processing pipeline |
| Icons | Phosphor Icons | 2.1.10 | Consistent duotone icon system (uses `Icon` suffix for Turbopack) |
| Animation | Motion (Framer Motion) | 12.34.3 | React animation library |
| Auth | Solana Wallet Adapter | 0.15.39 | Wallet-based authentication (Phantom + Solflare) |
| Blockchain | @solana/web3.js | 1.98.4 | Solana connection and wallet operations |
| Database | PostgreSQL | — | Event storage, sessions, alerts (not yet integrated) |
| ORM | Prisma | 6.x | Database schema and queries (not yet integrated) |
| Deployment | Railway | — | Target deployment platform |

---

## Project Structure

```
candor/
├── app/
│   ├── layout.tsx                  # Root layout — fonts, metadata, grain overlay
│   ├── page.tsx                    # Landing page — assembles all sections
│   ├── globals.css                 # Theme tokens, animations, component styles
│   ├── favicon.ico
│   └── dashboard/
│       ├── layout.tsx              # Dashboard layout — SolanaWalletProvider wrapper
│       └── page.tsx                # Dashboard page — wallet state router
│
├── components/
│   ├── landing/                    # Public marketing page components
│   │   ├── Navbar.tsx              # Sticky nav with scroll detection, mobile menu
│   │   ├── Hero.tsx                # Full-viewport hero with parallax + PrismVisual
│   │   ├── PrismVisual.tsx         # SVG prism with animated light beams + particles
│   │   ├── Features.tsx            # 5-card feature grid with intersection observer
│   │   ├── HowItWorks.tsx          # 4-step setup flow with connector arrows
│   │   ├── DashboardDemo.tsx       # Interactive demo with live event generation
│   │   └── Footer.tsx              # Links, social buttons, version badge
│   │
│   ├── dashboard/                  # Authenticated dashboard components
│   │   ├── LiveDashboard.tsx       # Full dashboard app (sidebar + 6 pages)
│   │   ├── DashboardContent.tsx    # Demo-mode dashboard shell (tabs + events)
│   │   ├── OnboardingGuide.tsx     # Welcome panel for unauthenticated users
│   │   ├── WalletButton.tsx        # Connect/disconnect wallet button
│   │   └── EmptyState.tsx          # Reusable empty state component
│   │
│   └── providers/
│       └── SolanaWalletProvider.tsx # Solana wallet context providers
│
├── public/
│   └── mascot.png                  # Prism mascot icon (used as favicon + branding)
│
├── Configuration
│   ├── package.json
│   ├── tsconfig.json               # Strict mode, @/* path alias
│   ├── next.config.ts              # Default Next.js 16 config
│   ├── postcss.config.mjs          # @tailwindcss/postcss plugin
│   └── eslint.config.mjs           # Next.js ESLint config
│
└── Documentation
    ├── PROJECT_SPEC.md             # Full product specification and database schema
    └── ARCHITECTURE.md             # This file
```

---

## Design System

### Color Tokens

```css
--bg-deep:        #06070f       /* Deepest background */
--bg-surface:     #0c0e1a       /* Card/panel surface */
--bg-card:        #111326       /* Elevated card */
--border-subtle:  rgba(139, 92, 246, 0.12)
--border-glow:    rgba(99, 102, 241, 0.3)
--text-primary:   #f0f0f5       /* Headings, emphasis */
--text-secondary: #8b8fa3       /* Body text */
--text-muted:     #4a4e69       /* Labels, captions */
--accent-blue:    #3b82f6
--accent-violet:  #8b5cf6
--accent-cyan:    #06b6d4
--accent-indigo:  #6366f1
```

### Typography

| Role | Font | CSS Variable | Usage |
|------|------|-------------|-------|
| Display/Headings | Bricolage Grotesque | `--font-bricolage` | h1-h3, brand name, page titles |
| Body/UI | Figtree | `--font-figtree` | Body text, labels, buttons, nav links |
| Monospace/Data | IBM Plex Mono | `--font-ibm-plex-mono` | Code snippets, metrics, timestamps, wallet addresses |

All fonts loaded via `next/font/google` with `display: "swap"` and CSS variable injection. Font choices are intentionally distinctive — Bricolage Grotesque provides a characterful geometric display face, Figtree is clean and crisp for UI, and IBM Plex Mono is refined for data-heavy interfaces.

### Icon System

- **Library**: Phosphor Icons v2 (`@phosphor-icons/react`)
- **Import pattern**: Named exports with `Icon` suffix required for Turbopack compatibility
  ```tsx
  import { ActivityIcon as Activity } from "@phosphor-icons/react";
  ```
- **Weight**: `duotone` for decorative, `bold` for action icons, `fill` for active states
- **Sizing**: 14-16px for inline, 18-24px for feature icons, 32-40px for empty states

---

## Authentication Flow

### Solana Wallet Integration

**Provider hierarchy** (scoped to `/dashboard` only):
```
SolanaWalletProvider
  └── ConnectionProvider (mainnet-beta RPC)
      └── WalletProvider (Phantom + Solflare adapters, autoConnect)
          └── WalletModalProvider
              └── Dashboard pages
```

**Excluded**: Hardware wallets with USB dependencies (Ledger) per project constraints.

**Auth flow**:
1. User visits `/dashboard` (unauthenticated)
2. Sees OnboardingGuide + DashboardContent in demo mode
3. Clicks "Connect Wallet" — wallet selection modal opens
4. Approves connection in wallet extension (Phantom/Solflare)
5. `useWallet()` returns `connected: true` + `publicKey`
6. Page re-renders with LiveDashboard (full app)
7. Wallet address used as account identifier
8. Disconnect returns to unauthenticated state

**Wallet adapter CSS overrides**: Themed in `globals.css` to match Candor dark palette.

---

## Page Architecture

### Landing Page (`/`)

```
Navbar         — Fixed, scroll-reactive, mobile hamburger
Hero           — Parallax prism visual, staggered entry animations
Features       — 5-card grid, intersection observer reveal
HowItWorks    — 4-step horizontal flow
DashboardDemo — Interactive demo (auto-generating events)
Footer         — Links, socials, copyright
```

### Dashboard (`/dashboard`)

**Unauthenticated state**:
```
Header         — Logo, "Back to Home" link, Connect Wallet button
OnboardingGuide — Welcome message, 3 setup steps, wallet CTA
DashboardContent — Demo mode (auto-generated events, tabs, stats)
```

**Authenticated state**:
```
Header         — Logo, "Dashboard" label, wallet badge, Disconnect
LiveDashboard  — Sidebar (220px) + Main content area
  ├── Overview    — Status cards, Quick Setup, Proxy Config, Activity feed
  ├── Timeline    — Real-time event stream with filter
  ├── Sessions    — Historical session table
  ├── Costs       — Cost attribution with metric cards
  ├── Alerts      — Alert rule cards with toggles, triggered alerts
  └── Settings    — Account info, API key, proxy configuration
```

---

## Data Flow (Target Architecture)

```
AI Agent (Claude, Cursor, etc.)
    │
    │ MCP JSON-RPC (stdio/SSE)
    ▼
Candor Proxy (:3100)
    │
    ├── Forward to MCP Server(s) → Response back to Agent
    │
    ├── Log events → PostgreSQL (via Prisma)
    │
    └── Stream events → WebSocket (:3101)
                             │
                             ▼
                     Dashboard (:3200 / Next.js)
                             │
                             ├── Live Timeline (WebSocket feed)
                             ├── Session Explorer (DB queries)
                             ├── Cost Dashboard (aggregations)
                             └── Alerts (rule evaluation)
```

---

## Database Schema (Prisma)

Defined in PROJECT_SPEC.md. Key models:

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Session` | Groups related MCP events | id, agentId, startedAt, endedAt, totalCostEstimate |
| `Event` | Individual MCP request/response | sessionId, method, toolName, params, result, latencyMs, costEstimate |
| `AlertRule` | User-defined alert conditions | name, condition (JSON), webhookUrl, enabled |
| `Alert` | Triggered alert instances | ruleId, sessionId, eventId, message, acknowledged |
| `CostRate` | LLM pricing configuration | provider, model, inputPer1kTokens, outputPer1kTokens |

---

## API Routes (To Be Implemented)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/sessions` | List sessions (paginated, filterable) |
| GET | `/api/sessions/[id]` | Session detail with events |
| GET | `/api/events` | Query events across sessions |
| GET | `/api/stats` | Aggregated cost/usage statistics |
| GET | `/api/alerts` | List triggered alerts |
| POST | `/api/alert-rules` | Create alert rule |
| PUT | `/api/alert-rules/[id]` | Update alert rule |
| DELETE | `/api/alert-rules/[id]` | Delete alert rule |
| GET | `/api/cost-rates` | List cost rate configs |
| PUT | `/api/cost-rates/[id]` | Update cost rate |
| WS | `/ws` | WebSocket for live event stream |

---

## What's Built vs What's Needed

### Built (Frontend)

| Feature | Status | Location |
|---------|--------|----------|
| Landing page (all 6 sections) | Complete | `app/page.tsx`, `components/landing/*` |
| Interactive demo dashboard | Complete | `components/landing/DashboardDemo.tsx` |
| Solana wallet auth | Complete | `components/providers/SolanaWalletProvider.tsx` |
| Wallet connect/disconnect UI | Complete | `components/dashboard/WalletButton.tsx` |
| Dashboard with 6 pages | Complete | `components/dashboard/LiveDashboard.tsx` |
| Onboarding guide | Complete | `components/dashboard/OnboardingGuide.tsx` |
| Responsive landing page | Complete | All landing components |
| Dark theme with design tokens | Complete | `app/globals.css` |
| Wallet adapter theme overrides | Complete | `app/globals.css` |

### Needed (Backend + Integration)

| Feature | Priority | Description |
|---------|----------|-------------|
| **Prisma schema + migrations** | P0 | Set up PostgreSQL with models from PROJECT_SPEC.md |
| **MCP Proxy server** | P0 | Node.js JSON-RPC interceptor on `:3100` that captures all MCP traffic |
| **WebSocket server** | P0 | Stream intercepted events to connected dashboard clients |
| **API routes** | P0 | Next.js API routes for sessions, events, stats, alerts, cost-rates |
| **Live timeline integration** | P1 | Connect LiveDashboard Timeline page to WebSocket feed |
| **Session explorer integration** | P1 | Connect Sessions page to `/api/sessions` |
| **Cost dashboard integration** | P1 | Connect Costs page to `/api/stats` + `/api/cost-rates` |
| **Alert rule CRUD** | P1 | Connect Alerts page to `/api/alert-rules` |
| **Webhook delivery** | P2 | HTTP POST for triggered alerts to user-configured URLs |
| **Settings persistence** | P2 | Save proxy config, retention settings to DB |
| **Railway deployment config** | P2 | Procfile, environment variables, PostgreSQL add-on |
| **Data retention cleanup** | P3 | Scheduled job to purge events older than retention period |
| **Token estimation** | P3 | Approximate token counts from payload sizes for cost calc |

### Needed (CLI Package)

| Feature | Priority | Description |
|---------|----------|-------------|
| **`@candor/proxy` npm package** | P0 | CLI tool: `candor start` launches proxy + dashboard |
| **Proxy config file** | P0 | `candor.config.json` for upstream MCP server addresses |
| **stdio interception** | P0 | Intercept stdio-based MCP connections (local agents) |
| **SSE interception** | P1 | Intercept SSE-based MCP connections (remote servers) |
| **`candor init`** | P2 | Generate config file with guided setup |

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/candor

# Proxy
PROXY_PORT=3100
DASHBOARD_PORT=3200
WEBSOCKET_PORT=3101

# Solana (frontend)
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com

# Optional
WEBHOOK_SECRET=<for verifying webhook deliveries>
LOG_RETENTION_DAYS=7
MAX_EVENTS_PER_SESSION=1000
```

---

## Deployment (Railway)

Target deployment as two services:

1. **Web App** (Next.js) — Dashboard UI + API routes
   - Build: `npm run build`
   - Start: `npm start`
   - Port: `$PORT` (Railway-assigned)

2. **Proxy Server** (Node.js) — MCP traffic interceptor
   - Start: `node proxy/server.js`
   - Ports: 3100 (proxy), 3101 (WebSocket)

3. **PostgreSQL** — Railway managed database add-on

---

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev          # → http://localhost:3001

# Build for production
npm run build

# Lint
npm run lint
```

### Key Conventions

- **Font imports**: Use `next/font/google` with CSS variable injection
- **Icon imports**: Always use `Icon` suffix (Turbopack requirement): `ActivityIcon as Activity`
- **Styling**: Inline `style={}` for component-specific styles, Tailwind utilities for layout, CSS variables for theme tokens
- **State management**: React `useState`/`useEffect` hooks (no external state library)
- **Component pattern**: Single file per component, internal sub-components at bottom of file
- **No hardware wallets**: Exclude Ledger/USB wallet adapters to avoid heavy dependencies
