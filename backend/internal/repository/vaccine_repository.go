package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type VaccineRepository interface {
	Create(record *models.VaccinationRecord) error
	FindByID(id uint) (*models.VaccinationRecord, error)
	FindByUserID(userID uint) ([]models.VaccinationRecord, error)
	FindScoped(id, userID uint) (*models.VaccinationRecord, error)
	Update(record *models.VaccinationRecord) error
	Delete(id uint) error
	DeleteScoped(id, userID uint) error
}

type vaccineRepository struct {
	baseRepo[models.VaccinationRecord]
}

func NewVaccineRepository(db *gorm.DB) VaccineRepository {
	return &vaccineRepository{baseRepo: newBaseRepo[models.VaccinationRecord](db)}
}

func (r *vaccineRepository) FindByUserID(userID uint) ([]models.VaccinationRecord, error) {
	var records []models.VaccinationRecord
	err := r.db.Where("user_id = ?", userID).Find(&records).Error
	return records, err
}

func (r *vaccineRepository) FindScoped(id, userID uint) (*models.VaccinationRecord, error) {
	var record models.VaccinationRecord
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&record).Error
	return &record, err
}

func (r *vaccineRepository) DeleteScoped(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.VaccinationRecord{}).Error
}
