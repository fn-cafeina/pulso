package service

import (
	"math"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type NearbyService struct {
	models.HealthService
	DistanciaKm float64 `json:"distancia_km"`
}

type ServiceService interface {
	Create(svc *models.HealthService) error
	GetByID(id uint) (*models.HealthService, error)
	GetAll() ([]models.HealthService, error)
	GetNearby(lat, lng, radiusKm float64) ([]NearbyService, error)
	Update(svc *models.HealthService) (*models.HealthService, error)
	Delete(id uint) error
}

type serviceService struct {
	repo repository.ServiceRepository
}

func NewServiceService(repo repository.ServiceRepository) ServiceService {
	return &serviceService{repo: repo}
}

func (s *serviceService) Create(svc *models.HealthService) error {
	return s.repo.Create(svc)
}

func (s *serviceService) GetByID(id uint) (*models.HealthService, error) {
	return s.repo.FindByID(id)
}

func (s *serviceService) GetAll() ([]models.HealthService, error) {
	return s.repo.FindAll()
}

func (s *serviceService) GetNearby(lat, lng, radiusKm float64) ([]NearbyService, error) {
	all, err := s.repo.FindAll()
	if err != nil {
		return nil, err
	}

	var nearby []NearbyService
	for _, svc := range all {
		d := Haversine(lat, lng, svc.Latitud, svc.Longitud)
		if d <= radiusKm {
			nearby = append(nearby, NearbyService{
				HealthService: svc,
				DistanciaKm:   math.Round(d*100) / 100,
			})
		}
	}
	return nearby, nil
}

func (s *serviceService) Update(svc *models.HealthService) (*models.HealthService, error) {
	existing, err := s.repo.FindByID(svc.ID)
	if err != nil {
		return nil, err
	}
	existing.Nombre = svc.Nombre
	existing.Tipo = svc.Tipo
	existing.Latitud = svc.Latitud
	existing.Longitud = svc.Longitud
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *serviceService) Delete(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}
