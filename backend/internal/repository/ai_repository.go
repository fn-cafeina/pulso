package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type AIRepository interface {
	Create(consult *models.AIConsultation) error
	FindByUserID(userID uint) ([]models.AIConsultation, error)
}

type aiRepository struct {
	db *gorm.DB
}

func NewAIRepository(db *gorm.DB) AIRepository {
	return &aiRepository{db: db}
}

func (r *aiRepository) Create(consult *models.AIConsultation) error {
	return r.db.Create(consult).Error
}

func (r *aiRepository) FindByUserID(userID uint) ([]models.AIConsultation, error) {
	var consults []models.AIConsultation
	err := r.db.Where("user_id = ?", userID).
		Order("created_at ASC").
		Find(&consults).Error
	return consults, err
}
