package handlers

import (
	"net/http"
	"strconv"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ServiceHandler struct {
	svcSvc service.ServiceService
}

func NewServiceHandler(svcSvc service.ServiceService) *ServiceHandler {
	return &ServiceHandler{svcSvc: svcSvc}
}

func (h *ServiceHandler) Create(c *gin.Context) {
	var req CreateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	svc := &models.HealthService{
		Nombre:   req.Nombre,
		Tipo:     req.Tipo,
		Latitud:  req.Latitud,
		Longitud: req.Longitud,
	}

	if err := h.svcSvc.Create(svc); err != nil {
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	SuccessMsg(c, http.StatusCreated, "servicio creado", svc)
}

func (h *ServiceHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return
	}

	svc, err := h.svcSvc.GetByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, http.StatusNotFound, "servicio no encontrado")
			return
		}
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Success(c, http.StatusOK, svc)
}

func (h *ServiceHandler) GetAll(c *gin.Context) {
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

		nearby, err := h.svcSvc.GetNearby(lat, lng, radius)
		if err != nil {
			Error(c, http.StatusInternalServerError, err.Error())
			return
		}

		Success(c, http.StatusOK, nearby)
		return
	}

	services, err := h.svcSvc.GetAll()
	if err != nil {
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Success(c, http.StatusOK, services)
}

func (h *ServiceHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return
	}

	var req UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	existing, err := h.svcSvc.GetByID(uint(id))
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, http.StatusNotFound, "servicio no encontrado")
			return
		}
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	if req.Nombre != "" {
		existing.Nombre = req.Nombre
	}
	if req.Tipo != "" {
		existing.Tipo = req.Tipo
	}
	if req.Latitud != nil {
		existing.Latitud = *req.Latitud
	}
	if req.Longitud != nil {
		existing.Longitud = *req.Longitud
	}

	updated, err := h.svcSvc.Update(existing)
	if err != nil {
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	SuccessMsg(c, http.StatusOK, "servicio actualizado", updated)
}

func (h *ServiceHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return
	}

	if err := h.svcSvc.Delete(uint(id)); err != nil {
		if err == gorm.ErrRecordNotFound {
			Error(c, http.StatusNotFound, "servicio no encontrado")
			return
		}
		Error(c, http.StatusInternalServerError, err.Error())
		return
	}

	Msg(c, http.StatusOK, "servicio eliminado")
}
