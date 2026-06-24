# Modelos de datos

Todos los modelos heredan de `BaseModel`, que provee campos comunes.

## BaseModel

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| ID | `uint` | `id` | Primary key, autoincrement |
| CreatedAt | `time.Time` | `created_at` | Set por GORM al crear |
| UpdatedAt | `time.Time` | `updated_at` | Set por GORM al actualizar |
| DeletedAt | `gorm.DeletedAt` | `-` | Soft delete, oculto en JSON |

---

## User

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| Username | `string` | `username` | Único, mínimo 3 caracteres |
| Password | `string` | `-` | Hasheado con bcrypt, nunca expuesto en JSON |
| AntecedentesMedicos | `string` | `antecedentes_medicos` | Opcional, se inyecta al contexto de IA |
| Rol | `string` | `rol` | `family` (default) o `health_worker` |

No hay endpoint público para listar usuarios.

---

## SymptomReport

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| UserID | `uint` | `user_id` | FK a User |
| Descripcion | `string` | `descripcion` | Requerido |
| Fecha | `time.Time` | `fecha` | Opcional, default: `time.Now()` |

---

## VaccinationRecord

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| UserID | `uint` | `user_id` | FK a User |
| NombreVacuna | `string` | `nombre_vacuna` | Requerido |
| FechaAplicacion | `time.Time` | `fecha_aplicacion` | Opcional, default: `time.Now()`. Crea recordatorio automático si es futura |

---

## Appointment

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| UserID | `uint` | `user_id` | FK a User |
| Fecha | `time.Time` | `fecha` | Requerido en DTO |
| Descripcion | `string` | `descripcion` | Requerido |

Crea recordatorio automático tipo `cita` al crearse.

---

## HealthService

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| Nombre | `string` | `nombre` | Requerido |
| Tipo | `string` | `tipo` | Valores: `hospital`, `clinica`, `puesto_salud` (validado en DTO) |
| Latitud | `float64` | `latitud` | Opcional |
| Longitud | `float64` | `longitud` | Opcional |

---

## HealthEvent

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| Titulo | `string` | `titulo` | Requerido |
| Descripcion | `string` | `descripcion` | Opcional |
| Tipo | `string` | `tipo` | `jornada`, `campana` o `feria` |
| FechaInicio | `time.Time` | `fecha_inicio` | Requerido |
| FechaFin | `time.Time` | `fecha_fin` | Opcional |
| Ubicacion | `string` | `ubicacion` | Opcional |
| Latitud | `float64` | `latitud` | Opcional, para búsqueda geográfica |
| Longitud | `float64` | `longitud` | Opcional |
| Organizador | `string` | `organizador` | Opcional |

---

## EpiAlert

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| Titulo | `string` | `titulo` | Requerido |
| Descripcion | `string` | `descripcion` | Requerido |
| Nivel | `string` | `nivel` | `bajo`, `medio`, `alto` o `critico` |
| Departamento | `string` | `departamento` | Opcional |
| Fuente | `string` | `fuente` | Opcional |
| Activa | `bool` | `activa` | Default `true`, se setea en handler |

---

## AIConsultation

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| UserID | `uint` | `user_id` | FK a User |
| Pregunta | `string` | `pregunta` | Consulta del usuario |
| Respuesta | `string` | `respuesta` | Generada por el asistente IA |

---

## Reminder

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| UserID | `uint` | `user_id` | FK a User |
| Titulo | `string` | `titulo` | Requerido |
| Descripcion | `string` | `descripcion` | Opcional |
| Fecha | `time.Time` | `fecha` | Requerido en DTO |
| Leido | `bool` | `leido` | Default `false` |
| Tipo | `string` | `tipo` | `cita`, `vacuna` o `manual` |

Los recordatorios se crean automáticamente al crear citas (tipo `cita`) y registrar vacunas (tipo `vacuna`). También se pueden crear manualmente con tipo `manual`.

---

## Relaciones

```
User ──< SymptomReport        (user_id)
User ──< VaccinationRecord    (user_id)
User ──< Appointment          (user_id)
User ──< Reminder             (user_id)
User ──< AIConsultation       (user_id)
```
