package handlers

import (
	"net/http"
	"strings"

	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type AIHandler struct {
	aiSvc service.AIService
}

func NewAIHandler(aiSvc service.AIService) *AIHandler {
	return &AIHandler{aiSvc: aiSvc}
}

func (h *AIHandler) Consult(c *gin.Context) {
	var req struct {
		Pregunta string `json:"pregunta" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")

	result, err := h.aiSvc.Consult(userID.(uint), req.Pregunta)
	if err != nil {
		if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "RESOURCE_EXHAUSTED") {
			c.JSON(http.StatusServiceUnavailable, gin.H{
				"error": "El asistente está saturado, intenta de nuevo en unos segundos.",
			})
			return
		}
		if strings.Contains(err.Error(), "no disponible") {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": err.Error()})
			return
		}
		if strings.Contains(err.Error(), "context deadline") {
			c.JSON(http.StatusGatewayTimeout, gin.H{"error": "El asistente tardó demasiado en responder."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, result)
}

func (h *AIHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")

	history, err := h.aiSvc.GetHistory(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, history)
}
