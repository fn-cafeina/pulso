package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type SymptomRepository interface {
	Create(report *models.SymptomReport) error
	FindByID(id uint) (*models.SymptomReport, error)
	FindByUserID(userID uint) ([]models.SymptomReport, error)
	FindScoped(id, userID uint) (*models.SymptomReport, error)
	Update(report *models.SymptomReport) error
	Delete(id uint) error
	DeleteScoped(id, userID uint) error
}

type symptomRepository struct {
	baseRepo[models.SymptomReport]
}

func NewSymptomRepository(db *gorm.DB) SymptomRepository {
	return &symptomRepository{baseRepo: newBaseRepo[models.SymptomReport](db)}
}

func (r *symptomRepository) FindByUserID(userID uint) ([]models.SymptomReport, error) {
	var reports []models.SymptomReport
	err := r.db.Where("user_id = ?", userID).Find(&reports).Error
	return reports, err
}

func (r *symptomRepository) FindScoped(id, userID uint) (*models.SymptomReport, error) {
	var report models.SymptomReport
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&report).Error
	return &report, err
}

func (r *symptomRepository) DeleteScoped(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.SymptomReport{}).Error
}
