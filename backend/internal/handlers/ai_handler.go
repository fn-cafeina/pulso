package handlers

import (
	"fmt"
	"io"
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
		InternalError(c, err)
		return
	}

	SuccessMsg(c, http.StatusCreated, "consulta realizada", result)
}

func (h *AIHandler) ConsultStream(c *gin.Context) {
	var req AIConsultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")

	c.Writer.Header().Set("Content-Type", "text/event-stream")
	c.Writer.Header().Set("Cache-Control", "no-cache")
	c.Writer.Header().Set("Connection", "keep-alive")
	c.Writer.WriteHeader(http.StatusOK)

	flusher, canFlush := c.Writer.(http.Flusher)
	if !canFlush {
		Error(c, http.StatusInternalServerError, "streaming not supported")
		return
	}

	result, err := h.aiSvc.ConsultStream(c.Request.Context(), userID.(uint), req.Pregunta, func(chunk string) {
		_, _ = io.WriteString(c.Writer, fmt.Sprintf("data: %s\n\n", chunk))
		flusher.Flush()
	})

	if err != nil {
		if strings.Contains(err.Error(), "429") || strings.Contains(err.Error(), "RESOURCE_EXHAUSTED") {
			_, _ = io.WriteString(c.Writer, "event: error\ndata: El asistente está saturado, intenta de nuevo en unos segundos.\n\n")
		} else if strings.Contains(err.Error(), "not available") {
			_, _ = io.WriteString(c.Writer, fmt.Sprintf("event: error\ndata: %s\n\n", err.Error()))
		} else if strings.Contains(err.Error(), "context deadline") {
			_, _ = io.WriteString(c.Writer, "event: error\ndata: El asistente tardó demasiado en responder.\n\n")
		} else {
			_, _ = io.WriteString(c.Writer, "event: error\ndata: Error interno del asistente.\n\n")
		}
		flusher.Flush()
		return
	}

	_, _ = io.WriteString(c.Writer, fmt.Sprintf("event: done\ndata: %d\n\n", result.ID))
	flusher.Flush()
}

func (h *AIHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")

	history, err := h.aiSvc.GetHistory(userID.(uint))
	if err != nil {
		InternalError(c, err)
		return
	}

	Success(c, http.StatusOK, history)
}
