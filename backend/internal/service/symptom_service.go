package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type SymptomService interface {
	BaseService[models.SymptomReport]
	GetByUserID(userID uint) ([]models.SymptomReport, error)
	Update(report *models.SymptomReport) (*models.SymptomReport, error)
	Delete(id, userID uint) error
}

type symptomService struct {
	baseSvc[models.SymptomReport]
	repo repository.SymptomRepository
}

func NewSymptomService(repo repository.SymptomRepository) SymptomService {
	return &symptomService{baseSvc: newBaseSvc[models.SymptomReport](repo), repo: repo}
}

func (s *symptomService) GetByUserID(userID uint) ([]models.SymptomReport, error) {
	return s.repo.FindByUserID(userID)
}

func (s *symptomService) Update(report *models.SymptomReport) (*models.SymptomReport, error) {
	existing, err := s.repo.FindScoped(report.ID, report.UserID)
	if err != nil {
		return nil, err
	}
	existing.Descripcion = report.Descripcion
	existing.Fecha = report.Fecha
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *symptomService) Delete(id, userID uint) error {
	_, err := s.repo.FindScoped(id, userID)
	if err != nil {
		return err
	}
	return s.repo.DeleteScoped(id, userID)
}