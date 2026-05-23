package models

import "gorm.io/gorm"

type HealthService struct {
	gorm.Model
	Nombre   string  `json:"nombre"`
	Tipo     string  `json:"tipo"`
	Latitud  float64 `json:"latitud"`
	Longitud float64 `json:"longitud"`
}
