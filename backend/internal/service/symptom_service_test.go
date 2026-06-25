package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
)

type mockSymptomRepo struct {
	symptoms []models.SymptomReport
	fail     bool
}

func (m *mockSymptomRepo) Create(report *models.SymptomReport) error {
	if m.fail {
		return errors.New("mock error")
	}
	report.ID = uint(len(m.symptoms) + 1)
	m.symptoms = append(m.symptoms, *report)
	return nil
}

func (m *mockSymptomRepo) FindByID(id uint) (*models.SymptomReport, error) {
	for _, s := range m.symptoms {
		if s.ID == id {
			return &s, nil
		}
	}
	return nil, errors.New("not found")
}

func (m *mockSymptomRepo) FindByUserID(userID uint) ([]models.SymptomReport, error) {
	var result []models.SymptomReport
	for _, s := range m.symptoms {
		if s.UserID == userID {
			result = append(result, s)
		}
	}
	return result, nil
}

func (m *mockSymptomRepo) FindScoped(id, userID uint) (*models.SymptomReport, error) {
	for _, s := range m.symptoms {
		if s.ID == id && s.UserID == userID {
			return &s, nil
		}
	}
	return nil, errors.New("not found")
}

func (m *mockSymptomRepo) Update(report *models.SymptomReport) error {
	for i, s := range m.symptoms {
		if s.ID == report.ID {
			m.symptoms[i] = *report
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockSymptomRepo) Delete(id uint) error {
	for i, s := range m.symptoms {
		if s.ID == id {
			m.symptoms = append(m.symptoms[:i], m.symptoms[i+1:]...)
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockSymptomRepo) DeleteScoped(id, userID uint) error {
	for i, s := range m.symptoms {
		if s.ID == id && s.UserID == userID {
			m.symptoms = append(m.symptoms[:i], m.symptoms[i+1:]...)
			return nil
		}
	}
	return errors.New("not found")
}

func TestCreateSymptom_Success(t *testing.T) {
	svc := service.NewSymptomService(&mockSymptomRepo{})
	err := svc.Create(&models.SymptomReport{
		UserID:      1,
		Descripcion: "fiebre",
		Fecha:       time.Date(2026, 5, 1, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestCreateSymptom_RepoError(t *testing.T) {
	svc := service.NewSymptomService(&mockSymptomRepo{fail: true})
	err := svc.Create(&models.SymptomReport{
		UserID:      1,
		Descripcion: "fiebre",
		Fecha:       time.Now(),
	})
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestGetSymptoms_Success(t *testing.T) {
	repo := &mockSymptomRepo{}
	svc := service.NewSymptomService(repo)
	_ = svc.Create(&models.SymptomReport{UserID: 1, Descripcion: "fiebre", Fecha: time.Now()})
	_ = svc.Create(&models.SymptomReport{UserID: 1, Descripcion: "tos", Fecha: time.Now()})
	_ = svc.Create(&models.SymptomReport{UserID: 2, Descripcion: "dolor", Fecha: time.Now()})

	symptoms, err := svc.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(symptoms) != 2 {
		t.Fatalf("expected 2 symptoms, got %d", len(symptoms))
	}
}

func TestGetSymptoms_Empty(t *testing.T) {
	svc := service.NewSymptomService(&mockSymptomRepo{})
	symptoms, err := svc.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(symptoms) != 0 {
		t.Fatalf("expected 0 symptoms, got %d", len(symptoms))
	}
}
