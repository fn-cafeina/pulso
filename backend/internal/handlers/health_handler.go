package handlers

import (
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	healthRepo repository.HealthRepository
}

func NewHealthHandler(healthRepo repository.HealthRepository) *HealthHandler {
	return &HealthHandler{healthRepo: healthRepo}
}

func (h *HealthHandler) GetSymptoms(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reports, err := h.healthRepo.FindSymptomsByUserID(userID.(uint))
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

	if err := h.healthRepo.CreateVaccine(&record); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Vaccination record created"})
}

func (h *HealthHandler) GetVaccines(c *gin.Context) {
	userID, _ := c.Get("user_id")
	records, err := h.healthRepo.FindVaccinesByUserID(userID.(uint))
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

	if err := h.healthRepo.CreateSymptom(&report); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Symptom report created"})
}
