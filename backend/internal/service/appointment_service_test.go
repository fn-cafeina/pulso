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

func TestAppointmentCreate_Success(t *testing.T) {
	svc := service.NewAppointmentService(&mockAppointmentRepo{})
	appt, err := svc.Create(1, "Control general", time.Date(2026, 6, 1, 10, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if appt.Descripcion != "Control general" {
		t.Fatalf("expected Control general, got %s", appt.Descripcion)
	}
	if appt.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestAppointmentCreate_RepoError(t *testing.T) {
	svc := service.NewAppointmentService(&mockAppointmentRepo{fail: true})
	_, err := svc.Create(1, "Control", time.Now())
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestAppointmentGetByUserID_Success(t *testing.T) {
	repo := &mockAppointmentRepo{}
	svc := service.NewAppointmentService(repo)
	_, _ = svc.Create(1, "Control", time.Now())
	_, _ = svc.Create(1, "Revisión", time.Now())
	_, _ = svc.Create(2, "Otra", time.Now())

	appts, err := svc.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(appts) != 2 {
		t.Fatalf("expected 2 appointments, got %d", len(appts))
	}
}
