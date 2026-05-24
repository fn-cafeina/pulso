package handlers

import (
	"errors"
	"net/http"
	"strconv"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ReminderHandler struct {
	reminderSvc service.ReminderService
}

func NewReminderHandler(reminderSvc service.ReminderService) *ReminderHandler {
	return &ReminderHandler{reminderSvc: reminderSvc}
}

func (h *ReminderHandler) GetPending(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reminders, err := h.reminderSvc.GetPending(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reminders)
}

func (h *ReminderHandler) Create(c *gin.Context) {
	var req struct {
		Titulo      string `json:"titulo" binding:"required"`
		Descripcion string `json:"descripcion"`
		Fecha       string `json:"fecha" binding:"required"`
		Tipo        string `json:"tipo" binding:"required,oneof=cita vacuna manual"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	fecha, err := parseTime(req.Fecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "formato de fecha inválido"})
		return
	}

	userID, _ := c.Get("user_id")
	reminder, err := h.reminderSvc.Create(userID.(uint), req.Titulo, req.Descripcion, req.Tipo, fecha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, reminder)
}

func (h *ReminderHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reminders, err := h.reminderSvc.GetAll(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reminders)
}

func (h *ReminderHandler) MarkAsRead(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.reminderSvc.MarkAsRead(uint(id), userID.(uint)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "recordatorio marcado como leído"})
}

func parseTime(s string) (time.Time, error) {
	formats := []string{
		"2006-01-02T15:04:05Z",
		"2006-01-02T15:04:05",
		"2006-01-02",
	}
	for _, f := range formats {
		if t, err := time.Parse(f, s); err == nil {
			return t, nil
		}
	}
	return time.Time{}, errors.New("formato inválido")
}
