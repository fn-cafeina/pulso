package handlers

import "github.com/gin-gonic/gin"

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