package db

import (
	"api/utils"
	"database/sql"
	"errors"

	_ "github.com/go-sql-driver/mysql"
	"github.com/jmoiron/sqlx"
)

var (
	ErrNoActiveTransaction = errors.New("no active transaction")
)

var (
	db *sqlx.DB
)

func init() {
	db = sqlx.MustOpen("mysql", utils.GetConfig().ConnectionString)
}

type DBStore struct {
	*store
	User         userTable
	TimeEntry    timeEntryTable
	TimeEntryLog timeEntryLogTable
	TimeOff      timeOffTable
	TimeOffType  timeOffTypeTable
	TimeOffLog   timeOffLogTable
}

type store struct {
	db *sqlx.DB
	tx *sqlx.Tx
}

func New() DBStore {
	store := store{
		db: db,
		tx: nil,
	}

	return DBStore{
		store:        &store,
		User:         userTable{&store},
		TimeEntry:    timeEntryTable{&store},
		TimeEntryLog: timeEntryLogTable{&store},
		TimeOff:      timeOffTable{&store},
		TimeOffType:  timeOffTypeTable{&store},
		TimeOffLog:   timeOffLogTable{&store},
	}
}

func (store *store) Transact(txFunc func() error) (err error) {
	tx, err := store.db.Beginx()
	if err != nil {
		return
	}
	store.tx = tx

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			store.tx = nil
			panic(p) // re-throw panic after Rollback
		} else if err != nil {
			tx.Rollback() // err is non-nil; don't change it
			store.tx = nil
		} else {
			err = tx.Commit() // err is nil; if Commit returns error update err
			store.tx = nil
		}
	}()

	err = txFunc()
	return err
}

func (store *store) Exec(query string, args ...any) (sql.Result, error) {
	if store.tx != nil {
		return store.tx.Exec(query, args...)
	}
	return store.db.Exec(query, args...)
}
