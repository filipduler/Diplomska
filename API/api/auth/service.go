package auth

import (
	"api/db"
	"api/utils"
	"time"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

func loginUser(email string, password string) (string, error) {
	dbStore := db.New()

	normalizedEmail := utils.NormalizeDown(email)

	user, err := dbStore.User.GetByEmail(normalizedEmail)
	if err != nil {
		return "", err
	}

	if err := bcrypt.CompareHashAndPassword(user.PasswordHash, []byte(password)); err != nil {
		return "", err
	}

	// Set custom claims
	claims := &jwtClaims{
		user.Id,
		user.DisplayName,
		user.Email,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(utils.GetConfig().JWT.TokenExpiryMinutes).Unix(),
		},
	}

	// Create token with claims
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	return token.SignedString(utils.GetConfig().JWT.Secret)
}
