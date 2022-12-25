package timeentry

import "github.com/golang-jwt/jwt"

type JWTClaims struct {
	UserId int64  `json:"userId"`
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
