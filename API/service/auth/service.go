package auth

import (
	"api/domain"
	"api/service/user"
	"api/utils"
	"errors"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct{}

var (
	ErrInvalidToken = errors.New("expired on invalid token")
)

func (s *AuthService) LoginUser(email string, password string) (*loginDTO, error) {
	userService := user.UserService{}
	normalizedEmail := utils.NormalizeDown(email)

	user, err := userService.GetUserByEmail(normalizedEmail)
	if err != nil {
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, err
	}

	return generateLoginTokens(user)
}

func (s *AuthService) RefreshUser(refreshToken string) (*tokenDTO, error) {
	userService := user.UserService{}

	token, err := jwt.ParseWithClaims(refreshToken, &refreshClaims{}, func(t *jwt.Token) (interface{}, error) {
		if t.Method.Alg() != "HS256" {
			return nil, fmt.Errorf("unexpected jwt signing method=%v", t.Header["alg"])
		}
		return utils.GetConfig().JWT.Secret, nil
	})
	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, ErrInvalidToken
	}

	claims := token.Claims.(*refreshClaims)

	user, err := userService.GetUserById(claims.UserId)
	if err != nil {
		return nil, err
	}

	return generateLoginToken(user)
}

func generateRefreshToken(user *domain.UserModel) (*tokenDTO, error) {
	secret := utils.GetConfig().JWT.Secret
	expiry := time.Now().Add(utils.GetConfig().JWT.RefreshExpiryMinutes).Unix()

	refreshClaims := &refreshClaims{
		user.Id,
		jwt.StandardClaims{
			ExpiresAt: time.Now().Add(utils.GetConfig().JWT.RefreshExpiryMinutes).Unix(),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	encodedToken, err := token.SignedString(secret)
	if err != nil {
		return nil, err
	}

	return &tokenDTO{
		Token:  encodedToken,
		Expiry: expiry,
	}, nil
}

func generateLoginToken(user *domain.UserModel) (*tokenDTO, error) {
	secret := utils.GetConfig().JWT.Secret
	expiry := time.Now().Add(utils.GetConfig().JWT.TokenExpiryMinutes).Unix()

	claims := &JWTClaims{
		user.Id,
		user.Email,
		jwt.StandardClaims{
			ExpiresAt: expiry,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	encodedToken, err := token.SignedString(secret)
	if err != nil {
		return nil, err
	}

	return &tokenDTO{
		Token:  encodedToken,
		Expiry: expiry,
	}, nil
}

func generateLoginTokens(user *domain.UserModel) (*loginDTO, error) {
	login, err := generateLoginToken(user)
	if err != nil {
		return nil, err
	}

	refresh, err := generateRefreshToken(user)
	if err != nil {
		return nil, err
	}

	return &loginDTO{
		Token:   *login,
		Refresh: *refresh,
	}, nil
}
