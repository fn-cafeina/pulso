# Arquitectura

## Estructura del proyecto

```
backend/
├── cmd/api/main.go           # Entry point: init DB, DI, routes
├── internal/
│   ├── ai/client.go          # Cliente Gemini 3.1 Flash Lite
│   ├── config/config.go      # Env vars via godotenv
│   ├── db/sqlite.go          # Conexión GORM + AutoMigrate (9 modelos)
│   ├── handlers/             # Handlers HTTP (Gin)
│   │   ├── response.go       # Envoltorio uniforme: Success, Error, Msg
│   │   └── requests.go       # DTOs tipados para create/update
│   ├── middleware/
│   │   ├── auth.go           # JWT Bearer validation
│   │   ├── role.go           # RoleRequired("health_worker")
│   │   └── cors.go           # CORS configurable vía CORS_ORIGIN
│   ├── models/               # 9 modelos GORM (embed BaseModel)
│   │   └── base.go           # BaseModel: id, created_at, updated_at, deleted_at oculto
│   ├── repository/           # Interfaces + implementaciones GORM
│   └── service/              # Lógica de negocio + tests
│       └── geo.go            # Haversine (distancia entre coordenadas)
├── .env.example               # Variables de entorno requeridas
├── .air.toml                  # Config hot-reload (Air)
├── Makefile                   # dev, build, test, vet, lint, clean
└── go.mod

frontend/
├── src/
├── package.json               # Astro + Tailwind CSS 4
└── astro.config.mjs
```

## Capas

```
handler → service → repository → GORM → SQLite
```

Cada capa se comunica mediante interfaces definidas en `repository/` y `service/`. La inyección de dependencias se hace manualmente en `cmd/api/main.go`.

### Handler
- Recibe request HTTP, valida binding de DTOs, llama al service.
- No contiene lógica de negocio.
- Usa `parseTime()` del paquete `handlers` para fechas (3 formatos aceptados).

### Service
- Lógica de negocio pura.
- Coordina múltiples repos si es necesario (ej: `AIService` usa 4 repos).
- Expone DTOs de entrada/salida (`RegisterRequest`, `LoginRequest`, `NearbyService`, `NearbyEvent`).

### Repository
- Acceso a datos vía GORM.
- Cada repositorio es una interfaz + implementación concreta.
- `db.DB` es variable global (`*gorm.DB`).

## Configuración

| Variable | Default | Descripción |
|----------|---------|-------------|
| `JWT_SECRET` | **requerido** | Clave para firmar tokens JWT (server falla si vacío) |
| `PORT` | `:8080` | Puerto del servidor |
| `DB_PATH` | `pulso.db` | Ruta del archivo SQLite |
| `GEMINI_API_KEY` | `""` | API key de Gemini (opcional → AI da 503 si falta) |
| `HEALTH_WORKER_SECRET` | **requerido** | Código secreto para rol health_worker (server falla si vacío) |

Las variables se cargan desde `backend/.env` vía `godotenv.Load()`. Variables de entorno del sistema tienen prioridad sobre `.env`.

## Stack

| Componente | Tecnología |
|------------|------------|
| Lenguaje | Go 1.26.2 |
| Framework HTTP | Gin |
| ORM | GORM v2 |
| Base de datos | SQLite via `github.com/glebarez/sqlite` (pure-Go, sin CGO) |
| Autenticación | JWT (HS256, 72h exp) via `github.com/golang-jwt/jwt/v5` |
| Contraseñas | bcrypt via `golang.org/x/crypto` |
| IA | Google Gemini 3.1 Flash Lite via `google.golang.org/genai` |

## Decisiones técnicas

### SQLite sin CGO
`mattn/go-sqlite3` requiere compilador C — no disponible en el entorno. Se usa `github.com/glebarez/sqlite` (pure-Go, implementación sobre zcrypto).

### Búsqueda geográfica en memoria
Haversine se calcula en Go, no en SQL. Se cargan todos los registros y se filtran en memoria. Aceptable para volúmenes de hackathon.

### Geo en mismo endpoint
`GET /services` y `GET /events` detectan parámetros `?lat=&lng=&radius=` y responden con resultados filtrados + `distancia_km`. Sin parámetros → listado completo.

### Update como merge
PUT busca el registro existente, sobreescribe campos no vacíos, preserva `created_at` original.

### Roles
- `family` (default) — acceso a datos propios (síntomas, vacunas, citas, recordatorios, IA).
- `health_worker` — además puede crear/actualizar/eliminar servicios, eventos y alertas.
- Se asigna al registrar con `codigo` igual a `HEALTH_WORKER_SECRET`.

### Asistente IA
- Gemini 3.1 Flash Lite (GA desde mayo 2026, $0.25/1M input tokens).
- Modelo: `gemini-3.1-flash-lite`.
- Temperatura fija en 0.2. Sin streaming.
- Inyecta contexto del usuario (antecedentes, síntomas, vacunas, citas futuras) en el prompt.
- 30s timeout. Sin key o rate-limit → 503.
- Prompt del sistema en español: no diagnostica ni receta.

### Recordatorios automáticos
- Al crear cita → recordatorio tipo `cita`.
- Al registrar vacuna → recordatorio tipo `vacuna`.
- Errores de creación se loggean, no rompen la operación principal.

### Respuestas
- Envelope uniforme: `{"data": ..., "message": "..."}` éxito, `{"error": "..."}` error.
- Snake_case en JSON (`user_id`, `created_at`, `nombre_vacuna`, etc.).
- `User.Password` excluido del JSON.

### CORS
Configurable vía variable `CORS_ORIGIN` (default: `http://localhost:4321`).

## Tests

- 62 tests en 9 archivos dentro de `backend/internal/service/`.
- Patrón: mocks manuales con structs e inline methods, flag `fail bool` para errores.
- `cd backend && make test` para ejecutar.
