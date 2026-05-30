# Pulso

Virtual health assistant for Nicaraguan families. Monorepo: Go backend + Astro frontend.

**Language**: UI/API responses in Spanish. Source code in English (variables, functions, technical comments).

## Working on the project

1. Branch naming: `feat/`, `fix/`, `docs/`, `chore/` + short description.
2. Pull latest `main` before starting.
3. Commit format: `type(scope): short description`. Scope optional.
4. Do not edit README.md without explicit instruction.

## Commands

```sh
# Backend (Go 1.26.2 + Gin + pure-Go SQLite, no CGO)
cd backend
make dev      # hot-reload on port 8080 (Air)
make build    # go build -o bin/api
make test     # go test ./... -v
make vet      # go vet ./...
make lint     # golangci-lint run

# Frontend (Astro 6 + Tailwind CSS 4)
cd frontend
npm run dev   # astro dev on port 4321 (requires Node >= 22.12.0)
```

**Required env**: Backend needs `backend/.env` with `JWT_SECRET` and `HEALTH_WORKER_SECRET` set. Both are required — server calls `log.Fatal` if either is empty. See `backend/.env.example`.

## Architecture

- Layered: `handler → service → repository`. Interfaces at each layer.
- DI manual in `cmd/api/main.go`.
- API responses: `{"data": ..., "message": "..."}` success, `{"error": "..."}` error. Snake_case JSON.
- JWT Bearer auth (72h expiry). Roles: `family` (default) vs `health_worker`.
- Global `db.DB` (`*gorm.DB`), AutoMigrate on startup (9 models). SQLite via `github.com/glebarez/sqlite` (no C compiler needed). WAL mode enabled.
- Geo search (Haversine) filtered in Go memory, not SQL.
- AI: Gemini 3.1 Flash Lite (`google.golang.org/genai`). 3 retries with backoff, 30s timeout per attempt. Returns 503 if key unset or rate-limited.
- Config in `backend/.env` via `godotenv.Load()`. System env vars override `.env`.

## Project quirks

- `JWT_SECRET` and `HEALTH_WORKER_SECRET` are **required** — server crashes on startup if empty. No defaults.
- CORS configurable via `CORS_ORIGIN` env var (defaults to `http://localhost:4321`).
- `models.HealthService.Tipo` is validated in handlers (hospital, clinica, puesto_salud) but not in the service layer.
- No pagination on list endpoints (all data at once).
- Request DTOs in `backend/internal/handlers/requests.go`. `parseTime()` accepts 3 date formats: `2006-01-02T15:04:05Z`, `2006-01-02T15:04:05`, `2006-01-02`.
- `make dev` may panic if port 8080 is busy — no `fuser -k` guard.
- `BaseModel` embeds `gorm.DeletedAt` (soft delete) — excluded from JSON via `json:"-"`.
- `User.Password` excluded from JSON responses.

## AI guidelines

1. Do NOT commit, push, or merge without explicit instruction.
2. Do NOT modify git history or force push.
3. Do NOT bump versions or edit README.md.
4. Comments only for complex or non-obvious logic. Do not restate what the code says.
5. Verify with `cd backend && make build && make vet && make test` before requesting review.
6. If unsure about requirements or implementation, ask a human.
7. Prioritize correctness, maintainability, and idiomatic Go.

## Tests

- 62 tests across 9 files in `backend/internal/service/`.
- Pattern: mock repo structs with inline methods, `fail bool` flag for error cases.
- Only `service/` package has tests. Handlers, middleware, config, AI client: no tests.
- Run: `cd backend && make test`.
