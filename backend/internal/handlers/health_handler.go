package handlers

import (
	"log"
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	healthSvc   service.HealthService
	reminderSvc service.ReminderService
}

func NewHealthHandler(healthSvc service.HealthService, reminderSvc service.ReminderService) *HealthHandler {
	return &HealthHandler{healthSvc: healthSvc, reminderSvc: reminderSvc}
}

func (h *HealthHandler) GetSymptoms(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reports, err := h.healthSvc.GetSymptoms(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, reports)
}

func (h *HealthHandler) CreateVaccine(c *gin.Context) {
	var record models.VaccinationRecord
	if err := c.ShouldBindJSON(&record); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	record.UserID = userID.(uint)

	if err := h.healthSvc.CreateVaccine(&record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if _, err := h.reminderSvc.Create(userID.(uint), "Vacuna: "+record.NombreVacuna, "Registro de vacunación", "vacuna", record.FechaAplicacion); err != nil {
		log.Printf("error: no se pudo crear recordatorio: %v", err)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "vacuna registrada"})
}

func (h *HealthHandler) GetVaccines(c *gin.Context) {
	userID, _ := c.Get("user_id")
	records, err := h.healthSvc.GetVaccines(userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, records)
}

func (h *HealthHandler) CreateSymptom(c *gin.Context) {
	var report models.SymptomReport
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, _ := c.Get("user_id")
	report.UserID = userID.(uint)

	if err := h.healthSvc.CreateSymptom(&report); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "síntoma registrado"})
}
