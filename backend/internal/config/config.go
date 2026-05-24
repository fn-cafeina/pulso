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
	GeminiAPIKey       string
	HealthWorkerSecret string
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No se encontró archivo .env, usando variables de entorno del sistema")
	}

	return &Config{
		JWTSecret:          getEnv("JWT_SECRET", "pulso-secret-key"),
		Port:               getEnv("PORT", ":8080"),
		DBPath:             getEnv("DB_PATH", "pulso.db"),
		GeminiAPIKey:       getEnv("GEMINI_API_KEY", ""),
		HealthWorkerSecret: getEnv("HEALTH_WORKER_SECRET", ""),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
