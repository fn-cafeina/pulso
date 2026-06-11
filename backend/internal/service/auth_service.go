package service

import (
	"errors"
	"time"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AuthService interface {
	Register(req RegisterRequest) (*models.User, error)
	Login(req LoginRequest) (string, string, error)
}

type RegisterRequest struct {
	Username            string `json:"username" binding:"required,min=3"`
	Password            string `json:"password" binding:"required,min=6"`
	AntecedentesMedicos string `json:"antecedentes_medicos"`
	Codigo              string `json:"codigo"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type authService struct {
	userRepo           repository.UserRepository
	jwtSecret          string
	healthWorkerSecret string
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string, healthWorkerSecret string) AuthService {
	return &authService{userRepo: userRepo, jwtSecret: jwtSecret, healthWorkerSecret: healthWorkerSecret}
}

func (s *authService) Register(req RegisterRequest) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	rol := "family"
	if req.Codigo != "" {
		if s.healthWorkerSecret == "" {
			return nil, errors.New("registro de personal de salud no disponible")
		}
		if req.Codigo != s.healthWorkerSecret {
			return nil, errors.New("código de health worker inválido")
		}
		rol = "health_worker"
	}

	user := &models.User{
		Username:            req.Username,
		Password:            string(hash),
		AntecedentesMedicos: req.AntecedentesMedicos,
		Rol:                 rol,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(req LoginRequest) (string, string, error) {
	user, err := s.userRepo.FindByUsername(req.Username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", "", errors.New("usuario no encontrado")
		}
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		return "", "", errors.New("contraseña incorrecta")
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":  user.ID,
		"username": user.Username,
		"rol":      user.Rol,
		"exp":      time.Now().Add(72 * time.Hour).Unix(),
	})

	signed, err := token.SignedString([]byte(s.jwtSecret))
	return signed, user.Rol, err
}
