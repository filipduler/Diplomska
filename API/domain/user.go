package domain

import "github.com/samber/lo"

type UserModel struct {
	BaseModel
	DisplayName        string  `gorm:"column:DisplayName"`
	Email              string  `gorm:"column:Email"`
	PasswordHash       string  `gorm:"column:PasswordHash"`
	DailyWorkHours     float64 `gorm:"column:DailyWorkHours"`
	VacationDays       int     `gorm:"column:VacationDays"`
	ImpersonatedUserId *int64  `gorm:"column:ImpersonatedUserId"`
	IsAdmin            bool    `gorm:"column:IsAdmin"`

	ImpersonatedUser *UserModel `gorm:"foreignKey:ImpersonatedUserId"`
}

func (UserModel) TableName() string {
	return "user"
}

func (m *UserModel) IsImpersonating() bool {
	return m.ImpersonatedUserId != nil
}

func (m *UserModel) EffectiveUserId() int64 {
	return lo.FromPtrOr(m.ImpersonatedUserId, m.Id)
}

func (m *UserModel) EffectiveVacationHours() int {
	if m.IsImpersonating() {
		return m.ImpersonatedUser.VacationDays
	}
	return m.VacationDays
}
