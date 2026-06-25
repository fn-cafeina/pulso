package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	JWTSecret          string
	Port               string
	DBPath             string
	NVIDIAAPIKey       string
	HealthWorkerSecret string
	CORSOrigin         string
	TTSCachePath       string
	TTSTimeout         int
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
		HealthWorkerSecret: secret,
		CORSOrigin:         getEnv("CORS_ORIGIN", "http://localhost:5173"),
		TTSCachePath:       getEnv("TTS_CACHE_PATH", "cache/tts"),
		TTSTimeout:         getEnvInt("TTS_TIMEOUT", 30),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return fallback
}
