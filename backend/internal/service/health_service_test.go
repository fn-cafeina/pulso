package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
)

type mockHealthRepo struct {
	symptoms []models.SymptomReport
	vaccines []models.VaccinationRecord
	fail     bool
}

func (m *mockHealthRepo) CreateSymptom(report *models.SymptomReport) error {
	if m.fail {
		return errors.New("mock error")
	}
	report.ID = uint(len(m.symptoms) + 1)
	m.symptoms = append(m.symptoms, *report)
	return nil
}

func (m *mockHealthRepo) FindSymptomsByUserID(userID uint) ([]models.SymptomReport, error) {
	var result []models.SymptomReport
	for _, s := range m.symptoms {
		if s.UserID == userID {
			result = append(result, s)
		}
	}
	return result, nil
}

func (m *mockHealthRepo) CreateVaccine(record *models.VaccinationRecord) error {
	if m.fail {
		return errors.New("mock error")
	}
	record.ID = uint(len(m.vaccines) + 1)
	m.vaccines = append(m.vaccines, *record)
	return nil
}

func (m *mockHealthRepo) FindVaccinesByUserID(userID uint) ([]models.VaccinationRecord, error) {
	var result []models.VaccinationRecord
	for _, v := range m.vaccines {
		if v.UserID == userID {
			result = append(result, v)
		}
	}
	return result, nil
}

func TestCreateSymptom_Success(t *testing.T) {
	svc := service.NewHealthService(&mockHealthRepo{})
	report, err := svc.CreateSymptom(1, "fiebre", time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if report.Descripcion != "fiebre" {
		t.Fatalf("expected descripcion fiebre, got %s", report.Descripcion)
	}
	if report.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestCreateSymptom_RepoError(t *testing.T) {
	svc := service.NewHealthService(&mockHealthRepo{fail: true})
	_, err := svc.CreateSymptom(1, "fiebre", time.Now())
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestGetSymptoms_Success(t *testing.T) {
	repo := &mockHealthRepo{}
	svc := service.NewHealthService(repo)
	_, _ = svc.CreateSymptom(1, "fiebre", time.Now())
	_, _ = svc.CreateSymptom(1, "tos", time.Now())
	_, _ = svc.CreateSymptom(2, "dolor", time.Now())

	symptoms, err := svc.GetSymptoms(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(symptoms) != 2 {
		t.Fatalf("expected 2 symptoms, got %d", len(symptoms))
	}
}

func TestGetSymptoms_Empty(t *testing.T) {
	svc := service.NewHealthService(&mockHealthRepo{})
	symptoms, err := svc.GetSymptoms(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(symptoms) != 0 {
		t.Fatalf("expected 0 symptoms, got %d", len(symptoms))
	}
}

func TestCreateVaccine_Success(t *testing.T) {
	svc := service.NewHealthService(&mockHealthRepo{})
	record, err := svc.CreateVaccine(1, "BCG", time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if record.NombreVacuna != "BCG" {
		t.Fatalf("expected BCG, got %s", record.NombreVacuna)
	}
	if record.ID == 0 {
		t.Fatal("expected ID to be set")
	}
}

func TestCreateVaccine_RepoError(t *testing.T) {
	svc := service.NewHealthService(&mockHealthRepo{fail: true})
	_, err := svc.CreateVaccine(1, "BCG", time.Now())
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestGetVaccines_Success(t *testing.T) {
	repo := &mockHealthRepo{}
	svc := service.NewHealthService(repo)
	_, _ = svc.CreateVaccine(1, "BCG", time.Now())
	_, _ = svc.CreateVaccine(1, "Pentavalente", time.Now())

	vaccines, err := svc.GetVaccines(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(vaccines) != 2 {
		t.Fatalf("expected 2 vaccines, got %d", len(vaccines))
	}
}

func TestGetVaccines_Empty(t *testing.T) {
	svc := service.NewHealthService(&mockHealthRepo{})
	vaccines, err := svc.GetVaccines(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(vaccines) != 0 {
		t.Fatalf("expected 0 vaccines, got %d", len(vaccines))
	}
}
