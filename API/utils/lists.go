package utils

func Map[IN any, OUT any](vs []IN, f func(IN) OUT) []OUT {
	vsm := make([]OUT, len(vs))
	for i, v := range vs {
		vsm[i] = f(v)
	}
	return vsm
}
