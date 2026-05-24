package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func RoleRequired(role string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("rol")
		if !exists || userRole != role {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "acceso no autorizado"})
			return
		}
		c.Next()
	}
}
