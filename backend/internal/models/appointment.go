package models

import "time"

type Appointment struct {
	BaseModel
	UserID      uint      `json:"user_id"`
	Fecha       time.Time `json:"fecha"`
	Descripcion string    `json:"descripcion" binding:"required"`
}
