package handlers

import (
	"net/http"
	"github.com/fn-cafeina/pulso/backend/internal/db"
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func GetHealthServices(c *gin.Context) {
	var services []models.HealthService
	db.DB.Find(&services)
	c.JSON(http.StatusOK, services)
}
