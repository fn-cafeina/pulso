package handlers

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func ParseID(c *gin.Context) (uint, error) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		Error(c, http.StatusBadRequest, "id inválido")
		return 0, err
	}
	return uint(id), nil
}

func NotFoundOrInternal(c *gin.Context, err error, resource string) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		Error(c, http.StatusNotFound, resource+" no encontrado")
		return
	}
	Error(c, http.StatusInternalServerError, "error interno del servidor")
}
