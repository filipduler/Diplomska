package main

import (
	"api/internal/auth"
	"api/internal/timeentry"
	"api/internal/timeoff"
	"api/internal/user"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	e.Pre(middleware.RemoveTrailingSlash())
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))

	auth.RegisterAuthMiddleware(e)

	group := e.Group("/api")

	auth.NewHTTP(group)
	timeentry.NewHTTP(group)
	timeoff.NewHTTP(group)
	user.NewHTTP(group)

	e.Logger.Fatal(e.Start(":1323"))
}
