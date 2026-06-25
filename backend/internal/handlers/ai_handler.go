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
	var req AIConsultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")

	result, err := h.aiSvc.Consult(userID.(uint), req.Pregunta)
	if err != nil {
		if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "RESOURCE_EXHAUSTED") {
			Error(c, http.StatusServiceUnavailable, "El asistente está saturado, intenta de nuevo en unos segundos.")
			return
		}
		if strings.Contains(err.Error(), "not available") {
			Error(c, http.StatusServiceUnavailable, err.Error())
			return
		}
		if strings.Contains(err.Error(), "context deadline") {
			Error(c, http.StatusGatewayTimeout, "El asistente tardó demasiado en responder.")
			return
		}
		Error(c, http.StatusInternalServerError, "error interno del servidor")
		return
	}

	SuccessMsg(c, http.StatusCreated, "consulta realizada", result)
}

func (h *AIHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")

	history, err := h.aiSvc.GetHistory(userID.(uint))
	if err != nil {
		Error(c, http.StatusInternalServerError, "error interno del servidor")
		return
	}

	Success(c, http.StatusOK, history)
}
