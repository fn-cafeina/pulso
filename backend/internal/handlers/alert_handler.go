package handlers

import (
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type AlertHandler struct {
	alertSvc service.AlertService
}

func NewAlertHandler(alertSvc service.AlertService) *AlertHandler {
	return &AlertHandler{alertSvc: alertSvc}
}

func (h *AlertHandler) Create(c *gin.Context) {
	var req CreateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	alert := &models.EpiAlert{
		Titulo:       req.Titulo,
		Descripcion:  req.Descripcion,
		Nivel:        req.Nivel,
		Departamento: req.Departamento,
		Fuente:       req.Fuente,
		Activa:       true,
	}

	if err := h.alertSvc.Create(alert); err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	SuccessMsg(c, http.StatusCreated, "alerta creada", alert)
}

func (h *AlertHandler) GetAll(c *gin.Context) {
	nivel := c.Query("nivel")
	departamento := c.Query("departamento")
	soloActivas := c.Query("activas") == "true"
	p := ParsePagination(c)

	alerts, total, err := h.alertSvc.GetAll(nivel, departamento, soloActivas, p.Page, p.PerPage)
	if err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	if p.IsEnabled() {
		PaginatedSuccess(c, http.StatusOK, alerts, PaginationMeta{
			Page:    p.Page,
			PerPage: p.PerPage,
			Total:   total,
		})
		return
	}

	Success(c, http.StatusOK, alerts)
}

func (h *AlertHandler) GetByID(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	alert, err := h.alertSvc.GetByID(id)
	if err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	Success(c, http.StatusOK, alert)
}

func (h *AlertHandler) Update(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	var req UpdateAlertRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, err.Error())
		return
	}

	existing, err := h.alertSvc.GetByID(id)
	if err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	if req.Titulo != "" {
		existing.Titulo = req.Titulo
	}
	if req.Descripcion != "" {
		existing.Descripcion = req.Descripcion
	}
	if req.Nivel != "" {
		existing.Nivel = req.Nivel
	}
	if req.Departamento != "" {
		existing.Departamento = req.Departamento
	}
	if req.Fuente != "" {
		existing.Fuente = req.Fuente
	}
	if req.Activa != nil {
		existing.Activa = *req.Activa
	}

	updated, err := h.alertSvc.Update(existing)
	if err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	SuccessMsg(c, http.StatusOK, "alerta actualizada", updated)
}

func (h *AlertHandler) Delete(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	if err := h.alertSvc.Delete(id); err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	Msg(c, http.StatusOK, "alerta eliminada")
}

func (h *AlertHandler) Deactivate(c *gin.Context) {
	id, err := ParseID(c)
	if err != nil {
		return
	}

	if err := h.alertSvc.Deactivate(id); err != nil {
		NotFoundOrInternal(c, err, "alerta")
		return
	}

	Msg(c, http.StatusOK, "alerta desactivada")
}