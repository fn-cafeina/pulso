package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type ServiceRepository interface {
	BaseRepository[models.HealthService]
	FindAll(page, perPage int) ([]models.HealthService, int64, error)
}

type serviceRepository struct {
	baseRepo[models.HealthService]
}

func NewServiceRepository(db *gorm.DB) ServiceRepository {
	return &serviceRepository{baseRepo: newBaseRepo[models.HealthService](db)}
}

func (r *serviceRepository) FindAll(page, perPage int) ([]models.HealthService, int64, error) {
	var services []models.HealthService
	var total int64

	if err := r.db.Model(&models.HealthService{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	q := r.db
	if page > 0 {
		offset := (page - 1) * perPage
		q = q.Offset(offset).Limit(perPage)
	}

	if err := q.Find(&services).Error; err != nil {
		return nil, 0, err
	}

	return services, total, nil
}
