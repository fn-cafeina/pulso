package handlers

import (
	"net/http"
	"strconv"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type EventHandler struct {
	eventSvc service.EventService
}

func NewEventHandler(eventSvc service.EventService) *EventHandler {
	return &EventHandler{eventSvc: eventSvc}
}

func (h *EventHandler) Create(c *gin.Context) {
	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	fechaInicio, err := parseTime(req.FechaInicio)
	if err != nil {
		Error(c, http.StatusBadRequest, "formato de fecha_inicio inválido")
		return
	}

	event := &models.HealthEvent{
		Titulo:    req.Titulo,
		Tipo:      req.Tipo,
		Descripcion: req.Descripcion,
		Ubicacion: req.Ubicacion,
		Latitud:   req.Latitud,
		Longitud:  req.Longitud,
		Organizador: req.Organizador,
		FechaInicio: fechaInicio,
	}

	if req.FechaFin != "" {
		fechaFin, err := parseTime(req.FechaFin)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha_fin inválido")
			return
		}
		event.FechaFin = fechaFin
	}

	if err := h.eventSvc.Create(event); err != nil {
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	SuccessMsg(c, http.StatusCreated, "evento creado", event)
}

func (h *EventHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return
	}

	event, err := h.eventSvc.GetByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, http.StatusNotFound, "evento no encontrado")
			return
		}
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Success(c, http.StatusOK, event)
}

func (h *EventHandler) GetAll(c *gin.Context) {
	latStr := c.Query("lat")
	lngStr := c.Query("lng")
	radiusStr := c.Query("radius")

	if latStr != "" && lngStr != "" && radiusStr != "" {
		lat, err1 := strconv.ParseFloat(latStr, 64)
		lng, err2 := strconv.ParseFloat(lngStr, 64)
		radius, err3 := strconv.ParseFloat(radiusStr, 64)

		if err1 != nil || err2 != nil || err3 != nil {
			Error(c, http.StatusBadRequest, "latitud, longitud o radio inválidos")
			return
		}

		nearby, err := h.eventSvc.GetNearby(lat, lng, radius)
		if err != nil {
			Error(c, http.StatusInternalServerError, err.Error())
			return
		}

		Success(c, http.StatusOK, nearby)
		return
	}

	upcoming := c.Query("upcoming") == "true"
	events, err := h.eventSvc.GetAll(upcoming)
	if err != nil {
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Success(c, http.StatusOK, events)
}

func (h *EventHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return
	}

	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	existing, err := h.eventSvc.GetByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, http.StatusNotFound, "evento no encontrado")
			return
		}
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	if req.Titulo != "" {
		existing.Titulo = req.Titulo
	}
	if req.Tipo != "" {
		existing.Tipo = req.Tipo
	}
	if req.Descripcion != "" {
		existing.Descripcion = req.Descripcion
	}
	if req.FechaInicio != "" {
		t, err := parseTime(req.FechaInicio)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha_inicio inválido")
			return
		}
		existing.FechaInicio = t
	}
	if req.FechaFin != "" {
		t, err := parseTime(req.FechaFin)
		if err != nil {
			Error(c, http.StatusBadRequest, "formato de fecha_fin inválido")
			return
		}
		existing.FechaFin = t
	}
	if req.Ubicacion != "" {
		existing.Ubicacion = req.Ubicacion
	}
	if req.Latitud != nil {
		existing.Latitud = *req.Latitud
	}
	if req.Longitud != nil {
		existing.Longitud = *req.Longitud
	}
	if req.Organizador != "" {
		existing.Organizador = req.Organizador
	}

	updated, err := h.eventSvc.Update(existing)
	if err != nil {
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	SuccessMsg(c, http.StatusOK, "evento actualizado", updated)
}

func (h *EventHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return
	}

	if err := h.eventSvc.Delete(uint(id)); err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, http.StatusNotFound, "evento no encontrado")
			return
		}
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Msg(c, http.StatusOK, "evento eliminado")
}
