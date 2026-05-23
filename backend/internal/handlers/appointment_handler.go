package handlers

import (
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type AppointmentHandler struct {
	apptRepo repository.AppointmentRepository
}

func NewAppointmentHandler(apptRepo repository.AppointmentRepository) *AppointmentHandler {
	return &AppointmentHandler{apptRepo: apptRepo}
}

func (h *AppointmentHandler) GetAll(c *gin.Context) {
	userID, _ := c.Get("user_id")
	appts, err := h.apptRepo.FindByUserID(userID.(uint))
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

	if err := h.apptRepo.Create(&appt); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Appointment created"})
}
