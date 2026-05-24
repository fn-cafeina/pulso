package service

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type ReminderService interface {
	Create(userID uint, titulo, descripcion, tipo string, fecha time.Time) (*models.Reminder, error)
	GetPending(userID uint) ([]models.Reminder, error)
	GetAll(userID uint) ([]models.Reminder, error)
	MarkAsRead(id, userID uint) error
}

type reminderService struct {
	repo repository.ReminderRepository
}

func NewReminderService(repo repository.ReminderRepository) ReminderService {
	return &reminderService{repo: repo}
}

func (s *reminderService) Create(userID uint, titulo, descripcion, tipo string, fecha time.Time) (*models.Reminder, error) {
	r := &models.Reminder{
		UserID:      userID,
		Titulo:      titulo,
		Descripcion: descripcion,
		Fecha:       fecha,
		Tipo:        tipo,
	}
	if err := s.repo.Create(r); err != nil {
		return nil, err
	}
	return r, nil
}

func (s *reminderService) GetPending(userID uint) ([]models.Reminder, error) {
	return s.repo.FindPendingByUserID(userID)
}

func (s *reminderService) GetAll(userID uint) ([]models.Reminder, error) {
	return s.repo.FindByUserID(userID)
}

func (s *reminderService) MarkAsRead(id, userID uint) error {
	return s.repo.MarkAsRead(id, userID)
}
