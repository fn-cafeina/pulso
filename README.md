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

## Documentación

| Recurso | Descripción |
|---------|-------------|
| [`docs/api.md`](docs/api.md) | Endpoints, autenticación, ejemplos request/response |
| [`docs/models.md`](docs/models.md) | Modelos de datos, campos, tipos, constraints |
| [`docs/architecture.md`](docs/architecture.md) | Arquitectura, capas, stack, decisiones técnicas |

## Estructura

```
backend/     # API REST (Go + Gin + GORM + SQLite)
frontend/    # App web (Astro + Tailwind CSS 4)
docs/        # Documentación detallada
```

## Desarrollo

### Backend
```bash
cd backend
cp .env.example .env    # Configurar JWT_SECRET y HEALTH_WORKER_SECRET (requeridos)
make dev                # Inicia con hot-reload (Air)
```

### Frontend
```bash
cd frontend             # Requiere Node >= 22.12.0
npm install
npm run dev             # Inicia entorno de desarrollo Astro
```

## Licencia

MIT © Jasmir Medina — Hackathon Nicaragua 2026
