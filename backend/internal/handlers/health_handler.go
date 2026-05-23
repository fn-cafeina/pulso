package handlers

import (
	"net/http"
	"github.com/fn-cafeina/pulso/backend/internal/db"
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func CreateSymptomReport(c *gin.Context) {
	var report models.SymptomReport
	if err := c.ShouldBindJSON(&report); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.DB.Create(&report)
	c.JSON(http.StatusOK, gin.H{"message": "Report created"})
}
