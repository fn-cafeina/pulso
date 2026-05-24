# Pulso — Asistente Virtual para la Salud

Proyecto para el **Hackathon Nicaragua 2026**.

## Problema

Las familias nicaragüenses enfrentan dificultades para identificar oportunamente signos y síntomas de enfermedades y acceder a orientación confiable sobre cuándo y dónde acudir a un centro de salud. No existe una plataforma nacional que brinde orientación preventiva, contextualizada y accesible, ni que articule información sobre servicios de salud y actividades comunitarias.

## Usuarios

- Familias nicaragüenses, especialmente en zonas con acceso limitado a orientación médica inmediata.
- Personal de salud comunitario.

## Funcionalidades

| Funcionalidad | Descripción |
| :--- | :--- |
| Orientación de síntomas | Asistente con IA que orienta sobre signos y síntomas |
| Historial médico | Registro de antecedentes, citas y vacunación |
| Recordatorios | Notificaciones de citas y próximas vacunas |
| Localizador | Mapa de centros de salud cercanos |
| Eventos | Difusión y búsqueda de jornadas y eventos de salud |
| Alertas | Alertas epidemiológicas en tiempo real |

## Stack

- **Backend:** Go 1.26 + Gin + GORM + SQLite
- **Frontend:** Astro + Tailwind CSS
- **IA:** Integración con API externa para asistente virtual

## Estructura

```
/
├── backend/             # API REST (Go)
│   ├── .env.example     # Variables de entorno
│   ├── Makefile         # Comandos: make dev, make build, make clean
│   ├── cmd/api/         # Entry point
│   └── internal/
│       ├── ai/          # Cliente Gemini API
│       ├── config/      # Variables de entorno
│       ├── db/          # Conexión y migraciones SQLite
│       ├── handlers/    # Handlers HTTP
│       │   ├── response.go   # Envoltorio uniforme de respuestas
│       │   └── requests.go   # DTOs para crear/actualizar
│       ├── middleware/   # JWT auth, roles, CORS
│       │   ├── auth.go
│       │   ├── role.go
│       │   └── cors.go
│       ├── models/      # Modelos GORM (heredan de BaseModel)
│       │   └── base.go  # ID, timestamps en snake_case, deleted_at oculto
│       ├── repository/  # Acceso a datos
│       └── service/     # Lógica de negocio
└── frontend/            # App web (Astro)
    ├── package.json     # npm run dev, npm run build
    └── src/
```

## Estado del proyecto

Backend funcional con API REST autenticada:

### API

| Método | Ruta | Auth | Descripción | Estado |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/register` | ❌ | Registrar usuario | ✅ |
| POST | `/login` | ❌ | Iniciar sesión (JWT) | ✅ |
| GET | `/symptoms` | ✅ | Listar síntomas del usuario | ✅ |
| POST | `/symptoms` | ✅ | Reportar síntoma | ✅ |
| GET | `/vaccines` | ✅ | Listar vacunas del usuario | ✅ |
| POST | `/vaccines` | ✅ | Registrar vacuna | ✅ |
| GET | `/appointments` | ✅ | Listar citas del usuario | ✅ |
| POST | `/appointments` | ✅ | Agendar cita | ✅ |
| GET | `/services` | ❌ | Listar centros de salud (con `?lat=&lng=&radius=` opcional) | ✅ |
| GET | `/services/:id` | ❌ | Obtener centro de salud por ID | ✅ |
| POST | `/services` | ✅ (role) | Registrar centro de salud | ✅ |
| PUT | `/services/:id` | ✅ (role) | Actualizar centro de salud | ✅ |
| DELETE | `/services/:id` | ✅ (role) | Eliminar centro de salud | ✅ |
| GET | `/events` | ❌ | Listar eventos (con `?upcoming=true`, `?lat=&lng=&radius=`) | ✅ |
| GET | `/events/:id` | ❌ | Obtener evento por ID | ✅ |
| POST | `/events` | ✅ (role) | Crear evento de salud | ✅ |
| PUT | `/events/:id` | ✅ (role) | Actualizar evento | ✅ |
| DELETE | `/events/:id` | ✅ (role) | Eliminar evento | ✅ |
| GET | `/alerts` | ❌ | Listar alertas (con `?nivel=&departamento=&activas=true`) | ✅ |
| GET | `/alerts/:id` | ❌ | Obtener alerta por ID | ✅ |
| POST | `/alerts` | ✅ (role) | Crear alerta epidemiológica | ✅ |
| PUT | `/alerts/:id` | ✅ (role) | Actualizar alerta | ✅ |
| DELETE | `/alerts/:id` | ✅ (role) | Eliminar alerta | ✅ |
| PATCH | `/alerts/:id/deactivate` | ✅ (role) | Desactivar alerta | ✅ |
| POST | `/ai/consult` | ✅ | Consultar al asistente IA (Gemini) | ✅ |
| GET | `/ai/history` | ✅ | Historial de consultas del usuario | ✅ |
| GET | `/reminders` | ✅ | Recordatorios pendientes del usuario | ✅ |
| POST | `/reminders` | ✅ | Crear recordatorio manual | ✅ |
| GET | `/reminders/history` | ✅ | Historial de recordatorios | ✅ |
| PATCH | `/reminders/:id/read` | ✅ | Marcar recordatorio como leído | ✅ |

> **Nota**: Endpoints marcados con `(role)` requieren rol `health_worker` (personal de salud). Al registrarse con un código secreto se obtiene este rol.
>
> **Formato de respuestas**: En éxito: `{"data": ..., "message": "..."}`. En error: `{"error": "..."}`. `POST /login` retorna `{"token": "...", "rol": "..."}` dentro de `data`. Todos los IDs y timestamps usan snake_case (`id`, `created_at`).

### Modelos

Todos heredan de `BaseModel` (provee `id`, `created_at`, `updated_at` en snake_case; `deleted_at` no expuesto en JSON).

- `User` — username, contraseña, historial médico, rol (family/health_worker)
- `Appointment` — cita médica (usuario, fecha, descripción)
- `SymptomReport` — reporte de síntomas (usuario, descripción, fecha)
- `VaccinationRecord` — registro de vacuna (usuario, vacuna, fecha)
- `HealthService` — centro de salud (nombre, tipo, ubicación, coordenadas)
- `HealthEvent` — jornada/campaña/feria de salud (título, tipo, fechas, ubicación, coordenadas, organizador)
- `EpiAlert` — alerta epidemiológica (título, descripción, nivel, departamento, fuente, activa)
- `AIConsultation` — consulta al asistente IA (pregunta, respuesta, usuario)
- `Reminder` — recordatorio (usuario, título, descripción, fecha, leído, tipo)

## Desarrollo

### Backend
```bash
cd backend
make dev           # Inicia con hot-reload (Air)
```

### Frontend
```bash
cd frontend
npm install
npm run dev        # Inicia entorno de desarrollo Astro
```

## Licencia

MIT © Jasmir Medina — Hackathon Nicaragua 2026
