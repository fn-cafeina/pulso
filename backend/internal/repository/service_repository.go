package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type ServiceRepository interface {
	FindAll() ([]models.HealthService, error)
}

type serviceRepository struct {
	db *gorm.DB
}

func NewServiceRepository(db *gorm.DB) ServiceRepository {
	return &serviceRepository{db: db}
}

func (r *serviceRepository) FindAll() ([]models.HealthService, error) {
	var services []models.HealthService
	err := r.db.Find(&services).Error
	return services, err
}
