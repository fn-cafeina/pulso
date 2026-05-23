package models

import "gorm.io/gorm"

type EpiAlert struct {
	gorm.Model
	Titulo       string `json:"titulo" binding:"required"`
	Descripcion  string `json:"descripcion" binding:"required"`
	Nivel        string `json:"nivel" binding:"required,oneof=bajo medio alto critico"`
	Departamento string `json:"departamento"`
	Fuente       string `json:"fuente"`
	Activa       bool   `json:"activa"`
}
