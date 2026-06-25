package handlers

import (
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/models"
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
		NotFoundOrInternal(c, err, "recordatorio")
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
	reminder := &models.Reminder{
		UserID:      userID.(uint),
		Titulo:      req.Titulo,
		Descripcion: req.Descripcion,
		Fecha:       fecha,
		Tipo:        req.Tipo,
	}
	if err := h.reminderSvc.Create(reminder); err != nil {
		NotFoundOrInternal(c, err, "recordatorio")
		return
	}
	SuccessMsg(c, http.StatusCreated, "recordatorio creado", reminder)
}

func (h *ReminderHandler) GetHistory(c *gin.Context) {
	userID, _ := c.Get("user_id")
	p := ParsePagination(c)
	reminders, total, err := h.reminderSvc.GetAll(userID.(uint), p.Page, p.PerPage)
	if err != nil {
		NotFoundOrInternal(c, err, "recordatorio")
		return
	}
	PaginatedSuccess(c, http.StatusOK, reminders, PaginationMeta{Page: p.Page, PerPage: p.PerPage, Total: total})
}

func (h *ReminderHandler) Update(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

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
	reminder, err := h.reminderSvc.Update(&models.Reminder{
		BaseModel:   models.BaseModel{ID: id},
		UserID:      userID.(uint),
		Titulo:      req.Titulo,
		Descripcion: req.Descripcion,
		Fecha:       fecha,
		Tipo:        req.Tipo,
	})
	if err != nil {
		NotFoundOrInternal(c, err, "recordatorio")
		return
	}
	Success(c, http.StatusOK, reminder)
}

func (h *ReminderHandler) MarkAsRead(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.reminderSvc.MarkAsRead(id, userID.(uint)); err != nil {
		NotFoundOrInternal(c, err, "recordatorio")
		return
	}
	Msg(c, http.StatusOK, "recordatorio marcado como leído")
}

func (h *ReminderHandler) Delete(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.reminderSvc.Delete(id, userID.(uint)); err != nil {
		NotFoundOrInternal(c, err, "recordatorio")
		return
	}
	Msg(c, http.StatusOK, "recordatorio eliminado")
}
