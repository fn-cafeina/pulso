package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type VaccineService interface {
	BaseService[models.VaccinationRecord]
	GetByUserID(userID uint) ([]models.VaccinationRecord, error)
	Update(record *models.VaccinationRecord) (*models.VaccinationRecord, error)
	Delete(id, userID uint) error
}

type vaccineService struct {
	baseSvc[models.VaccinationRecord]
	repo repository.VaccineRepository
}

func NewVaccineService(repo repository.VaccineRepository) VaccineService {
	return &vaccineService{baseSvc: newBaseSvc[models.VaccinationRecord](repo), repo: repo}
}

func (s *vaccineService) GetByUserID(userID uint) ([]models.VaccinationRecord, error) {
	return s.repo.FindByUserID(userID)
}

func (s *vaccineService) Update(record *models.VaccinationRecord) (*models.VaccinationRecord, error) {
	existing, err := s.repo.FindScoped(record.ID, record.UserID)
	if err != nil {
		return nil, err
	}
	existing.NombreVacuna = record.NombreVacuna
	existing.FechaAplicacion = record.FechaAplicacion
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *vaccineService) Delete(id, userID uint) error {
	_, err := s.repo.FindScoped(id, userID)
	if err != nil {
		return err
	}
	return s.repo.DeleteScoped(id, userID)
}