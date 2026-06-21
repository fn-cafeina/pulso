package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type HealthRepository interface {
	CreateSymptom(report *models.SymptomReport) error
	FindSymptomsByUserID(userID uint) ([]models.SymptomReport, error)
	FindSymptomByID(id, userID uint) (*models.SymptomReport, error)
	UpdateSymptom(report *models.SymptomReport) error
	DeleteSymptom(id, userID uint) error
	CreateVaccine(record *models.VaccinationRecord) error
	FindVaccinesByUserID(userID uint) ([]models.VaccinationRecord, error)
	FindVaccineByID(id, userID uint) (*models.VaccinationRecord, error)
	UpdateVaccine(record *models.VaccinationRecord) error
	DeleteVaccine(id, userID uint) error
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

func (r *healthRepository) FindSymptomByID(id, userID uint) (*models.SymptomReport, error) {
	var report models.SymptomReport
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&report).Error
	return &report, err
}

func (r *healthRepository) UpdateSymptom(report *models.SymptomReport) error {
	return r.db.Save(report).Error
}

func (r *healthRepository) DeleteSymptom(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.SymptomReport{}).Error
}

func (r *healthRepository) FindVaccineByID(id, userID uint) (*models.VaccinationRecord, error) {
	var record models.VaccinationRecord
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&record).Error
	return &record, err
}

func (r *healthRepository) UpdateVaccine(record *models.VaccinationRecord) error {
	return r.db.Save(record).Error
}

func (r *healthRepository) DeleteVaccine(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.VaccinationRecord{}).Error
}
