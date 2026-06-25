package handlers

import (
	"log"
	"net/http"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type HealthHandler struct {
	symptomSvc  service.SymptomService
	vaccineSvc  service.VaccineService
	reminderSvc service.ReminderService
}

func NewHealthHandler(symptomSvc service.SymptomService, vaccineSvc service.VaccineService, reminderSvc service.ReminderService) *HealthHandler {
	return &HealthHandler{symptomSvc: symptomSvc, vaccineSvc: vaccineSvc, reminderSvc: reminderSvc}
}

func (h *HealthHandler) GetSymptoms(c *gin.Context) {
	userID, _ := c.Get("user_id")
	reports, err := h.symptomSvc.GetByUserID(userID.(uint))
	if err != nil {
		NotFoundOrInternal(c, err, "síntoma")
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

	record := &models.VaccinationRecord{
		UserID:          userID.(uint),
		NombreVacuna:    req.NombreVacuna,
		FechaAplicacion: fecha,
	}
	if err := h.vaccineSvc.Create(record); err != nil {
		NotFoundOrInternal(c, err, "vacuna")
		return
	}

	if !fecha.After(time.Now()) {
		log.Printf("skip reminder for past vaccine: %s", req.NombreVacuna)
	} else if err := h.reminderSvc.Create(&models.Reminder{
		UserID:      userID.(uint),
		Titulo:      "Vacuna: " + req.NombreVacuna,
		Descripcion: "Registro de vacunación",
		Tipo:        "vacuna",
		Fecha:       fecha,
	}); err != nil {
		log.Printf("error: failed to create reminder: %v", err)
	}

	SuccessMsg(c, http.StatusCreated, "vacuna registrada", record)
}

func (h *HealthHandler) GetVaccines(c *gin.Context) {
	userID, _ := c.Get("user_id")
	records, err := h.vaccineSvc.GetByUserID(userID.(uint))
	if err != nil {
		NotFoundOrInternal(c, err, "vacuna")
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

	report := &models.SymptomReport{
		UserID:      userID.(uint),
		Descripcion: req.Descripcion,
		Fecha:       fecha,
	}
	if err := h.symptomSvc.Create(report); err != nil {
		NotFoundOrInternal(c, err, "síntoma")
		return
	}

	SuccessMsg(c, http.StatusCreated, "síntoma registrado", report)
}

func (h *HealthHandler) UpdateSymptom(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	var req UpdateSymptomRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	fecha := time.Now()
	if req.Fecha != "" {
		fecha, err = parseTime(req.Fecha)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha inválido")
			return
		}
	}

	report, err := h.symptomSvc.Update(&models.SymptomReport{
		BaseModel:   models.BaseModel{ID: id},
		UserID:      userID.(uint),
		Descripcion: req.Descripcion,
		Fecha:       fecha,
	})
	if err != nil {
		NotFoundOrInternal(c, err, "síntoma")
		return
	}

	SuccessMsg(c, http.StatusOK, "síntoma actualizado", report)
}

func (h *HealthHandler) DeleteSymptom(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.symptomSvc.Delete(id, userID.(uint)); err != nil {
		NotFoundOrInternal(c, err, "síntoma")
		return
	}

	Msg(c, http.StatusOK, "síntoma eliminado")
}

func (h *HealthHandler) UpdateVaccine(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	var req UpdateVaccineRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	userID, _ := c.Get("user_id")
	fecha := time.Now()
	if req.FechaAplicacion != "" {
		fecha, err = parseTime(req.FechaAplicacion)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha inválido")
			return
		}
	}

	record, err := h.vaccineSvc.Update(&models.VaccinationRecord{
		BaseModel:       models.BaseModel{ID: id},
		UserID:          userID.(uint),
		NombreVacuna:    req.NombreVacuna,
		FechaAplicacion: fecha,
	})
	if err != nil {
		NotFoundOrInternal(c, err, "vacuna")
		return
	}

	SuccessMsg(c, http.StatusOK, "vacuna actualizada", record)
}

func (h *HealthHandler) DeleteVaccine(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	userID, _ := c.Get("user_id")
	if err := h.vaccineSvc.Delete(id, userID.(uint)); err != nil {
		NotFoundOrInternal(c, err, "vacuna")
		return
	}

	Msg(c, http.StatusOK, "vacuna eliminada")
}
