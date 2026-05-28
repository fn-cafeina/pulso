package handlers

import (
	"log"
	"net/http"

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
		InternalError(c, err)
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
	appt, err := h.apptSvc.Create(userID.(uint), req.Descripcion, fecha)
	if err != nil {
		InternalError(c, err)
		return
	}

	if _, err := h.reminderSvc.Create(userID.(uint), "Cita médica", req.Descripcion, "cita", fecha); err != nil {
		log.Printf("error: failed to create reminder: %v", err)
	}

	SuccessMsg(c, http.StatusCreated, "cita creada", appt)
}
