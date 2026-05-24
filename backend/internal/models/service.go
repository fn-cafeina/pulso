package models

type HealthService struct {
	BaseModel
	Nombre   string  `json:"nombre" binding:"required"`
	Tipo     string  `json:"tipo" binding:"required"`
	Latitud  float64 `json:"latitud"`
	Longitud float64 `json:"longitud"`
}
