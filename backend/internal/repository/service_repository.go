package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type ServiceRepository interface {
	Create(svc *models.HealthService) error
	FindByID(id uint) (*models.HealthService, error)
	FindAll(page, perPage int) ([]models.HealthService, int64, error)
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

func (r *serviceRepository) Update(svc *models.HealthService) error {
	return r.db.Save(svc).Error
}

func (r *serviceRepository) Delete(id uint) error {
	return r.db.Delete(&models.HealthService{}, id).Error
}
