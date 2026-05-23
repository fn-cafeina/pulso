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
