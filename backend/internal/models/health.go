package models

import (
	"time"
	"gorm.io/gorm"
)

type SymptomReport struct {
	gorm.Model
	UserID      uint      `json:"user_id"`
	Descripcion string    `json:"descripcion"`
	Fecha       time.Time `json:"fecha"`
}

type VaccinationRecord struct {
	gorm.Model
	UserID        uint      `json:"user_id"`
	NombreVacuna  string    `json:"nombre_vacuna"`
	FechaAplicacion time.Time `json:"fecha_aplicacion"`
}
