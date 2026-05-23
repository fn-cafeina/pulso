package db

import (
	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB(path string) {
	var err error
	DB, err = gorm.Open(sqlite.Open(path), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	if err := DB.AutoMigrate(
		&models.User{},
		&models.SymptomReport{},
		&models.VaccinationRecord{},
		&models.Appointment{},
		&models.HealthService{},
		&models.HealthEvent{},
		&models.EpiAlert{},
	); err != nil {
		panic("failed to migrate database")
	}
}
