package models

import (
	"time"

	"gorm.io/gorm"
)

type HealthEvent struct {
	gorm.Model
	Titulo      string    `json:"titulo" binding:"required"`
	Descripcion string    `json:"descripcion"`
	Tipo        string    `json:"tipo" binding:"required,oneof=jornada campana feria"`
	FechaInicio time.Time `json:"fecha_inicio" binding:"required"`
	FechaFin    time.Time `json:"fecha_fin"`
	Ubicacion   string    `json:"ubicacion"`
	Latitud     float64   `json:"latitud"`
	Longitud    float64   `json:"longitud"`
	Organizador string    `json:"organizador"`
}
