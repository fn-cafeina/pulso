package models

type AIConsultation struct {
	BaseModel
	UserID    uint   `json:"user_id"`
	Pregunta  string `json:"pregunta" binding:"required"`
	Respuesta string `json:"respuesta"`
}
