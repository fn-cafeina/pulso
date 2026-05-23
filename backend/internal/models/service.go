package models

import "gorm.io/gorm"

type HealthService struct {
	gorm.Model
	Nombre   string  `json:"nombre" binding:"required"`
	Tipo     string  `json:"tipo" binding:"required"`
	Latitud  float64 `json:"latitud"`
	Longitud float64 `json:"longitud"`
}
