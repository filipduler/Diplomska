package auth

import (
	"github.com/golang-jwt/jwt"
)

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type jwtClaims struct {
	UserId int64  `json:"userId"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	jwt.StandardClaims
}
