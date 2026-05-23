package db

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	DB, err = gorm.Open(sqlite.Open("pulso.db"), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	DB.AutoMigrate(
		&models.User{},
		&models.SymptomReport{},
		&models.VaccinationRecord{},
		&models.Appointment{},
		&models.HealthService{},
	)
}
