# Modelos de datos

Todos los modelos heredan de `BaseModel`, que provee campos comunes en snake_case.

## BaseModel

| Campo | Tipo Go | JSON | Notas |
|-------|---------|------|-------|
| ID | `uint` | `id` | primary key, autoincrement |
| CreatedAt | `time.Time` | `created_at` | set por GORM al crear |
| UpdatedAt | `time.Time` | `updated_at` | set por GORM al actualizar |
| DeletedAt | `gorm.DeletedAt` | `-` | oculto en JSON, soft delete |

---

## User

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| Username | `string` | `username` | `gorm:"unique"`, `binding:"required,min=3"` |
| Password | `string` | `-` | nunca expuesto en JSON (`json:"-"`) |
| AntecedentesMedicos | `string` | `antecedentes_medicos` | opcional |
| Rol | `string` | `rol` | `gorm:"default:family"` — `family` o `health_worker` |

No hay endpoint para listar usuarios. El password se guarda hasheado con bcrypt.

---

## SymptomReport

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| UserID | `uint` | `user_id` | FK implícita a User |
| Descripcion | `string` | `descripcion` | `binding:"required"` |
| Fecha | `time.Time` | `fecha` | opcional, default: time.Now() |

---

## VaccinationRecord

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| UserID | `uint` | `user_id` | FK implícita a User |
| NombreVacuna | `string` | `nombre_vacuna` | `binding:"required"` |
| FechaAplicacion | `time.Time` | `fecha_aplicacion` | opcional, default: time.Now() |

---

## Appointment

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| UserID | `uint` | `user_id` | FK implícita a User |
| Fecha | `time.Time` | `fecha` | `binding:"required"` |
| Descripcion | `string` | `descripcion` | `binding:"required"` |

---

## HealthService

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| Nombre | `string` | `nombre` | `binding:"required"` |
| Tipo | `string` | `tipo` | `binding:"required,oneof=hospital clinica puesto_salud"` |
| Latitud | `float64` | `latitud` | opcional |
| Longitud | `float64` | `longitud` | opcional |

---

## HealthEvent

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| Titulo | `string` | `titulo` | `binding:"required"` |
| Descripcion | `string` | `descripcion` | opcional |
| Tipo | `string` | `tipo` | `binding:"required,oneof=jornada campana feria"` |
| FechaInicio | `time.Time` | `fecha_inicio` | `binding:"required"` |
| FechaFin | `time.Time` | `fecha_fin` | opcional |
| Ubicacion | `string` | `ubicacion` | opcional |
| Latitud | `float64` | `latitud` | opcional |
| Longitud | `float64` | `longitud` | opcional |
| Organizador | `string` | `organizador` | opcional |

---

## EpiAlert

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| Titulo | `string` | `titulo` | `binding:"required"` |
| Descripcion | `string` | `descripcion` | `binding:"required"` |
| Nivel | `string` | `nivel` | `binding:"required,oneof=bajo medio alto critico"` |
| Departamento | `string` | `departamento` | opcional |
| Fuente | `string` | `fuente` | opcional |
| Activa | `bool` | `activa` | `gorm:"default:false"`, inicia `true` en handler |

---

## AIConsultation

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| UserID | `uint` | `user_id` | FK implícita a User |
| Pregunta | `string` | `pregunta` | `binding:"required"` |
| Respuesta | `string` | `respuesta` | generada por Gemini |

---

## Reminder

| Campo | Tipo Go | JSON | Constraints |
|-------|---------|------|-------------|
| UserID | `uint` | `user_id` | FK implícita a User |
| Titulo | `string` | `titulo` | `binding:"required"` |
| Descripcion | `string` | `descripcion` | opcional |
| Fecha | `time.Time` | `fecha` | `binding:"required"` |
| Leido | `bool` | `leido` | `gorm:"default:false"` |
| Tipo | `string` | `tipo` | `binding:"required,oneof=cita vacuna manual"` |

Los recordatorios se crean automáticamente al crear citas (tipo `cita`) y registrar vacunas (tipo `vacuna`).

---

## Relaciones

```
User ──< SymptomReport        (user_id)
User ──< VaccinationRecord    (user_id)
User ──< Appointment          (user_id)
User ──< Reminder             (user_id)
User ──< AIConsultation       (user_id)
```
