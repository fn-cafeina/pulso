package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"gorm.io/gorm"
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

func (m *mockReminderRepo) FindByID(id uint) (*models.Reminder, error) {
	for i, r := range m.reminders {
		if r.ID == id {
			return &m.reminders[i], nil
		}
	}
	return nil, gorm.ErrRecordNotFound
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

func (m *mockReminderRepo) FindHistoryByUserID(userID uint, page, perPage int) ([]models.Reminder, int64, error) {
	var result []models.Reminder
	for _, r := range m.reminders {
		if r.UserID == userID {
			result = append(result, r)
		}
	}
	total := int64(len(result))
	if page > 0 {
		offset := (page - 1) * perPage
		if offset >= len(result) {
			return nil, total, nil
		}
		end := offset + perPage
		if end > len(result) {
			end = len(result)
		}
		result = result[offset:end]
	}
	return result, total, nil
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

func (m *mockReminderRepo) Update(r *models.Reminder) error {
	for i, rem := range m.reminders {
		if rem.ID == r.ID {
			m.reminders[i].Titulo = r.Titulo
			m.reminders[i].Descripcion = r.Descripcion
			m.reminders[i].Fecha = r.Fecha
			m.reminders[i].Tipo = r.Tipo
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
	err := svc.Create(&models.Reminder{
		UserID:      1,
		Titulo:      "Cita médica",
		Descripcion: "Control general",
		Tipo:        "cita",
		Fecha:       time.Date(2026, 6, 1, 9, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestReminderCreate_RepoError(t *testing.T) {
	svc := service.NewReminderService(&mockReminderRepo{fail: true})
	err := svc.Create(&models.Reminder{
		UserID:      1,
		Titulo:      "Cita",
		Descripcion: "Desc",
		Tipo:        "manual",
		Fecha:       time.Now(),
	})
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestReminderGetPending_FiltersByUser(t *testing.T) {
	repo := &mockReminderRepo{}
	svc := service.NewReminderService(repo)
	_ = svc.Create(&models.Reminder{UserID: 1, Titulo: "R1", Tipo: "manual", Fecha: time.Now().Add(-1 * time.Hour)})
	_ = svc.Create(&models.Reminder{UserID: 1, Titulo: "R2", Tipo: "manual", Fecha: time.Now().Add(24 * time.Hour)})
	_ = svc.Create(&models.Reminder{UserID: 2, Titulo: "R3", Tipo: "manual", Fecha: time.Now().Add(-1 * time.Hour)})

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
	_ = svc.Create(&models.Reminder{UserID: 1, Titulo: "A", Tipo: "manual", Fecha: time.Now()})
	_ = svc.Create(&models.Reminder{UserID: 1, Titulo: "B", Tipo: "manual", Fecha: time.Now()})
	_ = svc.Create(&models.Reminder{UserID: 2, Titulo: "C", Tipo: "manual", Fecha: time.Now()})

	all, total, err := svc.GetAll(1, 0, 20)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if total != 2 {
		t.Fatalf("expected total 2, got %d", total)
	}
	if len(all) != 2 {
		t.Fatalf("expected 2 reminders, got %d", len(all))
	}
}

func TestReminderMarkAsRead_Success(t *testing.T) {
	repo := &mockReminderRepo{}
	svc := service.NewReminderService(repo)
	_ = svc.Create(&models.Reminder{UserID: 1, Titulo: "Test", Tipo: "manual", Fecha: time.Now()})

	r, _ := svc.GetPending(1)
	if len(r) == 0 {
		t.Fatal("expected at least one reminder")
	}
	if r[0].Leido {
		t.Fatal("expected reminder to be unread initially")
	}

	if err := svc.MarkAsRead(r[0].ID, 1); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}
