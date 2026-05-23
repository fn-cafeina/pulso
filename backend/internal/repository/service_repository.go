package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type ServiceRepository interface {
	Create(svc *models.HealthService) error
	FindByID(id uint) (*models.HealthService, error)
	FindAll() ([]models.HealthService, error)
	Update(svc *models.HealthService) error
	Delete(id uint) error
}

type serviceRepository struct {
	db *gorm.DB
}

func NewServiceRepository(db *gorm.DB) ServiceRepository {
	return &serviceRepository{db: db}
}

func (r *serviceRepository) Create(svc *models.HealthService) error {
	return r.db.Create(svc).Error
}

func (r *serviceRepository) FindByID(id uint) (*models.HealthService, error) {
	var svc models.HealthService
	err := r.db.First(&svc, id).Error
	return &svc, err
}

func (r *serviceRepository) FindAll() ([]models.HealthService, error) {
	var services []models.HealthService
	err := r.db.Find(&services).Error
	return services, err
}

func (r *serviceRepository) Update(svc *models.HealthService) error {
	return r.db.Save(svc).Error
}

func (r *serviceRepository) Delete(id uint) error {
	return r.db.Delete(&models.HealthService{}, id).Error
}
