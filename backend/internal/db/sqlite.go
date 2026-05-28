package db

import (
	"sync"

	"github.com/fn-cafeina/pulso/backend/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var (
	DB     *gorm.DB
	initMu sync.Mutex
)

func InitDB(path string) {
	initMu.Lock()
	defer initMu.Unlock()
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
		&models.AIConsultation{},
		&models.Reminder{},
	); err != nil {
		panic("failed to migrate database")
	}
}
