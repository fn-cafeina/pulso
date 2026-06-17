export interface BaseModel {
  id: number
  created_at: string
  updated_at: string
}

export type ServiceTipo = "hospital" | "clinica" | "puesto_salud"
export type EventTipo = "jornada" | "campana" | "feria"
export type AlertNivel = "bajo" | "medio" | "alto" | "critico"
export type ReminderTipo = "cita" | "vacuna" | "manual"
export type UserRol = "family" | "health_worker"

export interface User extends BaseModel {
  username: string
  antecedentes_medicos: string
  rol: UserRol
}

export interface SymptomReport extends BaseModel {
  user_id: number
  descripcion: string
  fecha: string
}

export interface VaccinationRecord extends BaseModel {
  user_id: number
  nombre_vacuna: string
  fecha_aplicacion: string
}

export interface Appointment extends BaseModel {
  user_id: number
  fecha: string
  descripcion: string
}

export interface HealthService extends BaseModel {
  nombre: string
  tipo: ServiceTipo
  latitud: number
  longitud: number
}

export interface HealthEvent extends BaseModel {
  titulo: string
  descripcion: string
  tipo: EventTipo
  fecha_inicio: string
  fecha_fin: string
  ubicacion: string
  latitud: number
  longitud: number
  organizador: string
}

export interface EpiAlert extends BaseModel {
  titulo: string
  descripcion: string
  nivel: AlertNivel
  departamento: string
  fuente: string
  activa: boolean
}

export interface AIConsultation extends BaseModel {
  user_id: number
  pregunta: string
  respuesta: string
}

export interface Reminder extends BaseModel {
  user_id: number
  titulo: string
  descripcion: string
  fecha: string
  leido: boolean
  tipo: ReminderTipo
}

export interface NearbyService extends HealthService {
  distancia_km: number
}

export interface NearbyEvent extends HealthEvent {
  distancia_km: number
}

export interface PaginationMeta {
  page: number
  per_page: number
  total: number
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  meta?: PaginationMeta
}

export interface AlertQuery {
  page?: number
  per_page?: number
  nivel?: AlertNivel
  departamento?: string
  activas?: boolean
}
