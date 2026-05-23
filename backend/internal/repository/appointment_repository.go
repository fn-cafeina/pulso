package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type AppointmentRepository interface {
	Create(appt *models.Appointment) error
	FindByUserID(userID uint) ([]models.Appointment, error)
}

type appointmentRepository struct {
	db *gorm.DB
}

func NewAppointmentRepository(db *gorm.DB) AppointmentRepository {
	return &appointmentRepository{db: db}
}

func (r *appointmentRepository) Create(appt *models.Appointment) error {
	return r.db.Create(appt).Error
}

func (r *appointmentRepository) FindByUserID(userID uint) ([]models.Appointment, error) {
	var appts []models.Appointment
	err := r.db.Where("user_id = ?", userID).Find(&appts).Error
	return appts, err
}
