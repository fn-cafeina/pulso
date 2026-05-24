package service_test

import (
	"errors"
	"testing"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
)

type mockUserRepo struct {
	users  []models.User
	nextID uint
}

func (m *mockUserRepo) Create(user *models.User) error {
	for _, u := range m.users {
		if u.Username == user.Username {
			return errors.New("UNIQUE constraint failed")
		}
	}
	m.nextID++
	user.ID = m.nextID
	m.users = append(m.users, *user)
	return nil
}

func (m *mockUserRepo) FindByUsername(username string) (*models.User, error) {
	for _, u := range m.users {
		if u.Username == username {
			return &u, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func (m *mockUserRepo) FindByID(id uint) (*models.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return &u, nil
		}
	}
	return nil, gorm.ErrRecordNotFound
}

func TestRegister_Success(t *testing.T) {
	svc := service.NewAuthService(&mockUserRepo{}, "secret", "")
	user, err := svc.Register(service.RegisterRequest{
		Username: "testuser",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if user.Username != "testuser" {
		t.Fatalf("expected username testuser, got %s", user.Username)
	}
	if user.ID == 0 {
		t.Fatal("expected user ID to be set")
	}
}

func TestRegister_DuplicateUsername(t *testing.T) {
	svc := service.NewAuthService(&mockUserRepo{}, "secret", "")
	_, _ = svc.Register(service.RegisterRequest{
		Username: "testuser",
		Password: "password123",
	})
	_, err := svc.Register(service.RegisterRequest{
		Username: "testuser",
		Password: "password456",
	})
	if err == nil {
		t.Fatal("expected error for duplicate username")
	}
}

func TestLogin_Success(t *testing.T) {
	svc := service.NewAuthService(&mockUserRepo{}, "test-secret", "")
	_, _ = svc.Register(service.RegisterRequest{
		Username: "testuser",
		Password: "password123",
	})
	token, _, err := svc.Login(service.LoginRequest{
		Username: "testuser",
		Password: "password123",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if token == "" {
		t.Fatal("expected token, got empty string")
	}
	parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return []byte("test-secret"), nil
	})
	if err != nil {
		t.Fatalf("expected valid token, got %v", err)
	}
	claims, ok := parsed.Claims.(jwt.MapClaims)
	if !ok || !parsed.Valid {
		t.Fatal("expected valid token claims")
	}
	if claims["username"] != "testuser" {
		t.Fatalf("expected username testuser in token, got %v", claims["username"])
	}
}

func TestLogin_InvalidCredentials(t *testing.T) {
	svc := service.NewAuthService(&mockUserRepo{}, "secret", "")
	_, _ = svc.Register(service.RegisterRequest{
		Username: "testuser",
		Password: "password123",
	})
	_, _, err := svc.Login(service.LoginRequest{
		Username: "testuser",
		Password: "wrongpassword",
	})
	if err == nil {
		t.Fatal("expected error for wrong password")
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	svc := service.NewAuthService(&mockUserRepo{}, "secret", "")
	_, _, err := svc.Login(service.LoginRequest{
		Username: "nonexistent",
		Password: "password123",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent user")
	}
}
