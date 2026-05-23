package models

import "gorm.io/gorm"

type AIConsultation struct {
	gorm.Model
	UserID    uint   `json:"user_id"`
	Pregunta  string `json:"pregunta" binding:"required"`
	Respuesta string `json:"respuesta"`
}
