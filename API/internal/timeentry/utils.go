package timeentry

import (
	"api/domain"
	"time"

	"github.com/samber/lo"
)

func aggregateEffectiveDuration(entries []domain.TimeEntryModel) time.Duration {
	return lo.SumBy(entries, func(entry domain.TimeEntryModel) time.Duration {
		return entry.EffectiveSeconds()
	})
}
