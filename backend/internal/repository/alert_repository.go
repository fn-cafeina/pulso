package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type AlertRepository interface {
	BaseRepository[models.EpiAlert]
	FindAll(nivel, departamento string, soloActivas bool, page, perPage int) ([]models.EpiAlert, int64, error)
	Deactivate(id uint) error
}

type alertRepository struct {
	baseRepo[models.EpiAlert]
}

func NewAlertRepository(db *gorm.DB) AlertRepository {
	return &alertRepository{baseRepo: newBaseRepo[models.EpiAlert](db)}
}

func (r *alertRepository) FindAll(nivel, departamento string, soloActivas bool, page, perPage int) ([]models.EpiAlert, int64, error) {
	var alerts []models.EpiAlert
	var total int64

	q := r.db.Model(&models.EpiAlert{}).Order("created_at DESC")

	if soloActivas {
		q = q.Where("activa = ?", true)
	}
	if nivel != "" {
		q = q.Where("nivel = ?", nivel)
	}
	if departamento != "" {
		q = q.Where("departamento LIKE ?", "%"+departamento+"%")
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page > 0 {
		offset := (page - 1) * perPage
		q = q.Offset(offset).Limit(perPage)
	}

	if err := q.Find(&alerts).Error; err != nil {
		return nil, 0, err
	}

	return alerts, total, nil
}

func (r *alertRepository) Deactivate(id uint) error {
	return r.db.Model(&models.EpiAlert{}).Where("id = ?", id).Update("activa", false).Error
}
