package config

import "os"

type Config struct {
	JWTSecret string
	Port      string
	DBPath    string
}

func Load() *Config {
	return &Config{
		JWTSecret: getEnv("JWT_SECRET", "pulso-secret-key"),
		Port:      getEnv("PORT", ":8080"),
		DBPath:    getEnv("DB_PATH", "pulso.db"),
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
