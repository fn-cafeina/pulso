package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"gorm.io/gorm"
)

type ReminderService interface {
	BaseService[models.Reminder]
	GetPending(userID uint) ([]models.Reminder, error)
	GetAll(userID uint, page, perPage int) ([]models.Reminder, int64, error)
	Update(reminder *models.Reminder) (*models.Reminder, error)
	MarkAsRead(id, userID uint) error
	Delete(id, userID uint) error
}

type reminderService struct {
	baseSvc[models.Reminder]
	repo repository.ReminderRepository
}

func NewReminderService(repo repository.ReminderRepository) ReminderService {
	return &reminderService{baseSvc: newBaseSvc[models.Reminder](repo), repo: repo}
}

func (s *reminderService) GetPending(userID uint) ([]models.Reminder, error) {
	return s.repo.FindPendingByUserID(userID)
}

func (s *reminderService) GetAll(userID uint, page, perPage int) ([]models.Reminder, int64, error) {
	return s.repo.FindByUserID(userID, page, perPage)
}

func (s *reminderService) Update(reminder *models.Reminder) (*models.Reminder, error) {
	existing, err := s.repo.FindByID(reminder.ID)
	if err != nil {
		return nil, err
	}
	if existing.UserID != reminder.UserID {
		return nil, gorm.ErrRecordNotFound
	}
	existing.Titulo = reminder.Titulo
	existing.Descripcion = reminder.Descripcion
	existing.Fecha = reminder.Fecha
	existing.Tipo = reminder.Tipo
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *reminderService) MarkAsRead(id, userID uint) error {
	return s.repo.MarkAsRead(id, userID)
}

func (s *reminderService) Delete(id, userID uint) error {
	existing, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}
	if existing.UserID != userID {
		return gorm.ErrRecordNotFound
	}
	return s.repo.Delete(id)
}