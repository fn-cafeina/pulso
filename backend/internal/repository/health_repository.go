package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type HealthRepository interface {
	CreateSymptom(report *models.SymptomReport) error
	FindSymptomsByUserID(userID uint) ([]models.SymptomReport, error)
	CreateVaccine(record *models.VaccinationRecord) error
	FindVaccinesByUserID(userID uint) ([]models.VaccinationRecord, error)
}

type healthRepository struct {
	db *gorm.DB
}

func NewHealthRepository(db *gorm.DB) HealthRepository {
	return &healthRepository{db: db}
}

func (r *healthRepository) CreateSymptom(report *models.SymptomReport) error {
	return r.db.Create(report).Error
}

func (r *healthRepository) FindSymptomsByUserID(userID uint) ([]models.SymptomReport, error) {
	var reports []models.SymptomReport
	err := r.db.Where("user_id = ?", userID).Find(&reports).Error
	return reports, err
}

func (r *healthRepository) CreateVaccine(record *models.VaccinationRecord) error {
	return r.db.Create(record).Error
}

func (r *healthRepository) FindVaccinesByUserID(userID uint) ([]models.VaccinationRecord, error) {
	var records []models.VaccinationRecord
	err := r.db.Where("user_id = ?", userID).Find(&records).Error
	return records, err
}
