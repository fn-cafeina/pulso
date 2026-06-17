package service_test

import (
	"testing"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"gorm.io/gorm"
)

type mockServiceRepo struct {
	services []models.HealthService
}

func (m *mockServiceRepo) Create(svc *models.HealthService) error {
	svc.ID = uint(len(m.services) + 1)
	m.services = append(m.services, *svc)
	return nil
}

func (m *mockServiceRepo) FindByID(id uint) (*models.HealthService, error) {
	for _, s := range m.services {
		if s.ID == id {
			return &s, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockServiceRepo) FindAll(page, perPage int) ([]models.HealthService, int64, error) {
	total := int64(len(m.services))
	if page <= 0 {
		return m.services, total, nil
	}
	offset := (page - 1) * perPage
	if offset >= len(m.services) {
		return nil, total, nil
	}
	end := offset + perPage
	if end > len(m.services) {
		end = len(m.services)
	}
	return m.services[offset:end], total, nil
}

func (m *mockServiceRepo) Update(svc *models.HealthService) error {
	for i, s := range m.services {
		if s.ID == svc.ID {
			m.services[i] = *svc
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func (m *mockServiceRepo) Delete(id uint) error {
	for i, s := range m.services {
		if s.ID == id {
			m.services = append(m.services[:i], m.services[i+1:]...)
			return nil
		}
	}
	return gorm.ErrRecordNotFound
}

func TestServiceCreate_Success(t *testing.T) {
	svc := service.NewServiceService(&mockServiceRepo{})
	s := &models.HealthService{Nombre: "Centro de Salud", Tipo: "hospital"}
	err := svc.Create(s)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if s.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestServiceGetByID_Success(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "Centro 1", Tipo: "hospital"})

	got, err := svc.GetByID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if got.Nombre != "Centro 1" {
		t.Fatalf("expected Centro 1, got %s", got.Nombre)
	}
}

func TestServiceGetByID_NotFound(t *testing.T) {
	svc := service.NewServiceService(&mockServiceRepo{})
	_, err := svc.GetByID(999)
	if err == nil {
		t.Fatal("expected error for nonexistent ID")
	}
}

func TestServiceGetAll_Success(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "C1", Tipo: "hospital"})
	_ = svc.Create(&models.HealthService{Nombre: "C2", Tipo: "clinica"})

	all, _, err := svc.GetAll(0, 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(all) != 2 {
		t.Fatalf("expected 2 services, got %d", len(all))
	}
}

func TestServiceGetAll_Pagination(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	for i := 0; i < 5; i++ {
		_ = svc.Create(&models.HealthService{Nombre: "C"})
	}

	page1, total, err := svc.GetAll(1, 2)
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

func TestServiceGetAll_Empty(t *testing.T) {
	svc := service.NewServiceService(&mockServiceRepo{})
	all, _, err := svc.GetAll(0, 0)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(all) != 0 {
		t.Fatalf("expected 0 services, got %d", len(all))
	}
}

func TestServiceGetNearby_FiltersByRadius(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "Cerca", Latitud: 12.115, Longitud: -86.236})
	// León (~78km away)
	_ = svc.Create(&models.HealthService{Nombre: "Lejos", Latitud: 12.434, Longitud: -86.878})

	nearby, err := svc.GetNearby(12.11499, -86.23617, 50)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(nearby) != 1 {
		t.Fatalf("expected 1 nearby service within 50km, got %d", len(nearby))
	}
	if nearby[0].Nombre != "Cerca" {
		t.Fatalf("expected Cerca, got %s", nearby[0].Nombre)
	}
}

func TestServiceGetNearby_NoResults(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "Lejos",
		Latitud: 12.434, Longitud: -86.878})

	nearby, err := svc.GetNearby(12.11499, -86.23617, 1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(nearby) != 0 {
		t.Fatalf("expected 0 nearby services, got %d", len(nearby))
	}
}

func TestServiceGetNearby_AllWithinRadius(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "A", Latitud: 12.115, Longitud: -86.236})
	_ = svc.Create(&models.HealthService{Nombre: "B", Latitud: 12.116, Longitud: -86.237})

	nearby, err := svc.GetNearby(12.11499, -86.23617, 100)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(nearby) != 2 {
		t.Fatalf("expected 2 nearby services, got %d", len(nearby))
	}
}

func TestServiceUpdate_MergesFields(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "Original", Tipo: "hospital",
		Latitud: 12.0, Longitud: -86.0})

	updated, err := svc.Update(&models.HealthService{
		BaseModel: models.BaseModel{ID: 1},
		Nombre:    "Actualizado",
		Tipo:      "clinica",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if updated.Nombre != "Actualizado" {
		t.Fatalf("expected Actualizado, got %s", updated.Nombre)
	}
}

func TestServiceUpdate_NotFound(t *testing.T) {
	svc := service.NewServiceService(&mockServiceRepo{})
	_, err := svc.Update(&models.HealthService{
		BaseModel: models.BaseModel{ID: 999},
		Nombre:    "Nope",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent service")
	}
}

func TestServiceDelete_Success(t *testing.T) {
	repo := &mockServiceRepo{}
	svc := service.NewServiceService(repo)
	_ = svc.Create(&models.HealthService{Nombre: "Test", Tipo: "hospital"})
	if err := svc.Delete(1); err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	_, err := svc.GetByID(1)
	if err == nil {
		t.Fatal("expected service to be deleted")
	}
}

func TestServiceDelete_NotFound(t *testing.T) {
	svc := service.NewServiceService(&mockServiceRepo{})
	err := svc.Delete(999)
	if err == nil {
		t.Fatal("expected error for nonexistent service")
	}
}
