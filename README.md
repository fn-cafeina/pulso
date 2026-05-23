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
├── backend/           # API REST (Go)
│   ├── cmd/api/       # Entry point, rutas
│   └── internal/
│       ├── config/    # Variables de entorno
│       ├── db/        # Conexión y migraciones SQLite
│       ├── handlers/  # Handlers HTTP
│       ├── middleware/ # JWT authentication
│       ├── models/    # Modelos GORM
│       ├── repository/ # Acceso a datos
│       └── service/   # Lógica de negocio
└── frontend/          # App web (Astro) — en desarrollo
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
| POST | `/services` | ✅ | Registrar centro de salud | ✅ |
| PUT | `/services/:id` | ✅ | Actualizar centro de salud | ✅ |
| DELETE | `/services/:id` | ✅ | Eliminar centro de salud | ✅ |
| GET | `/events` | ❌ | Listar eventos (con `?upcoming=true`, `?lat=&lng=&radius=`) | ✅ |
| GET | `/events/:id` | ❌ | Obtener evento por ID | ✅ |
| POST | `/events` | ✅ | Crear evento de salud | ✅ |
| PUT | `/events/:id` | ✅ | Actualizar evento | ✅ |
| DELETE | `/events/:id` | ✅ | Eliminar evento | ✅ |
| — | `/alerts` | — | Alertas epidemiológicas | ❌ |
| — | `/ai/consult` | — | Consulta al asistente IA | ❌ |

### Modelos

- `User` — username, contraseña, historial médico
- `Appointment` — cita médica (usuario, fecha, descripción)
- `SymptomReport` — reporte de síntomas (usuario, descripción, fecha)
- `VaccinationRecord` — registro de vacuna (usuario, vacuna, fecha)
- `HealthService` — centro de salud (nombre, tipo, ubicación, coordenadas)
- `HealthEvent` — jornada/campaña/feria de salud (título, tipo, fechas, ubicación, coordenadas, organizador)

## Desarrollo

```bash
# Backend
cd backend
go mod download
go run ./cmd/api
```

## Licencia

MIT © Jasmir Medina — Hackathon Nicaragua 2026
