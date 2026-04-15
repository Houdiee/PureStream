package service

import (
	"errors"

	"github.com/Houdiee/PureStream/api/internal/repository"
	"github.com/Houdiee/PureStream/api/internal/submission"
	"github.com/Houdiee/PureStream/api/internal/tmdb"
)

type SubmissionService struct {
	tmdb      *tmdb.TMDB
	mediaRepo *repository.MediaRepository
	sceneRepo *repository.SubmissionRepository
}

func NewSubmissionService(
	tmdb *tmdb.TMDB,
	mediaRepo *repository.MediaRepository,
	sceneRepo *repository.SubmissionRepository,
) *SubmissionService {
	return &SubmissionService{tmdb, mediaRepo, sceneRepo}
}

var ErrMediaNotFound = errors.New("Media not found")

func (self *SubmissionService) AddScene(mediaType submission.MediaType, mediaID int, req submission.AddSubmissionRequest) error {
	exists, err := self.tmdb.MediaExists(mediaID, mediaType)
	if err != nil {
		return err
	}
	if !exists {
		return ErrMediaNotFound
	}

	if err := self.mediaRepo.GetOrCreate(mediaID); err != nil {
		return err
	}
	return self.sceneRepo.Add(mediaID, req)
}

func (self *SubmissionService) GetSubmissionsByMediaID(mediaType submission.MediaType, mediaID int) ([]submission.Submission, error) {
	scenes, err := self.sceneRepo.GetSubmissionsByMediaID(mediaID)
	if err != nil {
		return nil, err
	}
	if len(scenes) > 0 {
		return scenes, nil
	}

	existsLocally, err := self.mediaRepo.Exists(mediaID)
	if err != nil {
		return nil, err
	}
	if existsLocally {
		return []submission.Submission{}, nil
	}

	existsOnTMDB, err := self.tmdb.MediaExists(mediaID, mediaType)
	if err != nil {
		return nil, err
	}
	if !existsOnTMDB {
		return nil, ErrMediaNotFound
	}

	_ = self.mediaRepo.GetOrCreate(mediaID)
	return []submission.Submission{}, nil
}
