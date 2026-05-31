package handlers

import (
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Success(c *gin.Context, status int, data any) {
	c.JSON(status, gin.H{"data": data})
}

func SuccessMsg(c *gin.Context, status int, msg string, data any) {
	c.JSON(status, gin.H{"data": data, "message": msg})
}

func Msg(c *gin.Context, status int, msg string) {
	c.JSON(status, gin.H{"message": msg})
}

func Error(c *gin.Context, status int, msg string) {
	c.JSON(status, gin.H{"error": msg})
}

func PaginatedSuccess(c *gin.Context, status int, data any, meta PaginationMeta) {
	c.JSON(status, gin.H{"data": data, "meta": meta})
}

func InternalError(c *gin.Context, err error) {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		Error(c, http.StatusNotFound, "recurso no encontrado")
		return
	}
	Error(c, http.StatusInternalServerError, "error interno del servidor")
}
