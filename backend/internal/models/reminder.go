package models

import (
	"time"

	"gorm.io/gorm"
)

type Reminder struct {
	gorm.Model
	UserID      uint      `json:"user_id"`
	Titulo      string    `json:"titulo" binding:"required"`
	Descripcion string    `json:"descripcion"`
	Fecha       time.Time `json:"fecha"`
	Leido       bool      `json:"leido" gorm:"default:false"`
	Tipo        string    `json:"tipo" binding:"oneof=cita vacuna manual"`
}
