package submission

type MediaType string

const (
	MediaTypeMovie = "movie"
	MediaTypeTV    = "tv"
)

type Severity int

const (
	SeverityMild     Severity = 1
	SeverityModerate Severity = 2
	SeveritySevere   Severity = 3
)

type Submission struct {
	ID       int      `json:"id"`
	MediaID  int      `json:"mediaID"`
	Severity Severity `json:"severity"`
	Start    float64  `json:"start"`
	End      float64  `json:"end"`
	Season   *int     `json:"season,omitempty"`
	Episode  *int     `json:"episode,omitempty"`
	IsReport bool     `json:"isReport"`
}

type AddSubmissionRequest struct {
	Severity Severity `json:"severity"`
	Start    float64  `json:"start"`
	End      float64  `json:"end"`
	Season   *int     `json:"season,omitempty"`
	Episode  *int     `json:"episode,omitempty"`
	IsReport bool     `json:"isReport"`
}
