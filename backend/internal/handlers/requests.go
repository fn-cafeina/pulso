package handlers

import (
	"fmt"
	"time"
)

type CreateSymptomRequest struct {
	Descripcion string `json:"descripcion" binding:"required"`
	Fecha       string `json:"fecha"`
}

type CreateVaccineRequest struct {
	NombreVacuna    string `json:"nombre_vacuna" binding:"required"`
	FechaAplicacion string `json:"fecha_aplicacion"`
}

type CreateAppointmentRequest struct {
	Fecha       string `json:"fecha" binding:"required"`
	Descripcion string `json:"descripcion" binding:"required"`
}

type CreateServiceRequest struct {
	Nombre   string  `json:"nombre" binding:"required"`
	Tipo     string  `json:"tipo" binding:"required,oneof=hospital clinica puesto_salud"`
	Latitud  float64 `json:"latitud"`
	Longitud float64 `json:"longitud"`
}

type UpdateServiceRequest struct {
	Nombre   string   `json:"nombre"`
	Tipo     string   `json:"tipo" binding:"omitempty,oneof=hospital clinica puesto_salud"`
	Latitud  *float64 `json:"latitud"`
	Longitud *float64 `json:"longitud"`
}

type CreateEventRequest struct {
	Titulo      string  `json:"titulo" binding:"required"`
	Tipo        string  `json:"tipo" binding:"required,oneof=jornada campana feria"`
	Descripcion string  `json:"descripcion"`
	FechaInicio string  `json:"fecha_inicio" binding:"required"`
	FechaFin    string  `json:"fecha_fin"`
	Ubicacion   string  `json:"ubicacion"`
	Latitud     float64 `json:"latitud"`
	Longitud    float64 `json:"longitud"`
	Organizador string  `json:"organizador"`
}

type UpdateEventRequest struct {
	Titulo      string   `json:"titulo"`
	Tipo        string   `json:"tipo" binding:"omitempty,oneof=jornada campana feria"`
	Descripcion string   `json:"descripcion"`
	FechaInicio string   `json:"fecha_inicio"`
	FechaFin    string   `json:"fecha_fin"`
	Ubicacion   string   `json:"ubicacion"`
	Latitud     *float64 `json:"latitud"`
	Longitud    *float64 `json:"longitud"`
	Organizador string   `json:"organizador"`
}

type CreateAlertRequest struct {
	Titulo       string `json:"titulo" binding:"required"`
	Descripcion  string `json:"descripcion" binding:"required"`
	Nivel        string `json:"nivel" binding:"required,oneof=bajo medio alto critico"`
	Departamento string `json:"departamento"`
	Fuente       string `json:"fuente"`
}

type UpdateAlertRequest struct {
	Titulo       string `json:"titulo"`
	Descripcion  string `json:"descripcion"`
	Nivel        string `json:"nivel" binding:"omitempty,oneof=bajo medio alto critico"`
	Departamento string `json:"departamento"`
	Fuente       string `json:"fuente"`
	Activa       *bool  `json:"activa"`
}

type CreateReminderRequest struct {
	Titulo      string `json:"titulo" binding:"required"`
	Descripcion string `json:"descripcion"`
	Fecha       string `json:"fecha" binding:"required"`
	Tipo        string `json:"tipo" binding:"required,oneof=cita vacuna manual"`
}

type AIConsultRequest struct {
	Pregunta string `json:"pregunta" binding:"required"`
}

func parseTime(s string) (time.Time, error) {
	formats := []string{
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, fmt.Errorf("invalid date format: %s", s)
}
