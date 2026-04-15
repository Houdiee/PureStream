package handler

import (
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/Houdiee/PureStream/api/internal/service"
	"github.com/Houdiee/PureStream/api/internal/submission"
)

type SubmissionHandler struct {
	service *service.SubmissionService
}

func NewSceneHandler(service *service.SubmissionService) *SubmissionHandler {
	return &SubmissionHandler{service}
}

func (self *SubmissionHandler) CreateMediaScene(w http.ResponseWriter, r *http.Request) {
	mediaID, err := GetPathID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mediaType, err := GetMediaType(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	var requestBody submission.AddSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	if err := self.service.AddScene(mediaType, mediaID, requestBody); err != nil {
		if errors.Is(err, service.ErrMediaNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		slog.Error("Failed to create media scene",
			"error", err,
			"media_id", mediaID,
			"media_type", mediaType,
		)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusCreated)
}

func (self *SubmissionHandler) GetSubmissionsByMediaID(w http.ResponseWriter, r *http.Request) {
	mediaID, err := GetPathID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	mediaType, err := GetMediaType(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	scenes, err := self.service.GetSubmissionsByMediaID(mediaType, mediaID)
	if err != nil {
		if errors.Is(err, service.ErrMediaNotFound) {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		slog.Error("Failed to get scenes by media ID",
			"error", err,
			"media_id", mediaID,
			"type", mediaType,
		)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(scenes); err != nil {
		slog.Error("Failed to stream JSON response",
			"error", err,
			"media_id", mediaID,
		)
		return
	}
}
