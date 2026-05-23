package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type AlertService interface {
	Create(alert *models.EpiAlert) error
	GetByID(id uint) (*models.EpiAlert, error)
	GetAll(nivel, departamento string, soloActivas bool) ([]models.EpiAlert, error)
	Update(alert *models.EpiAlert) (*models.EpiAlert, error)
	Delete(id uint) error
	Deactivate(id uint) error
}

type alertService struct {
	repo repository.AlertRepository
}

func NewAlertService(repo repository.AlertRepository) AlertService {
	return &alertService{repo: repo}
}

func (s *alertService) Create(alert *models.EpiAlert) error {
	return s.repo.Create(alert)
}

func (s *alertService) GetByID(id uint) (*models.EpiAlert, error) {
	alert, err := s.repo.FindByID(id)
	if err != nil {
		return nil, err
	}
	return alert, nil
}

func (s *alertService) GetAll(nivel, departamento string, soloActivas bool) ([]models.EpiAlert, error) {
	return s.repo.FindAll(nivel, departamento, soloActivas)
}

func (s *alertService) Update(alert *models.EpiAlert) (*models.EpiAlert, error) {
	existing, err := s.repo.FindByID(alert.ID)
	if err != nil {
		return nil, err
	}
	existing.Titulo = alert.Titulo
	existing.Descripcion = alert.Descripcion
	existing.Nivel = alert.Nivel
	existing.Departamento = alert.Departamento
	existing.Fuente = alert.Fuente
	existing.Activa = alert.Activa
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *alertService) Delete(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	return s.repo.Delete(id)
}

func (s *alertService) Deactivate(id uint) error {
	_, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	return s.repo.Deactivate(id)
}
