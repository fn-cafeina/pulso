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
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, "usuario y contraseña son requeridos")
		return
	}

	user, err := h.authSvc.Register(req.Username, req.Password, req.AntecedentesMedicos, req.Codigo)
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE constraint") {
			Error(c, http.StatusConflict, "el nombre de usuario ya está en uso")
			return
		}
		if strings.Contains(err.Error(), "código de health worker") ||
			strings.Contains(err.Error(), "no disponible") {
			Error(c, http.StatusBadRequest, err.Error())
			return
		}
		Error(c, http.StatusInternalServerError, "error al registrar usuario")
		return
	}

	SuccessMsg(c, http.StatusCreated, "usuario registrado", gin.H{
		"id":  user.ID,
		"rol": user.Rol,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		Error(c, http.StatusBadRequest, "usuario y contraseña son requeridos")
		return
	}

	token, rol, err := h.authSvc.Login(req.Username, req.Password)
	if err != nil {
		Error(c, http.StatusUnauthorized, err.Error())
		return
	}

	SuccessMsg(c, http.StatusOK, "inicio de sesión exitoso", gin.H{
		"token": token,
		"rol":   rol,
	})
}
