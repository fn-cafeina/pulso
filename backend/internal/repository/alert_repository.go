package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type AlertRepository interface {
	Create(alert *models.EpiAlert) error
	FindByID(id uint) (*models.EpiAlert, error)
	FindAll(nivel, departamento string, soloActivas bool) ([]models.EpiAlert, error)
	Update(alert *models.EpiAlert) error
	Delete(id uint) error
	Deactivate(id uint) error
}

type alertRepository struct {
	db *gorm.DB
}

func NewAlertRepository(db *gorm.DB) AlertRepository {
	return &alertRepository{db: db}
}

func (r *alertRepository) Create(alert *models.EpiAlert) error {
	return r.db.Create(alert).Error
}

func (r *alertRepository) FindByID(id uint) (*models.EpiAlert, error) {
	var alert models.EpiAlert
	err := r.db.First(&alert, id).Error
	return &alert, err
}

func (r *alertRepository) FindAll(nivel, departamento string, soloActivas bool) ([]models.EpiAlert, error) {
	var alerts []models.EpiAlert
	q := r.db.Order("created_at DESC")

	if soloActivas {
		q = q.Where("activa = ?", true)
	}
	if nivel != "" {
		q = q.Where("nivel = ?", nivel)
	}
	if departamento != "" {
		q = q.Where("departamento = ?", departamento)
	}

	err := q.Find(&alerts).Error
	return alerts, err
}

func (r *alertRepository) Update(alert *models.EpiAlert) error {
	return r.db.Save(alert).Error
}

func (r *alertRepository) Delete(id uint) error {
	return r.db.Delete(&models.EpiAlert{}, id).Error
}

func (r *alertRepository) Deactivate(id uint) error {
	return r.db.Model(&models.EpiAlert{}).Where("id = ?", id).Update("activa", false).Error
}
