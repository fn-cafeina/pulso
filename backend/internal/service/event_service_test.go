package service_test

import (
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"gorm.io/gorm"
)

type mockEventRepo struct {
	events []models.HealthEvent
}

func (m *mockEventRepo) Create(event *models.HealthEvent) error {
	event.ID = uint(len(m.events) + 1)
	m.events = append(m.events, *event)
	return nil
}

func (m *mockEventRepo) FindByID(id uint) (*models.HealthEvent, error) {
	for _, e := range m.events {
		if e.ID == id {
			return &e, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockEventRepo) FindAll(upcoming bool) ([]models.HealthEvent, error) {
	if !upcoming {
		return m.events, nil
	}
	var result []models.HealthEvent
	now := time.Now()
	for _, e := range m.events {
		if e.FechaFin.After(now) || e.FechaInicio.After(now) {
			result = append(result, e)
		}
	}
	return result, nil
}

func (m *mockEventRepo) Update(event *models.HealthEvent) error {
	for i, e := range m.events {
		if e.ID == event.ID {
			m.events[i] = *event
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockEventRepo) Delete(id uint) error {
	for i, e := range m.events {
		if e.ID == id {
			m.events = append(m.events[:i], m.events[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func TestEventCreate_Success(t *testing.T) {
	svc := service.NewEventService(&mockEventRepo{})
	event := &models.HealthEvent{
		Titulo:      "Jornada de Vacunación",
		Tipo:        "jornada",
		FechaInicio: time.Date(2026, 6, 1, 8, 0, 0, 0, time.UTC),
	}
	err := svc.Create(event)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if event.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestEventGetByID_Success(t *testing.T) {
	repo := &mockEventRepo{}
	svc := service.NewEventService(repo)
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Evento 1", Tipo: "feria",
		FechaInicio: time.Now(),
	})

	got, err := svc.GetByID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got.Titulo != "Evento 1" {
		t.Fatalf("expected Evento 1, got %s", got.Titulo)
	}
}

func TestEventGetByID_NotFound(t *testing.T) {
	svc := service.NewEventService(&mockEventRepo{})
	_, err := svc.GetByID(999)
	if err == nil {
		t.Fatal("expected error for nonexistent event")
	}
}

func TestEventGetAll_ReturnsAll(t *testing.T) {
	repo := &mockEventRepo{}
	svc := service.NewEventService(repo)
	_ = svc.Create(&models.HealthEvent{
		Titulo: "E1", Tipo: "jornada",
		FechaInicio: time.Now().Add(-24 * time.Hour),
		FechaFin:    time.Now().Add(-1 * time.Hour),
	})
	_ = svc.Create(&models.HealthEvent{
		Titulo: "E2", Tipo: "campana",
		FechaInicio: time.Now().Add(24 * time.Hour),
		FechaFin:    time.Now().Add(48 * time.Hour),
	})

	all, err := svc.GetAll(false)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(all) != 2 {
		t.Fatalf("expected 2 events, got %d", len(all))
	}
}

func TestEventGetAll_Upcoming(t *testing.T) {
	repo := &mockEventRepo{}
	svc := service.NewEventService(repo)
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Pasado", Tipo: "jornada",
		FechaInicio: time.Now().Add(-48 * time.Hour),
		FechaFin:    time.Now().Add(-24 * time.Hour),
	})
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Futuro", Tipo: "campana",
		FechaInicio: time.Now().Add(24 * time.Hour),
		FechaFin:    time.Now().Add(48 * time.Hour),
	})

	upcoming, err := svc.GetAll(true)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(upcoming) != 1 {
		t.Fatalf("expected 1 upcoming event, got %d", len(upcoming))
	}
	if upcoming[0].Titulo != "Futuro" {
		t.Fatalf("expected Futuro, got %s", upcoming[0].Titulo)
	}
}

func TestEventGetNearby_FiltersByDistance(t *testing.T) {
	repo := &mockEventRepo{}
	svc := service.NewEventService(repo)
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Cerca", Tipo: "jornada",
		Latitud: 12.115, Longitud: -86.236,
		FechaInicio: time.Now().Add(24 * time.Hour),
		FechaFin:    time.Now().Add(48 * time.Hour),
	})
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Lejos", Tipo: "feria",
		Latitud: 12.434, Longitud: -86.878,
		FechaInicio: time.Now().Add(24 * time.Hour),
		FechaFin:    time.Now().Add(48 * time.Hour),
	})

	nearby, err := svc.GetNearby(12.11499, -86.23617, 50)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(nearby) != 1 {
		t.Fatalf("expected 1 nearby event within 50km, got %d", len(nearby))
	}
	if nearby[0].Titulo != "Cerca" {
		t.Fatalf("expected Cerca, got %s", nearby[0].Titulo)
	}
}

func TestEventUpdate_MergesFields(t *testing.T) {
	repo := &mockEventRepo{}
	svc := service.NewEventService(repo)
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Original", Tipo: "jornada",
		FechaInicio: time.Now(),
	})

	updated, err := svc.Update(&models.HealthEvent{
		BaseModel:   models.BaseModel{ID: 1},
		Titulo:      "Actualizado",
		Tipo:        "campana",
		FechaInicio: time.Now(),
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Titulo != "Actualizado" {
		t.Fatalf("expected Actualizado, got %s", updated.Titulo)
	}
}

func TestEventUpdate_NotFound(t *testing.T) {
	svc := service.NewEventService(&mockEventRepo{})
	_, err := svc.Update(&models.HealthEvent{
		BaseModel: models.BaseModel{ID: 999},
		Titulo:    "Nope",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent event")
	}
}

func TestEventDelete_Success(t *testing.T) {
	repo := &mockEventRepo{}
	svc := service.NewEventService(repo)
	_ = svc.Create(&models.HealthEvent{
		Titulo: "Test", Tipo: "jornada",
		FechaInicio: time.Now(),
	})
	if err := svc.Delete(1); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	_, err := svc.GetByID(1)
	if err == nil {
		t.Fatal("expected event to be deleted")
	}
}

func TestEventDelete_NotFound(t *testing.T) {
	svc := service.NewEventService(&mockEventRepo{})
	err := svc.Delete(999)
	if err == nil {
		t.Fatal("expected error for nonexistent event")
	}
}
