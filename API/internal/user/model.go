package user

type userModel struct {
	UserId          int64  `json:"userId"`
	DisplayName     string `json:"displayName"`
	Email           string `json:"email"`
	IsAdmin         bool   `json:"isAdmin"`
	IsImpersonating bool   `json:"isImpersonating"`
}

type userOptionModel struct {
	UserId int64  `json:"userId"`
	Name   string `json:"name"`
	Email  string `json:"email"`
}
