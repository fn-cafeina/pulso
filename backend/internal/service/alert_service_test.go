package service_test

import (
	"testing"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"gorm.io/gorm"
)

type mockAlertRepo struct {
	alerts []models.EpiAlert
}

func (m *mockAlertRepo) Create(alert *models.EpiAlert) error {
	alert.ID = uint(len(m.alerts) + 1)
	m.alerts = append(m.alerts, *alert)
	return nil
}

func (m *mockAlertRepo) FindByID(id uint) (*models.EpiAlert, error) {
	for _, a := range m.alerts {
		if a.ID == id {
			return &a, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockAlertRepo) FindAll(nivel, departamento string, soloActivas bool, page, perPage int) ([]models.EpiAlert, int64, error) {
	var base []models.EpiAlert
	for _, a := range m.alerts {
		if soloActivas && !a.Activa {
			continue
		}
		if nivel != "" && a.Nivel != nivel {
			continue
		}
		if departamento != "" && a.Departamento != departamento {
			continue
		}
		base = append(base, a)
	}
	total := int64(len(base))
	if page <= 0 {
		return base, total, nil
	}
	offset := (page - 1) * perPage
	if offset >= len(base) {
		return nil, total, nil
	}
	end := offset + perPage
	if end > len(base) {
		end = len(base)
	}
	return base[offset:end], total, nil
}

func (m *mockAlertRepo) Update(alert *models.EpiAlert) error {
	for i, a := range m.alerts {
		if a.ID == alert.ID {
			m.alerts[i] = *alert
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockAlertRepo) Delete(id uint) error {
	for i, a := range m.alerts {
		if a.ID == id {
			m.alerts = append(m.alerts[:i], m.alerts[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockAlertRepo) Deactivate(id uint) error {
	for i, a := range m.alerts {
		if a.ID == id {
			m.alerts[i].Activa = false
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func TestAlertCreate_Success(t *testing.T) {
	svc := service.NewAlertService(&mockAlertRepo{})
	alert := &models.EpiAlert{
		Titulo: "Alerta de Dengue",
		Nivel:  "alto",
	}
	err := svc.Create(alert)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if alert.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestAlertGetByID_Success(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "Alerta 1", Nivel: "bajo"})

	got, err := svc.GetByID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got.Titulo != "Alerta 1" {
		t.Fatalf("expected Alerta 1, got %s", got.Titulo)
	}
}

func TestAlertGetByID_NotFound(t *testing.T) {
	svc := service.NewAlertService(&mockAlertRepo{})
	_, err := svc.GetByID(999)
	if err == nil {
		t.Fatal("expected error for nonexistent alert")
	}
}

func TestAlertGetAll_NoFilters(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "A1", Nivel: "bajo"})
	_ = svc.Create(&models.EpiAlert{Titulo: "A2", Nivel: "alto"})

	all, _, err := svc.GetAll("", "", false, 0, 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(all) != 2 {
		t.Fatalf("expected 2 alerts, got %d", len(all))
	}
}

func TestAlertGetAll_Pagination(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	for i := 0; i < 5; i++ {
		_ = svc.Create(&models.EpiAlert{Titulo: "A", Nivel: "bajo"})
	}

	page1, total, err := svc.GetAll("", "", false, 1, 2)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(page1) != 2 {
		t.Fatalf("expected 2 on page 1, got %d", len(page1))
	}
	if total != 5 {
		t.Fatalf("expected total 5, got %d", total)
	}
}

func TestAlertGetAll_FilterByNivel(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "Bajo", Nivel: "bajo"})
	_ = svc.Create(&models.EpiAlert{Titulo: "Alto", Nivel: "alto"})
	_ = svc.Create(&models.EpiAlert{Titulo: "Medio", Nivel: "medio"})

	filtered, _, err := svc.GetAll("alto", "", false, 0, 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(filtered) != 1 {
		t.Fatalf("expected 1 alert with nivel alto, got %d", len(filtered))
	}
}

func TestAlertGetAll_FilterByActivas(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "Activa", Nivel: "bajo", Activa: true})
	_ = svc.Create(&models.EpiAlert{Titulo: "Inactiva", Nivel: "medio", Activa: false})

	activas, _, err := svc.GetAll("", "", true, 0, 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(activas) != 1 {
		t.Fatalf("expected 1 active alert, got %d", len(activas))
	}
	if activas[0].Titulo != "Activa" {
		t.Fatalf("expected Activa, got %s", activas[0].Titulo)
	}
}

func TestAlertUpdate_MergesFields(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "Original", Nivel: "bajo"})

	updated, err := svc.Update(&models.EpiAlert{
		BaseModel: models.BaseModel{ID: 1},
		Titulo:    "Actualizado",
		Nivel:     "medio",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Titulo != "Actualizado" {
		t.Fatalf("expected Actualizado, got %s", updated.Titulo)
	}
	if updated.Nivel != "medio" {
		t.Fatalf("expected nivel medio, got %s", updated.Nivel)
	}
}

func TestAlertUpdate_NotFound(t *testing.T) {
	svc := service.NewAlertService(&mockAlertRepo{})
	_, err := svc.Update(&models.EpiAlert{
		BaseModel: models.BaseModel{ID: 999},
		Titulo:    "Nope",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent alert")
	}
}

func TestAlertDeactivate_Success(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "Test", Nivel: "alto", Activa: true})

	if err := svc.Deactivate(1); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}

	alert, _ := svc.GetByID(1)
	if alert.Activa {
		t.Fatal("expected alert to be deactivated")
	}
}

func TestAlertDeactivate_NotFound(t *testing.T) {
	svc := service.NewAlertService(&mockAlertRepo{})
	err := svc.Deactivate(999)
	if err == nil {
		t.Fatal("expected error for nonexistent alert")
	}
}

func TestAlertDelete_Success(t *testing.T) {
	repo := &mockAlertRepo{}
	svc := service.NewAlertService(repo)
	_ = svc.Create(&models.EpiAlert{Titulo: "Test", Nivel: "bajo"})
	if err := svc.Delete(1); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	_, err := svc.GetByID(1)
	if err == nil {
		t.Fatal("expected alert to be deleted")
	}
}

func TestAlertDelete_NotFound(t *testing.T) {
	svc := service.NewAlertService(&mockAlertRepo{})
	err := svc.Delete(999)
	if err == nil {
		t.Fatal("expected error for nonexistent alert")
	}
}
