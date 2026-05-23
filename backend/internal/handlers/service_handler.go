package handlers

import (
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type ServiceHandler struct {
	svcSvc service.ServiceService
}

func NewServiceHandler(svcSvc service.ServiceService) *ServiceHandler {
	return &ServiceHandler{svcSvc: svcSvc}
}

func (h *ServiceHandler) GetAll(c *gin.Context) {
	services, err := h.svcSvc.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, services)
}
