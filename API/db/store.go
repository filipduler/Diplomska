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
	DB *sqlx.DB
	tx *sql.Tx
}

func New() DBStore {
	return DBStore{
		DB: db,
		tx: nil,
	}
}

func (store *DBStore) StartTransaction() error {
	var err error
	store.tx, err = store.DB.Begin()
	return err
}

func (store *DBStore) Commit() error {
	if store.tx != nil {
		err := store.tx.Commit()
		store.tx = nil
		return err
	}
	return ErrNoActiveTransaction
}

func (store *DBStore) Rollback() error {
	if store.tx != nil {
		err := store.tx.Rollback()
		store.tx = nil
		return err
	}
	return ErrNoActiveTransaction
}

func (store *DBStore) Exec(query string, args ...any) (sql.Result, error) {
	if store.tx != nil {
		return store.tx.Exec(query, args...)
	}
	return store.DB.Exec(query, args...)
}
