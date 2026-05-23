package main

import (
	"github.com/fn-cafeina/pulso/backend/internal/db"
	"github.com/fn-cafeina/pulso/backend/internal/handlers"
	"github.com/gin-gonic/gin"
)

func main() {
	db.InitDB()
	r := gin.Default()
	
	r.POST("/register", handlers.Register)
	r.POST("/symptoms", handlers.CreateSymptomReport)
	r.POST("/appointments", handlers.CreateAppointment)
	r.GET("/services", handlers.GetHealthServices)
	
	r.Run(":8080")
}
