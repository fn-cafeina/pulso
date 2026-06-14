package service

import (
	"context"
	"fmt"
	"log"
	"regexp"
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
		return nil, fmt.Errorf("AI assistant not available")
	}

	ctx := context.Background()

	user, err := s.userRepo.FindByID(userID)
	if err != nil {
		log.Printf("warning: failed to load user %d: %v", userID, err)
	}
	symptoms, err := s.healthRepo.FindSymptomsByUserID(userID)
	if err != nil {
		log.Printf("warning: failed to load symptoms for %d: %v", userID, err)
	}
	vaccines, err := s.healthRepo.FindVaccinesByUserID(userID)
	if err != nil {
		log.Printf("warning: failed to load vaccines for %d: %v", userID, err)
	}
	appts, err := s.apptRepo.FindByUserID(userID)
	if err != nil {
		log.Printf("warning: failed to load appointments for %d: %v", userID, err)
	}

	var b strings.Builder
	fmt.Fprintf(&b, "[FECHA ACTUAL: %s]\n\n", time.Now().Format("02/01/2006"))
	b.WriteString("[CONTEXTO DEL USUARIO]\n")

	if user != nil && user.AntecedentesMedicos != "" {
		fmt.Fprintf(&b, "Antecedentes médicos: %s\n\n", user.AntecedentesMedicos)
	}

	if len(symptoms) > 0 {
		b.WriteString("Síntomas reportados:\n")
		for _, s := range symptoms {
			fmt.Fprintf(&b, "  - %s: %s\n", s.Fecha.Format("02/01/2006"), s.Descripcion)
		}
		b.WriteString("\n")
	}

	if len(vaccines) > 0 {
		b.WriteString("Vacunas registradas:\n")
		for _, v := range vaccines {
			fmt.Fprintf(&b, "  - %s (%s)\n", v.NombreVacuna, v.FechaAplicacion.Format("02/01/2006"))
		}
		b.WriteString("\n")
	}

	if len(appts) > 0 {
		b.WriteString("Citas:\n")
		now := time.Now()
		for _, a := range appts {
			if a.Fecha.After(now) {
				fmt.Fprintf(&b, "  - %s: %s\n", a.Fecha.Format("02/01/2006"), a.Descripcion)
			}
		}
		b.WriteString("\n")
	}

	history, err := s.aiRepo.FindByUserID(userID)
	if err == nil && len(history) > 0 {
		n := 3
		if len(history) < n {
			n = len(history)
		}
		recent := history[len(history)-n:]
		b.WriteString("[HISTORIAL DE CONSULTAS RECIENTES]\n")
		for _, h := range recent {
			fmt.Fprintf(&b, "  Pregunta: %s\n  Respuesta: %s\n\n", h.Pregunta, h.Respuesta)
		}
	}

	b.WriteString("[CONSULTA]\n")
	b.WriteString(pregunta)

	respuesta, err := s.gemini.GenerateContent(ctx, b.String())
	if err != nil {
		return nil, err
	}
	respuesta = NormalizeResponse(respuesta)

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

var (
	reMultiNewline = regexp.MustCompile(`\n{3,}`)
	reMarkdownBold = regexp.MustCompile(`\*\*`)
)

func NormalizeResponse(r string) string {
	r = strings.TrimSpace(r)

	centerCount := reMarkdownBold.FindAllStringIndex(r, -1)
	lower := strings.ToLower(r)
	if strings.Contains(lower, "acud") && strings.Contains(lower, "centro de salud") && len(centerCount) < 2 {
		re := regexp.MustCompile(`(?i)(acud\w* al centro de salud más cercano)`)
		r = re.ReplaceAllString(r, "**$1**")
	}

	r = reMultiNewline.ReplaceAllString(r, "\n\n")

	return r
}
