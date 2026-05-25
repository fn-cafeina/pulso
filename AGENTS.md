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
make dev      # hot-reload on port 8080
make build    # go build -o bin/api
make test     # go test ./... -v
make vet      # go vet ./...
make lint     # golangci-lint run

# Frontend (Astro 6 + Tailwind CSS 4)
cd frontend
npm run dev   # astro dev on port 4321 (requires Node >= 22.12.0)
```

## Architecture

- Layered: `handler → service → repository`. Interfaces at each layer.
- API responses: `{"data": ..., "message": "..."}` success, `{"error": "..."}` error. Snake_case JSON.
- JWT Bearer auth (72h expiry). Roles: `family` (default) vs `health_worker`.
- Global `db.DB` (`*gorm.DB`), AutoMigrate on startup (9 models). SQLite via `github.com/glebarez/sqlite` (no C compiler needed).
- Geo search (Haversine) filtered in Go memory, not SQL.
- AI: Gemini 3.1 Flash Lite (`google.golang.org/genai`). Returns 503 if key unset or rate-limited.
- Config in `backend/.env` via `godotenv.Load()`. System env vars override `.env`.

## Project quirks

- `HEALTH_WORKER_SECRET` defaults to `""` — health worker self-registration disabled by default.
- CORS hardcoded to `http://localhost:4321` (not yet configurable).
- `HealthService.Tipo` has no `oneof` validation (valid values TBD).
- No pagination on list endpoints (all data at once).
- Request DTOs in `backend/internal/handlers/requests.go`. `parseTime()` accepts 3 date formats.
- `make dev` may panic if port 8080 is busy — no `fuser -k` guard.

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
- Pattern: mock repo structs with inline methods.
- Run: `cd backend && make test`.
