package auth

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
