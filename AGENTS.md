# Pulso — AGENTS.md

## Repo layout
- `backend/` — Go 1.26.2 + Gin + GORM + pure-Go SQLite (no CGO)
- `frontend/` — Astro 6 + Tailwind CSS 4
- No root Makefile — `cd backend && make <target>`

## Backend commands
```sh
cd backend
make dev      # air hot-reload (port 8080)
make build    # go build -o bin/api
make test     # go test ./... -v
make vet      # go vet ./...
make lint     # golangci-lint run
make tidy     # go mod tidy
make clean    # rm -rf bin tmp pulso.db api
```

## Architecture
- Layered: `handler → service → repository`. Interfaces at each layer.
- Global DB: `db.DB` (`*gorm.DB`), AutoMigrate on startup (9 models).
- All responses: `{"data": ..., "message": "..."}` success, `{"error": "..."}` error. Snake_case JSON.
- Auth: JWT Bearer `Authorization`, 72h expiry. `user_id` + `rol` in context.
- Roles: `family` (default) vs `health_worker`. Registration `codigo` must match `HEALTH_WORKER_SECRET` env var for health_worker role.
- CUD for services/events/alerts gated by `middleware.RoleRequired("health_worker")`.

## Key quirks
- `.env` in `backend/`, loaded via `godotenv.Load()`. **System env vars override `.env`** (standard Go `os.Getenv` precedence).
- `HEALTH_WORKER_SECRET` defaults to `""` → self-registration **disabled by default**. Set in `.env` to enable.
- SQLite: `github.com/glebarez/sqlite` (pure Go, no CGO). No C compiler available.
- Geo search (Haversine) computed in Go memory, not SQL — fine for hackathon scale.
- `make dev` may panic if port 8080 busy — no `fuser -k` guard.
- AI: Gemini 3.1 Flash Lite (`google.golang.org/genai`). Returns 503 if key unset or rate-limited.
- Request DTOs in `handlers/requests.go` for all create/update. `parseTime()` accepts 3 formats: `2006-01-02T15:04:05Z`, `2006-01-02T15:04:05`, `2006-01-02`.
- No pagination on list endpoints (all data at once).
- `HealthService.Tipo` has no `oneof` validation — valid values still undefined.
- CORS hardcoded to `http://localhost:4321` (not yet configurable).

## Tests
- Only `service/auth_service_test.go` exists (5 tests).
- Pattern: mock repo structs with inline methods.
- Run: `make test`.

## Frontend
- `cd frontend && npm run dev` → port 4321
- Requires Node >= 22.12.0
