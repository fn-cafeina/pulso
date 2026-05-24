package service

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type HealthService interface {
	CreateSymptom(userID uint, descripcion string, fecha time.Time) (*models.SymptomReport, error)
	GetSymptoms(userID uint) ([]models.SymptomReport, error)
	CreateVaccine(userID uint, nombre string, fecha time.Time) (*models.VaccinationRecord, error)
	GetVaccines(userID uint) ([]models.VaccinationRecord, error)
}

type healthService struct {
	repo repository.HealthRepository
}

func NewHealthService(repo repository.HealthRepository) HealthService {
	return &healthService{repo: repo}
}

func (s *healthService) CreateSymptom(userID uint, descripcion string, fecha time.Time) (*models.SymptomReport, error) {
	report := &models.SymptomReport{
		UserID:      userID,
		Descripcion: descripcion,
		Fecha:       fecha,
	}
	if err := s.repo.CreateSymptom(report); err != nil {
		return nil, err
	}
	return report, nil
}

func (s *healthService) GetSymptoms(userID uint) ([]models.SymptomReport, error) {
	return s.repo.FindSymptomsByUserID(userID)
}

func (s *healthService) CreateVaccine(userID uint, nombre string, fecha time.Time) (*models.VaccinationRecord, error) {
	record := &models.VaccinationRecord{
		UserID:          userID,
		NombreVacuna:    nombre,
		FechaAplicacion: fecha,
	}
	if err := s.repo.CreateVaccine(record); err != nil {
		return nil, err
	}
	return record, nil
}

func (s *healthService) GetVaccines(userID uint) ([]models.VaccinationRecord, error) {
	return s.repo.FindVaccinesByUserID(userID)
}
