package repository

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type EventRepository interface {
	BaseRepository[models.HealthEvent]
	FindAll(upcoming bool, page, perPage int) ([]models.HealthEvent, int64, error)
}

type eventRepository struct {
	baseRepo[models.HealthEvent]
}

func NewEventRepository(db *gorm.DB) EventRepository {
	return &eventRepository{baseRepo: newBaseRepo[models.HealthEvent](db)}
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
