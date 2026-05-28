package handlers

import (
	"net/http"
	"strconv"

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
		InternalError(c, err)
		return
	}
	Success(c, http.StatusOK, reminders)
}

func (h *ReminderHandler) Create(c *gin.Context) {
	var req CreateReminderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	fecha, err := parseTime(req.Fecha)
	if err != nil {
		Error(c, http.StatusBadRequest, "formato de fecha inválido")
		return
	}

	userID, _ := c.Get("user_id")
	reminder, err := h.reminderSvc.Create(userID.(uint), req.Titulo, req.Descripcion, req.Tipo, fecha)
	if err != nil {
		InternalError(c, err)
		return
	}
	SuccessMsg(c, http.StatusCreated, "recordatorio creado", reminder)
}

func (h *ReminderHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reminders, err := h.reminderSvc.GetAll(userID.(uint))
	if err != nil {
		InternalError(c, err)
		return
	}
	Success(c, http.StatusOK, reminders)
}

func (h *ReminderHandler) MarkAsRead(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "ID inválido")
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.reminderSvc.MarkAsRead(uint(id), userID.(uint)); err != nil {
		InternalError(c, err)
		return
	}
	Msg(c, http.StatusOK, "recordatorio marcado como leído")
}
