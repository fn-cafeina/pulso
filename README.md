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

- **Backend:** Go 1.26.2 + Gin + GORM + SQLite (pure-Go, sin CGO)
- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS 4 + Zustand 5 + react-router-dom 7
- **IA:** Google Gemini 3.1 Flash Lite
- **Auth:** JWT (HS256, 72h) con roles `family` | `health_worker`

## Arquitectura

### Backend

```
handler → service → repository → GORM → SQLite
```

Inyección de dependencias manual en `cmd/api/main.go`.

### Frontend

```
Component → Store (Zustand) → createCrudApi (apiFetch) → Backend REST
```

- **Layouts:** `AuthLayout` (login/register) y `AppLayout` (sidebar + bottom nav + contenido)
- **Auth:** `AuthGuard` envuelve a `AppLayout`, redirige a `/login` si no hay sesión
- **Routing:** react-router-dom v7 con rutas anidadas
- **Global state:** Zustand 5 — stores para auth, alerts, appointments, events, reminders, services, symptoms, toast
- **CRUD genérico:** `createCrudApi` wrapper sobre `apiFetch` con métodos `list`, `getById`, `create`, `update`, `del`, `action`
- **Notificaciones:** Sistema de toast global (Zustand + `ToastContainer` montado en `main.tsx`)
- **Tema:** `ThemeToggle` con soporte light/dark

## Páginas

| Página | Ruta | Estado |
|--------|------|--------|
| Inicio | `/` | ✅ Dashboard con cards de acceso rápido |
| Asistente IA | `/asistente` | ✅ Chat con Gemini, historial, sugerencias |
| Alertas | `/alertas` | ✅ CRUD completo con filtros |
| Mi Historial | `/historial` | 📍 Placeholder |
| Servicios Cercanos | `/servicios` | 📍 Placeholder |
| Eventos | `/eventos` | 📍 Placeholder |
| Recordatorios | `/recordatorios` | 📍 Placeholder |

## Desarrollo

### Backend
```bash
cd backend
cp .env.example .env    # Configurar JWT_SECRET y HEALTH_WORKER_SECRET (requeridos)
make dev                # Inicia con hot-reload (Air)
```

### Frontend
```bash
cd frontend             # Requires Node >= 22.12.0
npm install
npm run dev             # Desarrollo en :5173
npm run build           # tsc && vite build
```

## Licencia

MIT © Jasmir Medina — Hackathon Nicaragua 2026
