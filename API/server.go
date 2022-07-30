package main

import (
	"api/api/auth"
	"api/api/entry"
	"api/api/timeoff"

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
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization, "token"},
		AllowMethods: []string{echo.GET, echo.HEAD, echo.PUT, echo.PATCH, echo.POST, echo.DELETE},
	}))
	e.Use(auth.GetJWTMiddleware())

	group := e.Group("/api")

	auth.NewHTTP(group)
	entry.NewHTTP(group)
	timeoff.NewHTTP(group)

	e.Logger.Fatal(e.Start(":1323"))
}
