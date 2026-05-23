package models

import (
	"gorm.io/gorm"
	"time"
)

type Appointment struct {
	gorm.Model
	UserID      uint      `json:"user_id"`
	Fecha       time.Time `json:"fecha"`
	Descripcion string    `json:"descripcion"`
}
