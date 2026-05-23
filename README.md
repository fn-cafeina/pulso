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
│       ├── db/        # Conexión y migraciones SQLite
│       ├── handlers/  # Handlers HTTP
│       └── models/    # Modelos GORM
└── frontend/          # App web (Astro) — en desarrollo
```

## Estado del proyecto

MVP en construcción. Backend con esqueleto inicial:

### API

| Método | Ruta | Descripción | Estado |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Registrar usuario | ✅ |
| POST | `/symptoms` | Reportar síntoma | ✅ |
| POST | `/appointments` | Agendar cita | ✅ |
| GET | `/services` | Listar centros de salud | ✅ |
| — | `/login` | Iniciar sesión (JWT) | ❌ |
| — | `/events` | Jornadas y eventos de salud | ❌ |
| — | `/alerts` | Alertas epidemiológicas | ❌ |
| — | `/vaccines` | Registro de vacunas | ❌ |
| — | `/ai/consult` | Consulta al asistente IA | ❌ |

### Modelos

- `User` — username, contraseña, historial médico
- `Appointment` — cita médica (usuario, fecha, descripción)
- `SymptomReport` — reporte de síntomas (usuario, descripción, fecha)
- `VaccinationRecord` — registro de vacuna (usuario, vacuna, fecha)
- `HealthService` — centro de salud (nombre, tipo, ubicación)

## Desarrollo

```bash
# Backend
cd backend
go mod download
go run ./cmd/api
```

## Licencia

MIT © Jasmir Medina — Hackathon Nicaragua 2026
