package utils

import (
	"math"
	"strconv"
)

func ParseStrToInt64(s string) (int64, error) {
	return strconv.ParseInt(s, 10, 64)
}

func Int64ToStr(s int64) string {
	return strconv.FormatInt(s, 10)
}

func Round(num float64) int {
	return int(num + math.Copysign(0.5, num))
}

func ToFixed(num float64, precision int) float64 {
	output := math.Pow(10, float64(precision))
	return float64(Round(num*output)) / output
}
