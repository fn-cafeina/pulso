package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Username            string `json:"username" gorm:"unique"`
	Password            string `json:"-"`
	AntecedentesMedicos string `json:"antecedentes_medicos"`
	Rol                 string `json:"rol" gorm:"default:family"`
}
