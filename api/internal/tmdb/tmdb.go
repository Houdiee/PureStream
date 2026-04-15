package tmdb

import (
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/Houdiee/PureStream/api/internal/submission"
)

type TMDB struct {
	token      string
	baseURL    string
	httpClient *http.Client
}

func New() *TMDB {
	token, exists := os.LookupEnv("TMDB_READ_ACCESS_TOKEN")
	if !exists {
		log.Fatal("Failed to get TMDB token")
	}

	client := &http.Client{
		Timeout: 10 * time.Second,
		Transport: &http.Transport{
			MaxIdleConns:        100,
			IdleConnTimeout:     90 * time.Second,
			TLSHandshakeTimeout: 10 * time.Second,
		},
	}

	return &TMDB{
		token:      token,
		baseURL:    "https://api.themoviedb.org",
		httpClient: client,
	}
}

func (t *TMDB) NewProxy() *httputil.ReverseProxy {
	target, _ := url.Parse(t.baseURL)

	return &httputil.ReverseProxy{
		Transport: t.httpClient.Transport,
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetURL(target)
			r.Out.Host = target.Host
			r.Out.URL.Path = "/3/search/multi"
			r.Out.Header.Set("Authorization", "Bearer "+t.token)
		},
	}
}

func (t *TMDB) MediaExists(mediaID int, mediaType submission.MediaType) (bool, error) {
	fullURL := fmt.Sprintf("%s/3/%s/%d", t.baseURL, mediaType, mediaID)

	req, err := http.NewRequest(http.MethodGet, fullURL, nil)
	if err != nil {
		return false, err
	}
	req.Header.Set("Authorization", "Bearer "+t.token)

	resp, err := t.httpClient.Do(req)
	if err != nil {
		return false, err
	}
	defer resp.Body.Close()

	switch resp.StatusCode {
	case http.StatusOK:
		return true, nil
	case http.StatusNotFound:
		return false, nil
	default:
		return false, fmt.Errorf("Unexpected TMDB response: %d", resp.StatusCode)
	}
}
