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
	Register(username, password, antecedentes, codigo string) (*models.User, error)
	Login(username, password string) (string, string, error)
}

type authService struct {
	userRepo           repository.UserRepository
	jwtSecret          string
	healthWorkerSecret string
}

func NewAuthService(userRepo repository.UserRepository, jwtSecret string, healthWorkerSecret string) AuthService {
	return &authService{userRepo: userRepo, jwtSecret: jwtSecret, healthWorkerSecret: healthWorkerSecret}
}

func (s *authService) Register(username, password, antecedentes, codigo string) (*models.User, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	rol := "family"
	if codigo != "" {
		if s.healthWorkerSecret == "" {
			return nil, errors.New("registro de personal de salud no disponible")
		}
		if codigo != s.healthWorkerSecret {
			return nil, errors.New("código de health worker inválido")
		}
		rol = "health_worker"
	}

	user := &models.User{
		Username:            username,
		Password:            string(hash),
		AntecedentesMedicos: antecedentes,
		Rol:                 rol,
	}

	if err := s.userRepo.Create(user); err != nil {
		return nil, err
	}

	return user, nil
}

func (s *authService) Login(username, password string) (string, string, error) {
	user, err := s.userRepo.FindByUsername(username)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "", "", errors.New("usuario no encontrado")
		}
		return "", "", err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
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