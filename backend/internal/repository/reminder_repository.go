package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type ReminderRepository interface {
	BaseRepository[models.Reminder]
	FindPendingByUserID(userID uint) ([]models.Reminder, error)
	FindHistoryByUserID(userID uint, page, perPage int) ([]models.Reminder, int64, error)
	MarkAsRead(id, userID uint) error
}

type reminderRepository struct {
	baseRepo[models.Reminder]
}

func NewReminderRepository(db *gorm.DB) ReminderRepository {
	return &reminderRepository{baseRepo: newBaseRepo[models.Reminder](db)}
}

func (r *reminderRepository) FindPendingByUserID(userID uint) ([]models.Reminder, error) {
	var reminders []models.Reminder
	err := r.db.Where("user_id = ? AND leido = false", userID).
		Order("fecha asc").
		Find(&reminders).Error
	return reminders, err
}

func (r *reminderRepository) FindHistoryByUserID(userID uint, page, perPage int) ([]models.Reminder, int64, error) {
	var reminders []models.Reminder
	var total int64

	q := r.db.Model(&models.Reminder{}).Where("user_id = ? AND leido = true", userID)

	if err := q.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	q = q.Order("created_at desc")
	if page > 0 {
		offset := (page - 1) * perPage
		q = q.Offset(offset).Limit(perPage)
	}

	if err := q.Find(&reminders).Error; err != nil {
		return nil, 0, err
	}

	return reminders, total, nil
}

func (r *reminderRepository) MarkAsRead(id, userID uint) error {
	return r.db.Model(&models.Reminder{}).Where("id = ? AND user_id = ?", id, userID).Update("leido", true).Error
}
