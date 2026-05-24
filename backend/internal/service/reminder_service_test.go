package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
)

type mockReminderRepo struct {
	reminders []models.Reminder
	fail      bool
}

func (m *mockReminderRepo) Create(r *models.Reminder) error {
	if m.fail {
		return errors.New("mock error")
	}
	r.ID = uint(len(m.reminders) + 1)
	m.reminders = append(m.reminders, *r)
	return nil
}

func (m *mockReminderRepo) FindPendingByUserID(userID uint) ([]models.Reminder, error) {
	var result []models.Reminder
	now := time.Now()
	for _, r := range m.reminders {
		if r.UserID == userID && !r.Leido && !r.Fecha.After(now) {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReminderRepo) FindByUserID(userID uint) ([]models.Reminder, error) {
	var result []models.Reminder
	for _, r := range m.reminders {
		if r.UserID == userID {
			result = append(result, r)
		}
	}
	return result, nil
}

func (m *mockReminderRepo) MarkAsRead(id, userID uint) error {
	for i, r := range m.reminders {
		if r.ID == id && r.UserID == userID {
			m.reminders[i].Leido = true
			return nil
		}
	}
	if m.fail {
		return errors.New("not found")
	}
	return nil
}

func (m *mockReminderRepo) Delete(id uint) error {
	for i, r := range m.reminders {
		if r.ID == id {
			m.reminders = append(m.reminders[:i], m.reminders[i+1:]...)
			return nil
		}
	}
	return nil
}

func TestReminderCreate_Success(t *testing.T) {
	svc := service.NewReminderService(&mockReminderRepo{})
	r, err := svc.Create(1, "Cita médica", "Control general", "cita",
		time.Date(2026, 6, 1, 9, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if r.Titulo != "Cita médica" {
		t.Fatalf("expected Cita médica, got %s", r.Titulo)
	}
	if r.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestReminderCreate_RepoError(t *testing.T) {
	svc := service.NewReminderService(&mockReminderRepo{fail: true})
	_, err := svc.Create(1, "Cita", "Desc", "manual", time.Now())
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestReminderGetPending_FiltersByUser(t *testing.T) {
	repo := &mockReminderRepo{}
	svc := service.NewReminderService(repo)
	_, _ = svc.Create(1, "R1", "", "manual", time.Now().Add(-1*time.Hour))
	_, _ = svc.Create(1, "R2", "", "manual", time.Now().Add(24*time.Hour))
	_, _ = svc.Create(2, "R3", "", "manual", time.Now().Add(-1*time.Hour))

	pending, err := svc.GetPending(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(pending) != 1 {
		t.Fatalf("expected 1 pending reminder, got %d", len(pending))
	}
	if pending[0].Titulo != "R1" {
		t.Fatalf("expected R1, got %s", pending[0].Titulo)
	}
}

func TestReminderGetPending_Empty(t *testing.T) {
	svc := service.NewReminderService(&mockReminderRepo{})
	pending, err := svc.GetPending(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(pending) != 0 {
		t.Fatalf("expected 0 pending reminders, got %d", len(pending))
	}
}

func TestReminderGetAll_ByUser(t *testing.T) {
	repo := &mockReminderRepo{}
	svc := service.NewReminderService(repo)
	_, _ = svc.Create(1, "A", "", "manual", time.Now())
	_, _ = svc.Create(1, "B", "", "manual", time.Now())
	_, _ = svc.Create(2, "C", "", "manual", time.Now())

	all, err := svc.GetAll(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(all) != 2 {
		t.Fatalf("expected 2 reminders, got %d", len(all))
	}
}

func TestReminderMarkAsRead_Success(t *testing.T) {
	repo := &mockReminderRepo{}
	svc := service.NewReminderService(repo)
	r, _ := svc.Create(1, "Test", "", "manual", time.Now())

	if r.Leido {
		t.Fatal("expected reminder to be unread initially")
	}

	if err := svc.MarkAsRead(r.ID, 1); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}
