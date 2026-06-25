package handlers

import (
	"log"
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type AppointmentHandler struct {
	apptSvc     service.AppointmentService
	reminderSvc service.ReminderService
}

func NewAppointmentHandler(apptSvc service.AppointmentService, reminderSvc service.ReminderService) *AppointmentHandler {
	return &AppointmentHandler{apptSvc: apptSvc, reminderSvc: reminderSvc}
}

func (h *AppointmentHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("user_id")
	appts, err := h.apptSvc.GetByUserID(userID.(uint))
	if err != nil {
		NotFoundOrInternal(c, err, "cita")
		return
	}
	Success(c, http.StatusOK, appts)
}

func (h *AppointmentHandler) Create(c *gin.Context) {
	var req CreateAppointmentRequest
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
	appt := &models.Appointment{
		UserID:      userID.(uint),
		Descripcion: req.Descripcion,
		Fecha:       fecha,
	}
	if err := h.apptSvc.Create(appt); err != nil {
		NotFoundOrInternal(c, err, "cita")
		return
	}

	reminder := &models.Reminder{
		UserID:      userID.(uint),
		Titulo:      "Cita médica",
		Descripcion: req.Descripcion,
		Tipo:        "cita",
		Fecha:       fecha,
	}
	if err := h.reminderSvc.Create(reminder); err != nil {
		log.Printf("error: failed to create reminder: %v", err)
	}

	SuccessMsg(c, http.StatusCreated, "cita creada", appt)
}

func (h *AppointmentHandler) Update(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	var req UpdateAppointmentRequest
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
	appt, err := h.apptSvc.Update(&models.Appointment{
		BaseModel:   models.BaseModel{ID: id},
		UserID:      userID.(uint),
		Descripcion: req.Descripcion,
		Fecha:       fecha,
	})
	if err != nil {
		NotFoundOrInternal(c, err, "cita")
		return
	}

	SuccessMsg(c, http.StatusOK, "cita actualizada", appt)
}

func (h *AppointmentHandler) Delete(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.apptSvc.Delete(id, userID.(uint)); err != nil {
		NotFoundOrInternal(c, err, "cita")
		return
	}

	Msg(c, http.StatusOK, "cita eliminada")
}