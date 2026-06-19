# API REST — Pulso

Base URL: `http://localhost:8080`

## Formato de respuestas

```json
// Éxito con datos
{ "data": [...], "message": "..." }

// Éxito sin datos
{ "message": "..." }

// Error
{ "error": "..." }

// Paginado (con ?page=&per_page=)
{ "data": [...], "meta": { "page": 1, "per_page": 20, "total": 47 } }
```

`POST /login` retorna token JWT dentro de `data`:

```json
{ "data": { "token": "...", "rol": "family" }, "message": "inicio de sesión exitoso" }
```

## Autenticación

- **Registro**: `POST /register` — sin auth. Si se envía `codigo` igual a `HEALTH_WORKER_SECRET`, el usuario obtiene rol `health_worker`.
- **Login**: `POST /login` — sin auth. Retorna JWT (72h exp).
- **Endpoints auth**: Header `Authorization: Bearer <token>`. El middleware extrae `user_id` y `rol`.
- **Endpoints health_worker**: Requieren rol `health_worker` (además del JWT).

## Endpoints

### 1. Auth — públicos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/register` | ❌ | Registrar usuario |
| POST | `/login` | ❌ | Iniciar sesión |

<details>
<summary><code>POST /register</code></summary>

**Request:**
```json
{
  "username": "maria",
  "password": "mi-clave-segura",
  "antecedentes_medicos": "Asma leve",
  "codigo": ""
}
```

**Response 201:**
```json
{
  "data": { "id": 1, "rol": "family" },
  "message": "usuario registrado"
}
```

**Response 409 (username duplicado):**
```json
{ "error": "el nombre de usuario ya está en uso" }
```
</details>

<details>
<summary><code>POST /login</code></summary>

**Request:**
```json
{
  "username": "maria",
  "password": "mi-clave-segura"
}
```

**Response 200:**
```json
{
  "data": { "token": "eyJhbGciOiJIUzI1NiIs...", "rol": "family" },
  "message": "inicio de sesión exitoso"
}
```

**Response 401:**
```json
{ "error": "credenciales inválidas" }
```
</details>

---

### 2. Síntomas — requieren auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/symptoms` | ✅ | Listar síntomas del usuario |
| POST | `/symptoms` | ✅ | Reportar síntoma |

<details>
<summary><code>POST /symptoms</code></summary>

**Request:**
```json
{
  "descripcion": "Dolor de cabeza y fiebre",
  "fecha": "2026-05-20"
}
```

`fecha` opcional (default: hoy). Formatos aceptados: `2026-05-20`, `2026-05-20T15:04:05Z`, `2026-05-20T15:04:05`.

**Response 201:**
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "descripcion": "Dolor de cabeza y fiebre",
    "fecha": "2026-05-20T00:00:00Z",
    "created_at": "2026-05-25T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  },
  "message": "síntoma registrado"
}
```
</details>

<details>
<summary><code>GET /symptoms</code></summary>

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "descripcion": "Dolor de cabeza y fiebre",
      "fecha": "2026-05-20T00:00:00Z",
      "created_at": "2026-05-25T10:00:00Z",
      "updated_at": "2026-05-25T10:00:00Z"
    }
  ]
}
```
</details>

---

### 3. Vacunas — requieren auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/vaccines` | ✅ | Listar vacunas del usuario |
| POST | `/vaccines` | ✅ | Registrar vacuna |

<details>
<summary><code>POST /vaccines</code></summary>

**Request:**
```json
{
  "nombre_vacuna": "Influenza",
  "fecha_aplicacion": "2026-04-15"
}
```

`fecha_aplicacion` opcional (default: hoy). Crea recordatorio automático tipo `vacuna`.

**Response 201:**
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "nombre_vacuna": "Influenza",
    "fecha_aplicacion": "2026-04-15T00:00:00Z",
    "created_at": "2026-05-25T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  },
  "message": "vacuna registrada"
}
```
</details>

<details>
<summary><code>GET /vaccines</code></summary>

**Response 200:**
```json
{ "data": [ { "id": 1, "user_id": 1, "nombre_vacuna": "Influenza", ... } ] }
```
</details>

---

### 4. Citas — requieren auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/appointments` | ✅ | Listar citas del usuario |
| POST | `/appointments` | ✅ | Agendar cita |

<details>
<summary><code>POST /appointments</code></summary>

**Request:**
```json
{
  "fecha": "2026-06-10T09:00:00",
  "descripcion": "Control general"
}
```

