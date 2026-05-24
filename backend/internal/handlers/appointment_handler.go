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
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, appts)
}

func (h *AppointmentHandler) Create(c *gin.Context) {
	var appt models.Appointment
	if err := c.ShouldBindJSON(&appt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	appt.UserID = userID.(uint)

	if err := h.apptSvc.Create(&appt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if _, err := h.reminderSvc.Create(userID.(uint), "Cita médica", appt.Descripcion, "cita", appt.Fecha); err != nil {
		log.Printf("error: no se pudo crear recordatorio: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "cita creada"})
}
