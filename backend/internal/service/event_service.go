package service

import (
	"math"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type NearbyEvent struct {
	models.HealthEvent
	DistanciaKm float64 `json:"distancia_km"`
}

type EventService interface {
	BaseService[models.HealthEvent]
	GetByID(id uint) (*models.HealthEvent, error)
	GetAll(upcoming bool, page, perPage int) ([]models.HealthEvent, int64, error)
	GetNearby(lat, lng, radiusKm float64) ([]NearbyEvent, error)
	Update(event *models.HealthEvent) (*models.HealthEvent, error)
	Delete(id uint) error
}

type eventService struct {
	baseSvc[models.HealthEvent]
	repo repository.EventRepository
}

func NewEventService(repo repository.EventRepository) EventService {
	return &eventService{baseSvc: newBaseSvc[models.HealthEvent](repo), repo: repo}
}

func (s *eventService) GetByID(id uint) (*models.HealthEvent, error) {
	event, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return event, nil
}

func (s *eventService) GetAll(upcoming bool, page, perPage int) ([]models.HealthEvent, int64, error) {
	return s.repo.FindAll(upcoming, page, perPage)
}

func (s *eventService) GetNearby(lat, lng, radiusKm float64) ([]NearbyEvent, error) {
	all, _, err := s.repo.FindAll(true, 0, 0)
	if err != nil {
		return nil, err
	}

	var nearby []NearbyEvent
	for _, event := range all {
		d := Haversine(lat, lng, event.Latitud, event.Longitud)
		if d <= radiusKm {
			nearby = append(nearby, NearbyEvent{
				HealthEvent: event,
				DistanciaKm: math.Round(d*100) / 100,
			})
		}
	}
	return nearby, nil
}

func (s *eventService) Update(event *models.HealthEvent) (*models.HealthEvent, error) {
	existing, err := s.repo.FindByID(event.ID)
	if err != nil {
		return nil, err
	}
	existing.Titulo = event.Titulo
	existing.Descripcion = event.Descripcion
	existing.Tipo = event.Tipo
	existing.FechaInicio = event.FechaInicio
	existing.FechaFin = event.FechaFin
	existing.Ubicacion = event.Ubicacion
	existing.Latitud = event.Latitud
	existing.Longitud = event.Longitud
	existing.Organizador = event.Organizador
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *eventService) Delete(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}