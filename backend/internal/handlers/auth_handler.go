package handlers

import (
	"net/http"
	"strings"

	"github.com/fn-cafeina/pulso/backend/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authSvc service.AuthService
}

func NewAuthHandler(authSvc service.AuthService) *AuthHandler {
	return &AuthHandler{authSvc: authSvc}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req service.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, "usuario y contraseña son requeridos")
		return
	}

	user, err := h.authSvc.Register(req)
	if err != nil {
		msg := "error al registrar usuario"
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			msg = "el nombre de usuario ya está en uso"
		}
		Error(c, http.StatusConflict, msg)
		return
	}

	SuccessMsg(c, http.StatusCreated, "usuario registrado", gin.H{
		"id":  user.ID,
		"rol": user.Rol,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, "usuario y contraseña son requeridos")
		return
	}

	token, rol, err := h.authSvc.Login(req)
	if err != nil {
		Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	SuccessMsg(c, http.StatusOK, "inicio de sesión exitoso", gin.H{
		"token": token,
		"rol":   rol,
	})
}
