package auth

import (
	"api/internal"
	"api/service/auth"
	user "api/service/user"
	"api/utils"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

const (
	contextKey = "authToken"
)

func RegisterAuthMiddleware(e *echo.Echo) {
	e.Use(middleware.JWTWithConfig(middleware.JWTConfig{
		SigningKey:  utils.GetConfig().JWT.Secret,
		TokenLookup: "header:" + echo.HeaderAuthorization,
		AuthScheme:  "Bearer",
		ContextKey:  contextKey,
		Claims:      &auth.JWTClaims{},
		Skipper:     skipper,
	}))
	e.Use(processUser)
}

func skipper(c echo.Context) bool {
	path := c.Request().URL.Path
	return strings.HasSuffix(path, "/login") || strings.HasSuffix(path, "/refresh")
}

func processUser(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		if !skipper(c) {
			userService := user.UserService{}

			token := c.Get(contextKey).(*jwt.Token)
			claims := token.Claims.(*auth.JWTClaims)

			user, err := userService.GetUserById(claims.UserId)
			if err != nil {
				return echo.NewHTTPError(http.StatusUnauthorized, "Please provide valid credentials")
			}

			c.Set(internal.UserKey, user)
		}

		if err := next(c); err != nil {
			c.Error(err)
		}
		return nil
	}
}
