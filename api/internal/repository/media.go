package repository

import "database/sql"

type MediaRepository struct {
	db *sql.DB
}

func NewMediaRepository(db *sql.DB) *MediaRepository {
	return &MediaRepository{db}
}

func (self *MediaRepository) GetOrCreate(mediaID int) error {
	_, err := self.db.Exec(`INSERT INTO media (id) VALUES (?) ON CONFLICT (id) DO NOTHING`, mediaID)
	return err
}

func (self *MediaRepository) Exists(mediaID int) (bool, error) {
	var exists bool
	err := self.db.QueryRow(`SELECT EXISTS (SELECT 1 FROM media WHERE id = ?)`, mediaID).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}
