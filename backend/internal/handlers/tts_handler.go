package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type TTSHandler struct {
	svc service.TTSService
}

func NewTTSHandler(svc service.TTSService) *TTSHandler {
	return &TTSHandler{svc: svc}
}

type TTSRequest struct {
	Text string `json:"text" binding:"required,min=1,max=2000"`
}

func (h *TTSHandler) Synthesize(c *gin.Context) {
	var req TTSRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, "texto requerido (1-2000 caracteres)")
		return
	}

	audio, err := h.svc.Synthesize(c.Request.Context(), req.Text)
	if err != nil {
		log.Printf("tts error: %v", err)
		if errors.Is(err, context.DeadlineExceeded) {
			Error(c, http.StatusGatewayTimeout, "el servicio TTS no respondió a tiempo")
			return
		}
		Error(c, http.StatusBadGateway, "error al generar audio")
		return
	}

	c.Data(http.StatusOK, "audio/mpeg", audio)
}
