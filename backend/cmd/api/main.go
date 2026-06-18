package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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
	reminderRepo := repository.NewReminderRepository(db.DB)

	var provider ai.Provider
	if cfg.NVIDIAAPIKey != "" {
		provider = ai.NewProvider(cfg.NVIDIAAPIKey, cfg.NVIDIAModel)
	}

	authSvc := service.NewAuthService(userRepo, cfg.JWTSecret, cfg.HealthWorkerSecret)
	healthSvc := service.NewHealthService(healthRepo)
	apptSvc := service.NewAppointmentService(apptRepo)
	svcSvc := service.NewServiceService(serviceRepo)
	eventSvc := service.NewEventService(eventRepo)
	alertSvc := service.NewAlertService(alertRepo)
	aiSvc := service.NewAIService(aiRepo, userRepo, healthRepo, apptRepo, provider)
	reminderSvc := service.NewReminderService(reminderRepo)

	authHandler := handlers.NewAuthHandler(authSvc)
	healthHandler := handlers.NewHealthHandler(healthSvc, reminderSvc)
	apptHandler := handlers.NewAppointmentHandler(apptSvc, reminderSvc)
	svcHandler := handlers.NewServiceHandler(svcSvc)
	eventHandler := handlers.NewEventHandler(eventSvc)
	alertHandler := handlers.NewAlertHandler(alertSvc)
	aiHandler := handlers.NewAIHandler(aiSvc)
	reminderHandler := handlers.NewReminderHandler(reminderSvc)

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(middleware.CORS(cfg.CORSOrigin))

	r.POST("/register", authHandler.Register)
	r.POST("/login", authHandler.Login)
	r.GET("/services", svcHandler.GetAll)
	r.GET("/services/:id", svcHandler.GetByID)
	r.GET("/events", eventHandler.GetAll)
	r.GET("/events/:id", eventHandler.GetByID)
	r.GET("/alerts", alertHandler.GetAll)
	r.GET("/alerts/:id", alertHandler.GetByID)

	auth := r.Group("/", middleware.AuthMiddleware(cfg.JWTSecret))
	hw := auth.Group("/", middleware.RoleRequired("health_worker"))

	hw.POST("/services", svcHandler.Create)
	hw.PUT("/services/:id", svcHandler.Update)
	hw.DELETE("/services/:id", svcHandler.Delete)
	hw.POST("/events", eventHandler.Create)
	hw.PUT("/events/:id", eventHandler.Update)
	hw.DELETE("/events/:id", eventHandler.Delete)
	hw.POST("/alerts", alertHandler.Create)
	hw.PUT("/alerts/:id", alertHandler.Update)
	hw.DELETE("/alerts/:id", alertHandler.Delete)
	hw.PATCH("/alerts/:id/deactivate", alertHandler.Deactivate)

	auth.GET("/symptoms", healthHandler.GetSymptoms)
	auth.POST("/symptoms", healthHandler.CreateSymptom)
	auth.GET("/vaccines", healthHandler.GetVaccines)
	auth.POST("/vaccines", healthHandler.CreateVaccine)
	auth.GET("/appointments", apptHandler.GetAll)
	auth.POST("/appointments", apptHandler.Create)
	auth.POST("/ai/consult", aiHandler.Consult)
	auth.GET("/ai/history", aiHandler.GetHistory)
	auth.GET("/reminders", reminderHandler.GetPending)
	auth.POST("/reminders", reminderHandler.Create)
	auth.GET("/reminders/history", reminderHandler.GetHistory)
	auth.PUT("/reminders/:id", reminderHandler.Update)
	auth.PATCH("/reminders/:id/read", reminderHandler.MarkAsRead)
	auth.DELETE("/reminders/:id", reminderHandler.Delete)

	srv := &http.Server{
		Addr:    cfg.Port,
		Handler: r,
	}

	go func() {
		log.Printf("server started on %s", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			panic(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("shutting down server...")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("server shutdown error: %v", err)
	}
	log.Println("server stopped")
}
