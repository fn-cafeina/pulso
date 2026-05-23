package handlers

import (
	"net/http"

	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"github.com/gin-gonic/gin"
)

type ServiceHandler struct {
	serviceRepo repository.ServiceRepository
}

func NewServiceHandler(serviceRepo repository.ServiceRepository) *ServiceHandler {
	return &ServiceHandler{serviceRepo: serviceRepo}
}

func (h *ServiceHandler) GetAll(c *gin.Context) {
	services, err := h.serviceRepo.FindAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, services)
}
