package service

import (
	"math"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"gorm.io/gorm"
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
	Update(svc *models.HealthService) error
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
	svc, err := s.repo.FindByID(id)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, err
		}
		return nil, err
	}
	return svc, nil
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
		d := haversine(lat, lng, svc.Latitud, svc.Longitud)
		if d <= radiusKm {
			nearby = append(nearby, NearbyService{
				HealthService: svc,
				DistanciaKm:   math.Round(d*100) / 100,
			})
		}
	}
	return nearby, nil
}

func (s *serviceService) Update(svc *models.HealthService) error {
	return s.repo.Update(svc)
}

func (s *serviceService) Delete(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}

const earthRadiusKm = 6371.0

func haversine(lat1, lon1, lat2, lon2 float64) float64 {
	dLat := (lat2 - lat1) * math.Pi / 180
	dLon := (lon2 - lon1) * math.Pi / 180
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(lat1*math.Pi/180)*math.Cos(lat2*math.Pi/180)*
			math.Sin(dLon/2)*math.Sin(dLon/2)
	c := 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
	return earthRadiusKm * c
}
