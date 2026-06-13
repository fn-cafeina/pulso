# Pulso

Monorepo: Go backend (Gin + GORM + SQLite) + Vite/React SPA frontend (Tailwind CSS 4).

**UI/API**: Spanish. **Source**: English.

## Branch & commit

- Branch: `feat/`, `fix/`, `docs/`, `chore/` + short desc.
- Commit: `type(scope): short description`. No README edits without asking.

## Commands

```sh
# Backend (Go 1.26.2, no CGO)
cd backend
make dev      # hot-reload :8080 (Air)
make build    # go build -o bin/api
make test     # go test ./... -v
make vet      # go vet ./...
make lint     # golangci-lint (gofmt, govet, errcheck, staticcheck, gosimple)

# Frontend (Node >= 22.12.0)
cd frontend
npm run dev   # vite dev :5173
npm run build  # tsc && vite build
```

## Required env

`backend/.env` with `JWT_SECRET` and `HEALTH_WORKER_SECRET` — server crashes on startup if missing. See `.env.example`.

## Architecture

```
handler → service → repository → GORM → SQLite
```

Manual DI in `cmd/api/main.go`. Interfaces at service/repo layers.

### Backend

- Auth: JWT Bearer (72h, HS256), roles `family` | `health_worker`
- Geo: Haversine in Go memory, not SQL
- AI: Gemini 3.1 Flash Lite, 3 retries w/ backoff, 30s timeout, 503 if key missing
- DB: SQLite via `glebarez/sqlite` (pure-Go), WAL mode, AutoMigrate on startup
- CORS: `CORS_ORIGIN` env (default `http://localhost:5173`)

### Frontend

```
Component → Store (Zustand) → createCrudApi → Backend
```

- **Layouts**: `AuthLayout` (login/register), `AppLayout` (sidebar + bottom nav + `<Outlet />`)
- **Routing**: react-router-dom v7, `<AuthGuard>` wrapping `AppLayout`, split auth/app
- **Stores**: Zustand 5 — `auth`, `alerts`, `toast`, `appointments`, `events`, `reminders`, `services`, `symptoms`
- **CRUD**: `createCrudApi(path)` returns `{ list, getById, create, update, del, action }`; `createCrudStore(api)` builds a Zustand store around it
- **Toast**: `useToastStore` (single current toast, 4s auto-dismiss) + `ToastContainer` mounted in `main.tsx`, positioned `bottom-24 md:bottom-4 right-4`
- **Theme**: `ThemeToggle` component with light/dark via Tailwind CSS `@variant dark`

## Tests (75, 9 files)

Only `backend/internal/service/` has tests. Pattern: mock repo structs with inline methods, `fail bool` flag.

## Quirks

- `HealthService.Tipo` validation (`hospital`, `clinica`, `puesto_salud`) is in request DTOs, not the model
- No CI/CD
- Graceful shutdown on SIGINT/SIGTERM (10s timeout)
- `parseTime()` accepts 3 formats: `2006-01-02T15:04:05Z`, `2006-01-02T15:04:05`, `2006-01-02`
