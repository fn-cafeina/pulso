package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type HealthService interface {
	CreateSymptom(report *models.SymptomReport) error
	GetSymptoms(userID uint) ([]models.SymptomReport, error)
	CreateVaccine(record *models.VaccinationRecord) error
	GetVaccines(userID uint) ([]models.VaccinationRecord, error)
}

type healthService struct {
	repo repository.HealthRepository
}

func NewHealthService(repo repository.HealthRepository) HealthService {
	return &healthService{repo: repo}
}

func (s *healthService) CreateSymptom(report *models.SymptomReport) error {
	return s.repo.CreateSymptom(report)
}

func (s *healthService) GetSymptoms(userID uint) ([]models.SymptomReport, error) {
	return s.repo.FindSymptomsByUserID(userID)
}

func (s *healthService) CreateVaccine(record *models.VaccinationRecord) error {
	return s.repo.CreateVaccine(record)
}

func (s *healthService) GetVaccines(userID uint) ([]models.VaccinationRecord, error) {
	return s.repo.FindVaccinesByUserID(userID)
}
