package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/Houdiee/PureStream/api/internal/submission"
)

func GetPathID(r *http.Request) (int, error) {
	idStr := r.PathValue("id")
	if idStr == "" {
		return 0, errors.New("User ID is required")
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		return 0, errors.New("Invalid User ID format")
	}
	return id, nil
}

func GetMediaType(r *http.Request) (submission.MediaType, error) {
	mediaTypeStr := r.PathValue("type")
	mediaType := submission.MediaType(mediaTypeStr)
	if mediaType != submission.MediaTypeMovie && mediaType != submission.MediaTypeTV {
		return "", errors.New("Invalid media type")
	}
	return mediaType, nil
}
