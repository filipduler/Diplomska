package domain

import "github.com/samber/lo"

type UserModel struct {
	BaseModel
	DisplayName        string  `gorm:"column:DisplayName"`
	Email              string  `gorm:"column:Email"`
	PasswordHash       string  `gorm:"column:PasswordHash"`
	DailyWorkHours     float32 `gorm:"column:DailyWorkHours"`
	ImpersonatedUserId *int64  `gorm:"column:ImpersonatedUserId"`
	IsAdmin            bool    `gorm:"column:IsAdmin"`
}

func (UserModel) TableName() string {
	return "user"
}

func (m *UserModel) EffectiveUserId() int64 {
	return lo.FromPtrOr(m.ImpersonatedUserId, m.Id)
}
