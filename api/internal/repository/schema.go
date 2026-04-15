package repository

import "database/sql"

const schema = `
	CREATE TABLE IF NOT EXISTS media (
		id INTEGER PRIMARY KEY
	);

	CREATE TABLE IF NOT EXISTS submissions (
		id          INTEGER PRIMARY KEY AUTOINCREMENT,
		media_id    INTEGER NOT NULL REFERENCES media(id),
		severity    INTEGER NOT NULL,
		start       REAL NOT NULL,
		end         REAL NOT NULL,
		season      INTEGER,
		episode     INTEGER,
		is_report   BOOLEAN NOT NULL
	);
`

func InitSchema(db *sql.DB) error {
	_, err := db.Exec(schema)
	return err
}
