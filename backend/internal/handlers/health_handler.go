package handlers

import (
	"log"
	"net/http"
	"time"

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
		InternalError(c, err)
		return
	}
	Success(c, http.StatusOK, reports)
}

func (h *HealthHandler) CreateVaccine(c *gin.Context) {
	var req CreateVaccineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	fecha := time.Now()
	if req.FechaAplicacion != "" {
		var err error
		fecha, err = parseTime(req.FechaAplicacion)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha inválido")
			return
		}
	}

	record, err := h.healthSvc.CreateVaccine(userID.(uint), req.NombreVacuna, fecha)
	if err != nil {
		InternalError(c, err)
		return
	}

	if !fecha.After(time.Now()) {
		log.Printf("skip reminder for past vaccine: %s", req.NombreVacuna)
	} else if _, err := h.reminderSvc.Create(userID.(uint), "Vacuna: "+req.NombreVacuna, "Registro de vacunación", "vacuna", fecha); err != nil {
		log.Printf("error: failed to create reminder: %v", err)
	}

	SuccessMsg(c, http.StatusCreated, "vacuna registrada", record)
}

func (h *HealthHandler) GetVaccines(c *gin.Context) {
	userID, _ := c.Get("user_id")
	records, err := h.healthSvc.GetVaccines(userID.(uint))
	if err != nil {
		InternalError(c, err)
		return
	}
	Success(c, http.StatusOK, records)
}

func (h *HealthHandler) CreateSymptom(c *gin.Context) {
	var req CreateSymptomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	fecha := time.Now()
	if req.Fecha != "" {
		var err error
		fecha, err = parseTime(req.Fecha)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha inválido")
			return
		}
	}

	report, err := h.healthSvc.CreateSymptom(userID.(uint), req.Descripcion, fecha)
	if err != nil {
		InternalError(c, err)
		return
	}

	SuccessMsg(c, http.StatusCreated, "síntoma registrado", report)
}
