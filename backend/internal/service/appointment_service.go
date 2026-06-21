package service

import (
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type AppointmentService interface {
	Create(userID uint, descripcion string, fecha time.Time) (*models.Appointment, error)
	GetByUserID(userID uint) ([]models.Appointment, error)
	Update(id, userID uint, descripcion string, fecha time.Time) (*models.Appointment, error)
	Delete(id, userID uint) error
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

func (s *appointmentService) Update(id, userID uint, descripcion string, fecha time.Time) (*models.Appointment, error) {
	appt, err := s.repo.FindByID(id, userID)
	if err != nil {
		return nil, err
	}
	appt.Descripcion = descripcion
	appt.Fecha = fecha
	if err := s.repo.Update(appt); err != nil {
		return nil, err
	}
	return appt, nil
}

func (s *appointmentService) Delete(id, userID uint) error {
	_, err := s.repo.FindByID(id, userID)
	if err != nil {
		return err
	}
	return s.repo.Delete(id, userID)
}
