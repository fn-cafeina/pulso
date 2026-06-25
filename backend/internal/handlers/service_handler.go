package handlers

import (
	"net/http"
	"strconv"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
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
		NotFoundOrInternal(c, err, "servicio")
		return
	}

	SuccessMsg(c, http.StatusCreated, "servicio creado", svc)
}

func (h *ServiceHandler) GetByID(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	svc, err := h.svcSvc.GetByID(id)
	if err != nil {
		NotFoundOrInternal(c, err, "servicio")
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
			NotFoundOrInternal(c, err, "servicio")
			return
		}

		Success(c, http.StatusOK, nearby)
		return
	}

	p := ParsePagination(c)
	services, total, err := h.svcSvc.GetAll(p.Page, p.PerPage)
	if err != nil {
		NotFoundOrInternal(c, err, "servicio")
		return
	}

	if p.IsEnabled() {
		PaginatedSuccess(c, http.StatusOK, services, PaginationMeta{
			Page:    p.Page,
			PerPage: p.PerPage,
			Total:   total,
		})
		return
	}

	Success(c, http.StatusOK, services)
}

func (h *ServiceHandler) Update(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	var req UpdateServiceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	existing, err := h.svcSvc.GetByID(id)
	if err != nil {
		NotFoundOrInternal(c, err, "servicio")
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
		NotFoundOrInternal(c, err, "servicio")
		return
	}

	SuccessMsg(c, http.StatusOK, "servicio actualizado", updated)
}

func (h *ServiceHandler) Delete(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	if err := h.svcSvc.Delete(id); err != nil {
		NotFoundOrInternal(c, err, "servicio")
		return
	}

	Msg(c, http.StatusOK, "servicio eliminado")
}
