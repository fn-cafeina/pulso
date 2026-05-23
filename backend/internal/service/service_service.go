package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type ServiceService interface {
	GetAll() ([]models.HealthService, error)
}

type serviceService struct {
	repo repository.ServiceRepository
}

func NewServiceService(repo repository.ServiceRepository) ServiceService {
	return &serviceService{repo: repo}
}

func (s *serviceService) GetAll() ([]models.HealthService, error) {
	return s.repo.FindAll()
}
