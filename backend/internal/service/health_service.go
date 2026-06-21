package service

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type HealthService interface {
	CreateSymptom(userID uint, descripcion string, fecha time.Time) (*models.SymptomReport, error)
	GetSymptoms(userID uint) ([]models.SymptomReport, error)
	UpdateSymptom(id, userID uint, descripcion string, fecha time.Time) (*models.SymptomReport, error)
	DeleteSymptom(id, userID uint) error
	CreateVaccine(userID uint, nombre string, fecha time.Time) (*models.VaccinationRecord, error)
	GetVaccines(userID uint) ([]models.VaccinationRecord, error)
	UpdateVaccine(id, userID uint, nombre string, fecha time.Time) (*models.VaccinationRecord, error)
	DeleteVaccine(id, userID uint) error
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

func (s *healthService) UpdateSymptom(id, userID uint, descripcion string, fecha time.Time) (*models.SymptomReport, error) {
	report, err := s.repo.FindSymptomByID(id, userID)
	if err != nil {
		return nil, err
	}
	report.Descripcion = descripcion
	report.Fecha = fecha
	if err := s.repo.UpdateSymptom(report); err != nil {
		return nil, err
	}
	return report, nil
}

func (s *healthService) DeleteSymptom(id, userID uint) error {
	_, err := s.repo.FindSymptomByID(id, userID)
	if err != nil {
		return err
	}
	return s.repo.DeleteSymptom(id, userID)
}

func (s *healthService) UpdateVaccine(id, userID uint, nombre string, fecha time.Time) (*models.VaccinationRecord, error) {
	record, err := s.repo.FindVaccineByID(id, userID)
	if err != nil {
		return nil, err
	}
	record.NombreVacuna = nombre
	record.FechaAplicacion = fecha
	if err := s.repo.UpdateVaccine(record); err != nil {
		return nil, err
	}
	return record, nil
}

func (s *healthService) DeleteVaccine(id, userID uint) error {
	_, err := s.repo.FindVaccineByID(id, userID)
	if err != nil {
		return err
	}
	return s.repo.DeleteVaccine(id, userID)
}
