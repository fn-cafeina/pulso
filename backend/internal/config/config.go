package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	JWTSecret          string
	Port               string
	DBPath             string
	NVIDIAAPIKey       string
	NVIDIAModel        string
	HealthWorkerSecret string
	CORSOrigin         string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println(".env file not found, using system environment variables")
	}

	jwt := getEnv("JWT_SECRET", "")
	if jwt == "" {
		log.Fatal("JWT_SECRET is required")
	}

	secret := getEnv("HEALTH_WORKER_SECRET", "")
	if secret == "" {
		log.Fatal("HEALTH_WORKER_SECRET is required")
	}

	return &Config{
		JWTSecret:          jwt,
		Port:               getEnv("PORT", ":8080"),
		DBPath:             getEnv("DB_PATH", "pulso.db"),
		NVIDIAAPIKey:       getEnv("NVIDIA_API_KEY", ""),
		NVIDIAModel:        getEnv("NVIDIA_MODEL", "mistralai/mistral-large-3-675b-instruct"),
		HealthWorkerSecret: secret,
		CORSOrigin:         getEnv("CORS_ORIGIN", "http://localhost:5173"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
