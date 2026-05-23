package handlers

import (
	"net/http"
	"github.com/fn-cafeina/pulso/backend/internal/db"
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var user models.User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	db.DB.Create(&user)
	c.JSON(http.StatusOK, gin.H{"message": "User registered"})
}
