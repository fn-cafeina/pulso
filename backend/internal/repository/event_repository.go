package repository

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type EventRepository interface {
	Create(event *models.HealthEvent) error
	FindByID(id uint) (*models.HealthEvent, error)
	FindAll(upcoming bool, page, perPage int) ([]models.HealthEvent, int64, error)
	Update(event *models.HealthEvent) error
	Delete(id uint) error
}

type eventRepository struct {
	db *gorm.DB
}

func NewEventRepository(db *gorm.DB) EventRepository {
	return &eventRepository{db: db}
}

func (r *eventRepository) Create(event *models.HealthEvent) error {
	return r.db.Create(event).Error
}

func (r *eventRepository) FindByID(id uint) (*models.HealthEvent, error) {
	var event models.HealthEvent
	err := r.db.First(&event, id).Error
	return &event, err
}

func (r *eventRepository) FindAll(upcoming bool, page, perPage int) ([]models.HealthEvent, int64, error) {
	var events []models.HealthEvent
	var total int64

	q := r.db.Model(&models.HealthEvent{}).Order("fecha_inicio ASC")
	if upcoming {
		now := time.Now()
		q = q.Where("fecha_fin >= ? OR fecha_inicio >= ?", now, now)
	}

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if page > 0 {
		offset := (page - 1) * perPage
		q = q.Offset(offset).Limit(perPage)
	}

	if err := q.Find(&events).Error; err != nil {
		return nil, 0, err
	}

	return events, total, nil
}

func (r *eventRepository) Update(event *models.HealthEvent) error {
	return r.db.Save(event).Error
}

func (r *eventRepository) Delete(id uint) error {
	return r.db.Delete(&models.HealthEvent{}, id).Error
}