Crea recordatorio automático tipo `cita`.

**Response 201:**
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "fecha": "2026-06-10T09:00:00Z",
    "descripcion": "Control general",
    "created_at": "2026-05-25T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  },
  "message": "cita creada"
}
```
</details>

<details>
<summary><code>GET /appointments</code></summary>

**Response 200:**
```json
{ "data": [ { "id": 1, "user_id": 1, "fecha": "2026-06-10T09:00:00Z", "descripcion": "Control general", ... } ] }
```
</details>

---

### 5. Servicios de salud — GET público, CUD health_worker

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/services` | ❌ | Listar centros (`?page=&per_page=`, `?lat=&lng=&radius=` opcional) |
| GET | `/services/:id` | ❌ | Obtener centro por ID |
| POST | `/services` | ✅ (hw) | Registrar centro |
| PUT | `/services/:id` | ✅ (hw) | Actualizar centro |
| DELETE | `/services/:id` | ✅ (hw) | Eliminar centro |

<details>
<summary><code>GET /services</code> — listar todos</summary>

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Centro de Salud Villa Libertad",
      "tipo": "hospital",
      "latitud": 12.1328,
      "longitud": -86.2504,
      "created_at": "2026-05-20T10:00:00Z",
      "updated_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```
</details>

<details>
<summary><code>GET /services?page=1&per_page=10</code> — listar con paginación</summary>

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Centro de Salud Villa Libertad",
      "tipo": "hospital",
      ...
    }
  ],
  "meta": {
    "page": 1,
    "per_page": 10,
    "total": 47
  }
}
```
</details>

<details>
<summary><code>GET /services?lat=12.13&lng=-86.25&radius=10</code> — búsqueda geográfica</summary>

Incluye campo extra `distancia_km`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Centro de Salud Villa Libertad",
      "tipo": "hospital",
      "latitud": 12.1328,
      "longitud": -86.2504,
      "distancia_km": 1.23,
      "created_at": "2026-05-20T10:00:00Z",
      "updated_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```
</details>

<details>
<summary><code>POST /services</code></summary>

**Request:**
```json
{
  "nombre": "Centro de Salud Villa Libertad",
  "tipo": "hospital",
  "latitud": 12.1328,
  "longitud": -86.2504
}
```

**Response 201:**
```json
{
  "data": { "id": 1, "nombre": "Centro de Salud Villa Libertad", "tipo": "hospital", ... },
  "message": "servicio creado"
}
```
</details>

<details>
<summary><code>PUT /services/:id</code></summary>

Todos los campos opcionales en update.

**Request:**
```json
{ "nombre": "Centro de Salud Villa Libertad (actualizado)" }
```

**Response 200:**
```json
{
  "data": { "id": 1, "nombre": "Centro de Salud Villa Libertad (actualizado)", "tipo": "hospital", ... },
  "message": "servicio actualizado"
}
```
</details>

<details>
<summary><code>DELETE /services/:id</code></summary>

**Response 200:**
```json
{ "message": "servicio eliminado" }
```
</details>

---

### 6. Eventos de salud — GET público, CUD health_worker

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/events` | ❌ | Listar eventos (`?upcoming=true`, `?page=&per_page=`, `?lat=&lng=&radius=`) |
| GET | `/events/:id` | ❌ | Obtener evento por ID |
| POST | `/events` | ✅ (hw) | Crear evento |
| PUT | `/events/:id` | ✅ (hw) | Actualizar evento |
| DELETE | `/events/:id` | ✅ (hw) | Eliminar evento |

<details>
<summary><code>GET /events</code> — listar todos</summary>

`?upcoming=true` filita solo eventos con `fecha_inicio >= now`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Jornada de Vacunación",
      "descripcion": "Vacunación infantil en el barrio",
      "tipo": "jornada",
      "fecha_inicio": "2026-06-01T08:00:00Z",
      "fecha_fin": "2026-06-01T16:00:00Z",
      "ubicacion": "Parque Central, Managua",
      "latitud": 12.1476,
      "longitud": -86.2732,
      "organizador": "MINSA",
      "created_at": "2026-05-20T10:00:00Z",
      "updated_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```
</details>

<details>
<summary><code>GET /events?lat=12.13&lng=-86.25&radius=10</code> — búsqueda geográfica</summary>

