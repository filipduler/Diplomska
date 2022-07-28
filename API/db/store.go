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
	User         UserTable
	TimeEntry    TimeEntryTable
	TimeEntryLog TimeEntryLogTable
}

type store struct {
	DB *sqlx.DB
	tx *sql.Tx
}

func New() DBStore {
	store := store{
		DB: db,
		tx: nil,
	}

	return DBStore{
		store:        &store,
		User:         UserTable{&store},
		TimeEntry:    TimeEntryTable{&store},
		TimeEntryLog: TimeEntryLogTable{&store},
	}
}

func (store *store) StartTransaction() error {
	var err error
	store.tx, err = store.DB.Begin()
	return err
}

func (store *store) Commit() error {
	if store.tx != nil {
		err := store.tx.Commit()
		store.tx = nil
		return err
	}
	return ErrNoActiveTransaction
}

func (store *store) Rollback() error {
	if store.tx != nil {
		err := store.tx.Rollback()
		store.tx = nil
		return err
	}
	return ErrNoActiveTransaction
}

func (store *store) Exec(query string, args ...any) (sql.Result, error) {
	if store.tx != nil {
		return store.tx.Exec(query, args...)
	}
	return store.DB.Exec(query, args...)
}
