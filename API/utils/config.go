package utils

import (
	"log"
	"os"
	"strconv"
	"time"

	"github.com/joho/godotenv"
)

type jwtConfig struct {
	Secret               []byte
	TokenExpiryMinutes   time.Duration
	RefreshExpiryMinutes time.Duration
}

type environmentConfig struct {
	ConnectionString string
	JWT              jwtConfig
}

var (
	config environmentConfig
)

func init() {
	e := godotenv.Load(".env")
	if e != nil {
		log.Fatalf("Error loading .env file")
	}

	config = environmentConfig{
		ConnectionString: mustParseString("CONNECTION_STRING"),
		JWT: jwtConfig{
			Secret:               []byte(mustParseString("JWT_SECRET")),
			TokenExpiryMinutes:   time.Duration(mustParseInt("JWT_TOKEN_EXPIRY_MINUTES")) * time.Minute,
			RefreshExpiryMinutes: time.Duration(mustParseInt("JWT_REFRESH_EXPIRY_MINUTES")) * time.Minute,
		},
	}
}

func mustParseInt(key string) int {
	value, err := strconv.Atoi(os.Getenv(key))
	if err != nil {
		log.Fatalf("%s CANNOT BE UNDEFINED", key)
	}
	return value
}

func mustParseString(key string) string {
	value := os.Getenv(key)
	if len(value) == 0 {
		log.Fatalf("%s CANNOT BE UNDEFINED", key)
	}
	return value
}

func GetConfig() *environmentConfig {
	return &config
}