Incluye `distancia_km`. Implícitamente `upcoming=true`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Jornada de Vacunación",
      "tipo": "jornada",
      "distancia_km": 2.45,
      ...
    }
  ]
}
```
</details>

<details>
<summary><code>POST /events</code></summary>

`tipo` debe ser `jornada`, `campana` o `feria`.

**Request:**
```json
{
  "titulo": "Jornada de Vacunación",
  "tipo": "jornada",
  "descripcion": "Vacunación infantil en el barrio",
  "fecha_inicio": "2026-06-01T08:00:00Z",
  "fecha_fin": "2026-06-01T16:00:00Z",
  "ubicacion": "Parque Central, Managua",
  "latitud": 12.1476,
  "longitud": -86.2732,
  "organizador": "MINSA"
}
```

**Response 201:**
```json
{
  "data": { "id": 1, "titulo": "Jornada de Vacunación", ... },
  "message": "evento creado"
}
```
</details>

<details>
<summary><code>PUT /events/:id</code></summary>

Todos los campos opcionales.

**Response 200:**
```json
{
  "data": { "id": 1, "titulo": "Jornada de Vacunación (actualizado)", ... },
  "message": "evento actualizado"
}
```
</details>

<details>
<summary><code>DELETE /events/:id</code></summary>

**Response 200:**
```json
{ "message": "evento eliminado" }
```
</details>

---

### 7. Alertas epidemiológicas — GET público, CUD health_worker

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/alerts` | ❌ | Listar alertas (`?nivel=&departamento=&activas=true`, `?page=&per_page=`) |
| GET | `/alerts/:id` | ❌ | Obtener alerta por ID |
| POST | `/alerts` | ✅ (hw) | Crear alerta |
| PUT | `/alerts/:id` | ✅ (hw) | Actualizar alerta |
| DELETE | `/alerts/:id` | ✅ (hw) | Eliminar alerta |
| PATCH | `/alerts/:id/deactivate` | ✅ (hw) | Desactivar alerta |

<details>
<summary><code>GET /alerts</code> — listar con filtros</summary>

`?nivel=bajo&departamento=Managua&activas=true`

`nivel`: `bajo`, `medio`, `alto`, `critico`.

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "titulo": "Alerta de Dengue",
      "descripcion": "Aumento de casos en el distrito III",
      "nivel": "alto",
      "departamento": "Managua",
      "fuente": "MINSA",
      "activa": true,
      "created_at": "2026-05-20T10:00:00Z",
      "updated_at": "2026-05-20T10:00:00Z"
    }
  ]
}
```
</details>

<details>
<summary><code>POST /alerts</code></summary>

`nivel` debe ser `bajo`, `medio`, `alto` o `critico`. `activa` se setea a `true` automáticamente.

**Request:**
```json
{
  "titulo": "Alerta de Dengue",
  "descripcion": "Aumento de casos en el distrito III",
  "nivel": "alto",
  "departamento": "Managua",
  "fuente": "MINSA"
}
```

**Response 201:**
```json
{
  "data": { "id": 1, "titulo": "Alerta de Dengue", "activa": true, ... },
  "message": "alerta creada"
}
```
</details>

<details>
<summary><code>PATCH /alerts/:id/deactivate</code></summary>

Cambia `activa` a `false`. No requiere body.

**Response 200:**
```json
{ "message": "alerta desactivada" }
```
</details>

<details>
<summary><code>PUT /alerts/:id</code></summary>

Todos los campos opcionales. Incluye `activa` como bool.

**Response 200:**
```json
{
  "data": { "id": 1, "titulo": "Alerta de Dengue (actualizada)", "activa": false, ... },
  "message": "alerta actualizada"
}
```
</details>

<details>
<summary><code>DELETE /alerts/:id</code></summary>

**Response 200:**
```json
{ "message": "alerta eliminada" }
```
</details>

---

### 8. Asistente IA — requieren auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/ai/consult` | ✅ | Consultar al asistente IA |
| GET | `/ai/history` | ✅ | Historial de consultas |

Requiere `NVIDIA_API_KEY` configurada. Sin key → 503.

<details>
<summary><code>POST /ai/consult</code></summary>

Inyecta contexto del usuario (nombre, hora/día, antecedentes, síntomas, vacunas, citas futuras, historial completo en formato diálogo Usuario/Pulso) en el prompt.

**Request:**
```json
{
  "pregunta": "¿Qué puedo hacer para el dolor de cabeza?"
}
```

