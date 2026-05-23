package handlers

import (
	"net/http"
	"github.com/fn-cafeina/pulso/backend/internal/db"
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func CreateAppointment(c *gin.Context) {
	var appt models.Appointment
	if err := c.ShouldBindJSON(&appt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.DB.Create(&appt)
	c.JSON(http.StatusOK, gin.H{"message": "Appointment created"})
}
