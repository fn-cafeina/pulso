package main

import (
	"github.com/fn-cafeina/pulso/backend/internal/config"
	"github.com/fn-cafeina/pulso/backend/internal/db"
	"github.com/fn-cafeina/pulso/backend/internal/handlers"
	"github.com/fn-cafeina/pulso/backend/internal/middleware"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

func main() {
	cfg := config.Load()
	db.InitDB(cfg.DBPath)

	userRepo := repository.NewUserRepository(db.DB)
	apptRepo := repository.NewAppointmentRepository(db.DB)
	healthRepo := repository.NewHealthRepository(db.DB)
	serviceRepo := repository.NewServiceRepository(db.DB)

	authSvc := service.NewAuthService(userRepo, cfg.JWTSecret)
	healthSvc := service.NewHealthService(healthRepo)
	apptSvc := service.NewAppointmentService(apptRepo)
	svcSvc := service.NewServiceService(serviceRepo)

	authHandler := handlers.NewAuthHandler(authSvc)
	healthHandler := handlers.NewHealthHandler(healthSvc)
	apptHandler := handlers.NewAppointmentHandler(apptSvc)
	svcHandler := handlers.NewServiceHandler(svcSvc)

	r := gin.Default()

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)
	r.GET("/services", svcHandler.GetAll)

	auth := r.Group("/", middleware.AuthMiddleware(cfg.JWTSecret))
	auth.GET("/symptoms", healthHandler.GetSymptoms)
	auth.POST("/symptoms", healthHandler.CreateSymptom)
	auth.GET("/vaccines", healthHandler.GetVaccines)
	auth.POST("/vaccines", healthHandler.CreateVaccine)
	auth.GET("/appointments", apptHandler.GetAll)
	auth.POST("/appointments", apptHandler.Create)

	if err := r.Run(cfg.Port); err != nil {
		panic(err)
	}
}
