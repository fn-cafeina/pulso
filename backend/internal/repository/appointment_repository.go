package repository

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/gorm"
)

type AppointmentRepository interface {
	Create(appt *models.Appointment) error
	FindByUserID(userID uint) ([]models.Appointment, error)
	FindByID(id, userID uint) (*models.Appointment, error)
	Update(appt *models.Appointment) error
	Delete(id, userID uint) error
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

func (r *appointmentRepository) FindByID(id, userID uint) (*models.Appointment, error) {
	var appt models.Appointment
	err := r.db.Where("id = ? AND user_id = ?", id, userID).First(&appt).Error
	return &appt, err
}

func (r *appointmentRepository) Update(appt *models.Appointment) error {
	return r.db.Save(appt).Error
}

func (r *appointmentRepository) Delete(id, userID uint) error {
	return r.db.Where("id = ? AND user_id = ?", id, userID).Delete(&models.Appointment{}).Error
}
