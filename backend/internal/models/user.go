package models

type User struct {
	BaseModel
	Username            string `json:"username" gorm:"unique"`
	Password            string `json:"-"`
	AntecedentesMedicos string `json:"antecedentes_medicos"`
	Rol                 string `json:"rol" gorm:"default:family"`
}
