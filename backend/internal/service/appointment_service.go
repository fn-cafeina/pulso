package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type AppointmentService interface {
	Create(appt *models.Appointment) error
	GetByUserID(userID uint) ([]models.Appointment, error)
}

type appointmentService struct {
	repo repository.AppointmentRepository
}

func NewAppointmentService(repo repository.AppointmentRepository) AppointmentService {
	return &appointmentService{repo: repo}
}

func (s *appointmentService) Create(appt *models.Appointment) error {
	return s.repo.Create(appt)
}

func (s *appointmentService) GetByUserID(userID uint) ([]models.Appointment, error) {
	return s.repo.FindByUserID(userID)
}
