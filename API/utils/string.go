package utils

import "strings"

func NormalizeDown(str string) string {
	return strings.ToLower(strings.TrimSpace(str))
}

func Substring(input string, start int, length int) string {
	asRunes := []rune(input)

	if start >= len(asRunes) {
		return ""
	}

	if start+length > len(asRunes) {
		length = len(asRunes) - start
	}

	return string(asRunes[start : start+length])
}
