package domain

type UserModel struct {
	BaseModel
	DisplayName    string  `gorm:"column:DisplayName"`
	Email          string  `gorm:"column:Email"`
	PasswordHash   string  `gorm:"column:PasswordHash"`
	DailyWorkHours float32 `gorm:"column:DailyWorkHours"`
	IsActive       bool    `gorm:"column:IsActive"`
	IsAdmin        bool    `gorm:"column:IsAdmin"`
}

func (UserModel) TableName() string {
	return "user"
}
