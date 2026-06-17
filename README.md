# Pulso — Asistente Virtual para la Salud

Proyecto para el **Hackathon Nicaragua 2026**.

## Problema

Las familias nicaragüenses enfrentan dificultades para identificar oportunamente signos y síntomas de enfermedades y acceder a orientación confiable sobre cuándo y dónde acudir a un centro de salud. No existe una plataforma nacional que brinde orientación preventiva, contextualizada y accesible, ni que articule información sobre servicios de salud y actividades comunitarias.

## Usuarios

- Familias nicaragüenses, especialmente en zonas con acceso limitado a orientación médica inmediata.
- Personal de salud comunitario.

## Funcionalidades

| Funcionalidad | Descripción | Estado |
| :--- | :--- | :--- |
| Orientación de síntomas | Asistente con IA que orienta sobre signos y síntomas | ✅ |
| Alertas epidemiológicas | CRUD completo con filtros (nivel, departamento, activas) | ✅ |
| Historial médico | Registro de antecedentes, síntomas y vacunación | ✅ Backend / 📍 Frontend placeholder |
| Recordatorios | Notificaciones de citas y próximas vacunas | ✅ |
| Localizador | Mapa de centros de salud cercanos | ✅ Backend / 📍 Frontend placeholder |
| Eventos | Difusión y búsqueda de jornadas y eventos de salud | ✅ Backend / 📍 Frontend placeholder |

## Stack

Go 1.26 + Gin + GORM + SQLite + React 19 + TypeScript 6 + Vite 8 + Tailwind CSS 4. Arquitectura y decisiones técnicas en [`docs/`](/docs).

## Desarrollo

```bash
cd backend
cp .env.example .env    # JWT_SECRET y HEALTH_WORKER_SECRET requeridos
make dev                # Backend :8080 (hot-reload)
```

```bash
cd frontend             # Node >= 22.12
npm install
npm run dev             # Frontend :5173
```

## Licencia

MIT © Jasmir Medina — Hackathon Nicaragua 2026
