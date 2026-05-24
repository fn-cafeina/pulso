package service

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type AppointmentService interface {
	Create(userID uint, descripcion string, fecha time.Time) (*models.Appointment, error)
	GetByUserID(userID uint) ([]models.Appointment, error)
}

type appointmentService struct {
	repo repository.AppointmentRepository
}

func NewAppointmentService(repo repository.AppointmentRepository) AppointmentService {
	return &appointmentService{repo: repo}
}

func (s *appointmentService) Create(userID uint, descripcion string, fecha time.Time) (*models.Appointment, error) {
	appt := &models.Appointment{
		UserID:      userID,
		Descripcion: descripcion,
		Fecha:       fecha,
	}
	if err := s.repo.Create(appt); err != nil {
		return nil, err
	}
	return appt, nil
}

func (s *appointmentService) GetByUserID(userID uint) ([]models.Appointment, error) {
	return s.repo.FindByUserID(userID)
}
