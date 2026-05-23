package main

import (
	"context"
	"log"

	"github.com/fn-cafeina/pulso/backend/internal/ai"
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
	eventRepo := repository.NewEventRepository(db.DB)
	alertRepo := repository.NewAlertRepository(db.DB)

	aiRepo := repository.NewAIRepository(db.DB)

	var geminiClient *ai.Client
	if cfg.GeminiAPIKey != "" {
		var err error
		geminiClient, err = ai.NewClient(context.Background(), cfg.GeminiAPIKey)
		if err != nil {
			log.Printf("warning: Gemini client failed: %v", err)
		}
	}

	authSvc := service.NewAuthService(userRepo, cfg.JWTSecret)
	healthSvc := service.NewHealthService(healthRepo)
	apptSvc := service.NewAppointmentService(apptRepo)
	svcSvc := service.NewServiceService(serviceRepo)
	eventSvc := service.NewEventService(eventRepo)
	alertSvc := service.NewAlertService(alertRepo)
	aiSvc := service.NewAIService(aiRepo, userRepo, healthRepo, apptRepo, geminiClient)

	authHandler := handlers.NewAuthHandler(authSvc)
	healthHandler := handlers.NewHealthHandler(healthSvc)
	apptHandler := handlers.NewAppointmentHandler(apptSvc)
	svcHandler := handlers.NewServiceHandler(svcSvc)
	eventHandler := handlers.NewEventHandler(eventSvc)
	alertHandler := handlers.NewAlertHandler(alertSvc)
	aiHandler := handlers.NewAIHandler(aiSvc)

	r := gin.Default()

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)
	r.GET("/services", svcHandler.GetAll)
	r.GET("/services/:id", svcHandler.GetByID)
	r.GET("/events", eventHandler.GetAll)
	r.GET("/events/:id", eventHandler.GetByID)
	r.GET("/alerts", alertHandler.GetAll)
	r.GET("/alerts/:id", alertHandler.GetByID)

	auth := r.Group("/", middleware.AuthMiddleware(cfg.JWTSecret))
	auth.POST("/services", svcHandler.Create)
	auth.PUT("/services/:id", svcHandler.Update)
	auth.DELETE("/services/:id", svcHandler.Delete)
	auth.GET("/symptoms", healthHandler.GetSymptoms)
	auth.POST("/symptoms", healthHandler.CreateSymptom)
	auth.GET("/vaccines", healthHandler.GetVaccines)
	auth.POST("/vaccines", healthHandler.CreateVaccine)
	auth.GET("/appointments", apptHandler.GetAll)
	auth.POST("/appointments", apptHandler.Create)
	auth.POST("/events", eventHandler.Create)
	auth.PUT("/events/:id", eventHandler.Update)
	auth.DELETE("/events/:id", eventHandler.Delete)
	auth.POST("/alerts", alertHandler.Create)
	auth.PUT("/alerts/:id", alertHandler.Update)
	auth.DELETE("/alerts/:id", alertHandler.Delete)
	auth.PATCH("/alerts/:id/deactivate", alertHandler.Deactivate)
	auth.POST("/ai/consult", aiHandler.Consult)
	auth.GET("/ai/history", aiHandler.GetHistory)

	if err := r.Run(cfg.Port); err != nil {
		panic(err)
	}
}
