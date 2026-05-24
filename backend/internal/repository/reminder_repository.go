package repository

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type ReminderRepository interface {
	Create(reminder *models.Reminder) error
	FindPendingByUserID(userID uint) ([]models.Reminder, error)
	FindByUserID(userID uint) ([]models.Reminder, error)
	MarkAsRead(id, userID uint) error
	Delete(id uint) error
}

type reminderRepository struct {
	db *gorm.DB
}

func NewReminderRepository(db *gorm.DB) ReminderRepository {
	return &reminderRepository{db: db}
}

func (r *reminderRepository) Create(reminder *models.Reminder) error {
	return r.db.Create(reminder).Error
}

func (r *reminderRepository) FindPendingByUserID(userID uint) ([]models.Reminder, error) {
	var reminders []models.Reminder
	err := r.db.Where("user_id = ? AND leido = false AND fecha <= ?", userID, time.Now()).
		Order("fecha asc").
		Find(&reminders).Error
	return reminders, err
}

func (r *reminderRepository) FindByUserID(userID uint) ([]models.Reminder, error) {
	var reminders []models.Reminder
	err := r.db.Where("user_id = ?", userID).
		Order("created_at desc").
		Find(&reminders).Error
	return reminders, err
}

func (r *reminderRepository) MarkAsRead(id, userID uint) error {
	return r.db.Model(&models.Reminder{}).Where("id = ? AND user_id = ?", id, userID).Update("leido", true).Error
}

func (r *reminderRepository) Delete(id uint) error {
	return r.db.Delete(&models.Reminder{}, id).Error
}
