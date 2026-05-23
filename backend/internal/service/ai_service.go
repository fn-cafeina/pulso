package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/ai"
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
)

type AIService interface {
	Consult(userID uint, pregunta string) (*models.AIConsultation, error)
	GetHistory(userID uint) ([]models.AIConsultation, error)
}

type aiService struct {
	aiRepo     repository.AIRepository
	userRepo   repository.UserRepository
	healthRepo repository.HealthRepository
	apptRepo   repository.AppointmentRepository
	gemini     *ai.Client
}

func NewAIService(
	aiRepo repository.AIRepository,
	userRepo repository.UserRepository,
	healthRepo repository.HealthRepository,
	apptRepo repository.AppointmentRepository,
	gemini *ai.Client,
) AIService {
	return &aiService{
		aiRepo:     aiRepo,
		userRepo:   userRepo,
		healthRepo: healthRepo,
		apptRepo:   apptRepo,
		gemini:     gemini,
	}
}

func (s *aiService) Consult(userID uint, pregunta string) (*models.AIConsultation, error) {
	if s.gemini == nil {
		return nil, fmt.Errorf("asistente no disponible")
	}

	ctx := context.Background()

	user, _ := s.userRepo.FindByID(userID)
	symptoms, _ := s.healthRepo.FindSymptomsByUserID(userID)
	vaccines, _ := s.healthRepo.FindVaccinesByUserID(userID)
	appts, _ := s.apptRepo.FindByUserID(userID)

	var b strings.Builder
	b.WriteString("[CONTEXTO DEL USUARIO]\n")

	if user != nil && user.AntecedentesMedicos != "" {
		b.WriteString(fmt.Sprintf("Antecedentes médicos: %s\n\n", user.AntecedentesMedicos))
	}

	if len(symptoms) > 0 {
		b.WriteString("Síntomas reportados:\n")
		for _, s := range symptoms {
			b.WriteString(fmt.Sprintf("  - %s: %s\n", s.Fecha.Format("02/01/2006"), s.Descripcion))
		}
		b.WriteString("\n")
	}

	if len(vaccines) > 0 {
		b.WriteString("Vacunas registradas:\n")
		for _, v := range vaccines {
			b.WriteString(fmt.Sprintf("  - %s (%s)\n", v.NombreVacuna, v.FechaAplicacion.Format("02/01/2006")))
		}
		b.WriteString("\n")
	}

	if len(appts) > 0 {
		b.WriteString("Citas:\n")
		now := time.Now()
		for _, a := range appts {
			if a.Fecha.After(now) {
				b.WriteString(fmt.Sprintf("  - %s: %s\n", a.Fecha.Format("02/01/2006"), a.Descripcion))
			}
		}
		b.WriteString("\n")
	}

	b.WriteString("[CONSULTA]\n")
	b.WriteString(pregunta)

	respuesta, err := s.gemini.GenerateContent(ctx, b.String())
	if err != nil {
		return nil, err
	}

	consult := &models.AIConsultation{
		UserID:    userID,
		Pregunta:  pregunta,
		Respuesta: respuesta,
	}
	if err := s.aiRepo.Create(consult); err != nil {
		return nil, err
	}

	return consult, nil
}

func (s *aiService) GetHistory(userID uint) ([]models.AIConsultation, error) {
	return s.aiRepo.FindByUserID(userID)
}
