package handlers

import (
	"strconv"

	"github.com/gin-gonic/gin"
)

type PaginationParams struct {
	Page    int
	PerPage int
}

type PaginationMeta struct {
	Page    int   `json:"page"`
	PerPage int   `json:"per_page"`
	Total   int64 `json:"total"`
}

func ParsePagination(c *gin.Context) PaginationParams {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "0"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "20"))

	if page < 0 {
		page = 0
	}
	if perPage <= 0 {
		perPage = 20
	}
	if perPage > 100 {
		perPage = 100
	}

	return PaginationParams{Page: page, PerPage: perPage}
}

func (p PaginationParams) IsEnabled() bool {
	return p.Page > 0
}

func (p PaginationParams) Offset() int {
	return (p.Page - 1) * p.PerPage
}
