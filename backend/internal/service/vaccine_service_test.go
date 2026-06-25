package service_test

import (
	"errors"
	"testing"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
)

type mockVaccineRepo struct {
	vaccines []models.VaccinationRecord
	fail     bool
}

func (m *mockVaccineRepo) Create(record *models.VaccinationRecord) error {
	if m.fail {
		return errors.New("mock error")
	}
	record.ID = uint(len(m.vaccines) + 1)
	m.vaccines = append(m.vaccines, *record)
	return nil
}

func (m *mockVaccineRepo) FindByID(id uint) (*models.VaccinationRecord, error) {
	for _, v := range m.vaccines {
		if v.ID == id {
			return &v, nil
		}
	}
	return nil, errors.New("not found")
}

func (m *mockVaccineRepo) FindByUserID(userID uint) ([]models.VaccinationRecord, error) {
	var result []models.VaccinationRecord
	for _, v := range m.vaccines {
		if v.UserID == userID {
			result = append(result, v)
		}
	}
	return result, nil
}

func (m *mockVaccineRepo) FindScoped(id, userID uint) (*models.VaccinationRecord, error) {
	for _, v := range m.vaccines {
		if v.ID == id && v.UserID == userID {
			return &v, nil
		}
	}
	return nil, errors.New("not found")
}

func (m *mockVaccineRepo) Update(record *models.VaccinationRecord) error {
	for i, v := range m.vaccines {
		if v.ID == record.ID {
			m.vaccines[i] = *record
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockVaccineRepo) Delete(id uint) error {
	for i, v := range m.vaccines {
		if v.ID == id {
			m.vaccines = append(m.vaccines[:i], m.vaccines[i+1:]...)
			return nil
		}
	}
	return errors.New("not found")
}

func (m *mockVaccineRepo) DeleteScoped(id, userID uint) error {
	for i, v := range m.vaccines {
		if v.ID == id && v.UserID == userID {
			m.vaccines = append(m.vaccines[:i], m.vaccines[i+1:]...)
			return nil
		}
	}
	return errors.New("not found")
}

func TestCreateVaccine_Success(t *testing.T) {
	svc := service.NewVaccineService(&mockVaccineRepo{})
	err := svc.Create(&models.VaccinationRecord{
		UserID:          1,
		NombreVacuna:    "BCG",
		FechaAplicacion: time.Date(2026, 1, 15, 0, 0, 0, 0, time.UTC),
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
}

func TestCreateVaccine_RepoError(t *testing.T) {
	svc := service.NewVaccineService(&mockVaccineRepo{fail: true})
	err := svc.Create(&models.VaccinationRecord{
		UserID:          1,
		NombreVacuna:    "BCG",
		FechaAplicacion: time.Now(),
	})
	if err == nil {
		t.Fatal("expected error from repo")
	}
}

func TestGetVaccines_Success(t *testing.T) {
	repo := &mockVaccineRepo{}
	svc := service.NewVaccineService(repo)
	_ = svc.Create(&models.VaccinationRecord{UserID: 1, NombreVacuna: "BCG", FechaAplicacion: time.Now()})
	_ = svc.Create(&models.VaccinationRecord{UserID: 1, NombreVacuna: "Pentavalente", FechaAplicacion: time.Now()})

	vaccines, err := svc.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(vaccines) != 2 {
		t.Fatalf("expected 2 vaccines, got %d", len(vaccines))
	}
}

func TestGetVaccines_Empty(t *testing.T) {
	svc := service.NewVaccineService(&mockVaccineRepo{})
	vaccines, err := svc.GetByUserID(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(vaccines) != 0 {
		t.Fatalf("expected 0 vaccines, got %d", len(vaccines))
	}
}