**Response 200:**
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "pregunta": "¿Qué puedo hacer para el dolor de cabeza?",
    "respuesta": "Para el dolor de cabeza, te recomiendo descansar en un lugar tranquilo...",
    "created_at": "2026-05-25T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  },
  "message": "consulta realizada"
}
```

**Response 503 (sin API key):**
```json
{ "error": "asistente no disponible" }
```
</details>

<details>
<summary><code>GET /ai/history</code></summary>

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "pregunta": "¿Qué puedo hacer para el dolor de cabeza?",
      "respuesta": "Para el dolor de cabeza, te recomiendo...",
      "created_at": "2026-05-25T10:00:00Z",
      "updated_at": "2026-05-25T10:00:00Z"
    }
  ]
}
```
</details>

---

### 9. Recordatorios — requieren auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/reminders` | ✅ | Recordatorios pendientes (no leídos + fecha ≤ ahora) |
| POST | `/reminders` | ✅ | Crear recordatorio manual |
| GET | `/reminders/history` | ✅ | Historial completo de recordatorios (`?page=&per_page=`) |
| PUT | `/reminders/:id` | ✅ | Actualizar recordatorio |
| PATCH | `/reminders/:id/read` | ✅ | Marcar como leído |
| DELETE | `/reminders/:id` | ✅ | Eliminar recordatorio |

Los recordatorios se crean automáticamente al agendar citas y registrar vacunas.

<details>
<summary><code>POST /reminders</code></summary>

`tipo` debe ser `cita`, `vacuna` o `manual`.

**Request:**
```json
{
  "titulo": "Tomar medicamento",
  "descripcion": "Recordatorio diario",
  "fecha": "2026-05-26T08:00:00",
  "tipo": "manual"
}
```

**Response 201:**
```json
{
  "data": {
    "id": 1,
    "user_id": 1,
    "titulo": "Tomar medicamento",
    "descripcion": "Recordatorio diario",
    "fecha": "2026-05-26T08:00:00Z",
    "leido": false,
    "tipo": "manual",
    "created_at": "2026-05-25T10:00:00Z",
    "updated_at": "2026-05-25T10:00:00Z"
  },
  "message": "recordatorio creado"
}
```
</details>

<details>
<summary><code>GET /reminders</code> — pendientes</summary>

Retorna recordatorios no leídos con `fecha ≤ ahora`, ordenados ascendente.

**Response 200:**
```json
{ "data": [ { "id": 1, "titulo": "Tomar medicamento", "leido": false, ... } ] }
```
</details>

<details>
<summary><code>GET /reminders/history</code></summary>

Soporta paginación con `?page=N&per_page=N`. Retorna recordatorios ordenados por `created_at` descendente.

**Response 200 (paginado):**
```json
{ "data": [ { "id": 2, "titulo": "Cita médica", "leido": true, ... } ], "meta": { "page": 1, "per_page": 20, "total": 47 } }
```
</details>

<details>
<summary><code>PUT /reminders/:id</code></summary>

Todos los campos son opcionales en update.

**Request:**
```json
{ "titulo": "Vacunación actualizada", "descripcion": "Ahora en el Centro de Salud", "fecha": "2026-06-15T08:00:00", "tipo": "vacuna" }
```

**Response 200:**
```json
{ "data": { "id": 1, "user_id": 1, "titulo": "Vacunación actualizada", "fecha": "2026-06-15T08:00:00Z", "leido": false, "tipo": "vacuna", "updated_at": "2026-05-25T10:05:00Z" } }
```
</details>

<details>
<summary><code>PATCH /reminders/:id/read</code></summary>

Scoped al usuario autenticado. No requiere body.

**Response 200:**
```json
{ "message": "recordatorio marcado como leído" }
```
</details>

<details>
<summary><code>DELETE /reminders/:id</code></summary>

Scoped al usuario autenticado. No requiere body.

**Response 200:**
```json
{ "message": "recordatorio eliminado" }
```
</details>

---

### 10. Síntesis de voz (TTS) — requiere auth

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/tts` | ✅ | Convertir texto a voz |

<details>
<summary><code>POST /tts</code></summary>

Convierte texto a voz usando Edge TTS (Microsoft neural voices). El texto se limpia de Markdown antes de sintetizar.

**Request:**
```json
{
  "text": "Hola, ¿cómo estás?"
}
```

`text` debe tener entre 1 y 2000 caracteres.

**Response 200:** `audio/mpeg` (binario MP3).

**Response 400:**
```json
{ "error": "texto requerido (1-2000 caracteres)" }
```

**Response 504:**
```json
{ "error": "el servicio TTS no respondió a tiempo" }
```
</details>
