package auth

import (
	"api/api"
	"api/db"
	"api/utils"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const (
	contextKey = "authToken"
)

func GetJWTMiddleware() echo.MiddlewareFunc {
	return middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey:     utils.GetConfig().JWT.Secret,
		TokenLookup:    "header:token",
		AuthScheme:     "Bearer",
		ContextKey:     contextKey,
		Claims:         &jwtClaims{},
		Skipper:        skipper,
		SuccessHandler: successHandler,
	})
}

func skipper(c echo.Context) bool {
	path := c.Request().URL.Path
	return strings.HasSuffix(path, "/login") || strings.HasSuffix(path, "/refresh")
}

func successHandler(c echo.Context) {
	store := db.New()

	token := c.Get(contextKey).(*jwt.Token)
	claims := token.Claims.(*jwtClaims)

	user, err := store.User.GetById(claims.UserId)
	if err == nil {
		c.Set(api.UserKey, user)
	}
}
