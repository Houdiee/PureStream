package repository

import (
	"database/sql"

	"github.com/Houdiee/PureStream/api/internal/submission"
)

type SubmissionRepository struct {
	db *sql.DB
}

func NewSubmissionRepository(db *sql.DB) *SubmissionRepository {
	return &SubmissionRepository{db}
}

func (self *SubmissionRepository) Add(mediaID int, scene submission.AddSubmissionRequest) error {
	_, err := self.db.Exec(`
		INSERT INTO submissions (media_id, severity, start, end, season, episode, is_report) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		mediaID, scene.Severity, scene.Start, scene.End, scene.Season, scene.Episode, scene.IsReport,
	)
	return err
}

func (self *SubmissionRepository) GetSubmissionsByMediaID(mediaID int) ([]submission.Submission, error) {
	rows, err := self.db.Query(`
		SELECT id, media_id, severity, start, end, season, episode, is_report 
		FROM submissions
		WHERE media_id = ?`,
		mediaID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	scenes := []submission.Submission{}
	for rows.Next() {
		var s submission.Submission
		err := rows.Scan(
			&s.ID,
			&s.MediaID,
			&s.Severity,
			&s.Start,
			&s.End,
			&s.Season,
			&s.Episode,
			&s.IsReport,
		)
		if err != nil {
			return nil, err
		}
		scenes = append(scenes, s)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return scenes, nil
}
