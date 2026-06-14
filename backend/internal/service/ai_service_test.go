package service_test

import (
	"context"
	"strings"
	"testing"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
)

type mockAIRepo struct {
	consults []models.AIConsultation
}

func (m *mockAIRepo) Create(c *models.AIConsultation) error {
	c.ID = uint(len(m.consults) + 1)
	m.consults = append(m.consults, *c)
	return nil
}

func (m *mockAIRepo) FindByUserID(userID uint) ([]models.AIConsultation, error) {
	var result []models.AIConsultation
	for _, c := range m.consults {
		if c.UserID == userID {
			result = append(result, c)
		}
	}
	return result, nil
}

type mockAIUserRepo struct {
	users []models.User
}

func (m *mockAIUserRepo) Create(user *models.User) error {
	return nil
}

func (m *mockAIUserRepo) FindByUsername(username string) (*models.User, error) {
	return nil, nil
}

func (m *mockAIUserRepo) FindByID(id uint) (*models.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return &u, nil
		}
	}
	return nil, nil
}

type mockAIHealthRepo struct {
	symptoms []models.SymptomReport
	vaccines []models.VaccinationRecord
}

func (m *mockAIHealthRepo) CreateSymptom(report *models.SymptomReport) error {
	return nil
}

func (m *mockAIHealthRepo) FindSymptomsByUserID(userID uint) ([]models.SymptomReport, error) {
	return m.symptoms, nil
}

func (m *mockAIHealthRepo) CreateVaccine(record *models.VaccinationRecord) error {
	return nil
}

func (m *mockAIHealthRepo) FindVaccinesByUserID(userID uint) ([]models.VaccinationRecord, error) {
	return m.vaccines, nil
}

type mockAIApptRepo struct {
	appts []models.Appointment
}

func (m *mockAIApptRepo) Create(appt *models.Appointment) error {
	return nil
}

func (m *mockAIApptRepo) FindByUserID(userID uint) ([]models.Appointment, error) {
	return m.appts, nil
}

func TestAIConsult_GeminiNil(t *testing.T) {
	svc := service.NewAIService(
		&mockAIRepo{},
		&mockAIUserRepo{},
		&mockAIHealthRepo{},
		&mockAIApptRepo{},
		nil,
	)
	_, err := svc.ConsultStream(context.Background(), 1, "¿Qué síntomas tengo?", nil)
	if err == nil {
		t.Fatal("expected error when gemini client is nil")
	}
}

func TestAIGetHistory_Success(t *testing.T) {
	aiRepo := &mockAIRepo{}
	svc := service.NewAIService(
		aiRepo,
		&mockAIUserRepo{},
		&mockAIHealthRepo{},
		&mockAIApptRepo{},
		nil,
	)
	aiRepo.consults = []models.AIConsultation{
		{BaseModel: models.BaseModel{ID: 1}, UserID: 1, Pregunta: "P1"},
		{BaseModel: models.BaseModel{ID: 2}, UserID: 1, Pregunta: "P2"},
	}

	history, err := svc.GetHistory(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(history) != 2 {
		t.Fatalf("expected 2 history entries, got %d", len(history))
	}
}

func TestAIGetHistory_Empty(t *testing.T) {
	svc := service.NewAIService(
		&mockAIRepo{},
		&mockAIUserRepo{},
		&mockAIHealthRepo{},
		&mockAIApptRepo{},
		nil,
	)
	history, err := svc.GetHistory(1)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(history) != 0 {
		t.Fatalf("expected 0 history entries, got %d", len(history))
	}
}

func TestNormalizeResponse_WrapsUrgentInBold(t *testing.T) {
	result := service.NormalizeResponse("Acude al centro de salud más cercano.")
	if !strings.Contains(result, "**Acude") {
		t.Fatalf("expected bold wrapping, got: %s", result)
	}
}

func TestNormalizeResponse_CollapsesExtraNewlines(t *testing.T) {
	input := "Hola!\n\n\n\n¿Cómo estás?"
	result := service.NormalizeResponse(input)
	if strings.Contains(result, "\n\n\n") {
		t.Fatalf("expected no triple newlines, got: %s", result)
	}
}

func TestNormalizeResponse_PassesThrough(t *testing.T) {
	input := "Mirá, lo que tenés es algo leve."
	result := service.NormalizeResponse(input)
	if result != input {
		t.Fatalf("expected unchanged, got: %s", result)
	}
}
