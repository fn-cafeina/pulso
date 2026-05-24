package models

import "time"

type SymptomReport struct {
	BaseModel
	UserID      uint      `json:"user_id"`
	Descripcion string    `json:"descripcion" binding:"required"`
	Fecha       time.Time `json:"fecha"`
}

type VaccinationRecord struct {
	BaseModel
	UserID          uint      `json:"user_id"`
	NombreVacuna    string    `json:"nombre_vacuna" binding:"required"`
	FechaAplicacion time.Time `json:"fecha_aplicacion"`
}
