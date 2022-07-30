package auth

import (
	"github.com/golang-jwt/jwt"
)

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginResponse struct {
	Token   tokenModel `json:"token"`
	Refresh tokenModel `json:"refresh"`
}

type refreshRequest struct {
	Refresh string `json:"refresh"`
}

type refreshResponse struct {
	tokenModel
}

type tokenModel struct {
	Token  string `json:"token"`
	Expiry int64  `json:"expiry"`
}

type jwtClaims struct {
	UserId int64  `json:"userId"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	jwt.StandardClaims
}

type refreshClaims struct {
	UserId int64 `json:"userId"`
	jwt.StandardClaims
}

type tokenDTO struct {
	Token  string
	Expiry int64
}

type loginDTO struct {
	Token   tokenDTO
	Refresh tokenDTO
}
