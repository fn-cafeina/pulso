package service

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type AppointmentService interface {
	BaseService[models.Appointment]
	GetByUserID(userID uint) ([]models.Appointment, error)
	Update(appt *models.Appointment) (*models.Appointment, error)
	Delete(id, userID uint) error
}

type appointmentService struct {
	baseSvc[models.Appointment]
	repo repository.AppointmentRepository
}

func NewAppointmentService(repo repository.AppointmentRepository) AppointmentService {
	return &appointmentService{baseSvc: newBaseSvc[models.Appointment](repo), repo: repo}
}

func (s *appointmentService) GetByUserID(userID uint) ([]models.Appointment, error) {
	return s.repo.FindByUserID(userID)
}

func (s *appointmentService) Update(appt *models.Appointment) (*models.Appointment, error) {
	existing, err := s.repo.FindByID(appt.ID, appt.UserID)
	if err != nil {
		return nil, err
	}
	existing.Descripcion = appt.Descripcion
	existing.Fecha = appt.Fecha
	if err := s.repo.Update(existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *appointmentService) Delete(id, userID uint) error {
	_, err := s.repo.FindByID(id, userID)
	if err != nil {
		return err
	}
	return s.repo.Delete(id, userID)
}