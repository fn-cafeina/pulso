package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
)

type mockAppointmentRepo struct {
	appts []models.Appointment
	fail  bool
}

func (m *mockAppointmentRepo) Create(appt *models.Appointment) error {
	if m.fail {
		return errors.New("mock error")
	}
	appt.ID = uint(len(m.appts) + 1)
	m.appts = append(m.appts, *appt)
	return nil
}

func (m *mockAppointmentRepo) FindByUserID(userID uint) ([]models.Appointment, error) {
	var result []models.Appointment
	for _, a := range m.appts {
		if a.UserID == userID {
			result = append(result, a)
		}
	}
	return result, nil
}

func (m *mockAppointmentRepo) FindByID(id, userID uint) (*models.Appointment, error) {
	for _, a := range m.appts {
		if a.ID == id && a.UserID == userID {
			return &a, nil
		}
	}
	return nil, errors.New("not found")
}

func (m *mockAppointmentRepo) Update(appt *models.Appointment) error {
	for i, a := range m.appts {
		if a.ID == appt.ID {
			m.appts[i] = *appt
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockAppointmentRepo) Delete(id, userID uint) error {
	for i, a := range m.appts {
		if a.ID == id && a.UserID == userID {
			m.appts = append(m.appts[:i], m.appts[i+1:]...)
			return nil
		}
	}
	return errors.New("not found")
}

func TestAppointmentCreate_Success(t *testing.T) {
	svc := service.NewAppointmentService(&mockAppointmentRepo{})
	err := svc.Create(&models.Appointment{
		UserID:      1,
		Descripcion: "Control general",
		Fecha:       time.Date(2026, 6, 1, 10, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestAppointmentCreate_RepoError(t *testing.T) {
	svc := service.NewAppointmentService(&mockAppointmentRepo{fail: true})
	err := svc.Create(&models.Appointment{
		UserID:      1,
		Descripcion: "Control",
		Fecha:       time.Now(),
	})
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestAppointmentGetByUserID_Success(t *testing.T) {
	repo := &mockAppointmentRepo{}
	svc := service.NewAppointmentService(repo)
	_ = svc.Create(&models.Appointment{UserID: 1, Descripcion: "Control", Fecha: time.Now()})
	_ = svc.Create(&models.Appointment{UserID: 1, Descripcion: "Revisión", Fecha: time.Now()})
	_ = svc.Create(&models.Appointment{UserID: 2, Descripcion: "Otra", Fecha: time.Now()})

	appts, err := svc.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(appts) != 2 {
		t.Fatalf("expected 2 appointments, got %d", len(appts))
	}
}