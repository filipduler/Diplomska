package utils

import "strings"

func NormalizeDown(str string) string {
	return strings.ToLower(strings.TrimSpace(str))
}
