package main

import (
	"database/sql"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/Houdiee/PureStream/api/internal/handler"
	"github.com/Houdiee/PureStream/api/internal/repository"
	"github.com/Houdiee/PureStream/api/internal/service"
	"github.com/Houdiee/PureStream/api/internal/submission"
	"github.com/Houdiee/PureStream/api/internal/tmdb"

	"github.com/joho/godotenv"
	_ "github.com/mattn/go-sqlite3"
)

func InitDatabase(driverName string, connectionString string) *sql.DB {
	db, err := sql.Open(driverName, connectionString)
	if err != nil {
		slog.Error("Failed to open database", "error", err)
		os.Exit(1)
	}

	db.SetMaxOpenConns(1)
	db.SetMaxIdleConns(1)
	db.SetConnMaxLifetime(time.Hour)

	if err := repository.InitSchema(db); err != nil {
		slog.Error("Failed to initialise database schema", "error", err)
		os.Exit(1)
	}
	return db
}

func SeedSubmissionData(service *service.SubmissionService) {
	mediaType := submission.MediaType(submission.MediaTypeTV)
	mediaID := 95557
	Season := 4
	Episode := 1

	submissions := []submission.AddSubmissionRequest{
		{
			Severity: submission.SeverityModerate,
			Start:    10.0,
			End:      15,
			Season:   &Season,
			Episode:  &Episode,
			IsReport: false,
		},
		{
			Severity: submission.SeverityMild,
			Start:    11.2,
			End:      17,
			Season:   &Season,
			Episode:  &Episode,
			IsReport: false,
		},
		{
			Severity: submission.SeveritySevere,
			Start:    11,
			End:      13,
			Season:   &Season,
			Episode:  &Episode,
			IsReport: false,
		},
	}

	for _, submission := range submissions {
		if err := service.AddScene(mediaType, mediaID, submission); err != nil {
			slog.Error("Failed to seed scene data", "error", err)
		}
	}
}

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
		Level:     slog.LevelInfo,
		AddSource: true,
	}))
	slog.SetDefault(logger)

	if err := godotenv.Load(); err != nil {
		logger.Error("Failed to load .env file", "error", err)
		os.Exit(1)
	}

	db := InitDatabase("sqlite3", "./db/database.sqlite"+"?_journal_mode=WAL&_synchronous=NORMAL&_busy_timeout=5000&_foreign_keys=ON")
	defer db.Close()

	tmdb := tmdb.New()
	submissionRepo := repository.NewSubmissionRepository(db)
	mediaRepo := repository.NewMediaRepository(db)
	submissionService := service.NewSubmissionService(tmdb, mediaRepo, submissionRepo)
	sceneHandler := handler.NewSceneHandler(submissionService)

	SeedSubmissionData(submissionService)

	mux := http.NewServeMux()
	mux.Handle("/search/", http.StripPrefix("/search", tmdb.NewProxy()))
	mux.HandleFunc("POST /media/{type}/{id}/submissions", sceneHandler.CreateMediaScene)
	mux.HandleFunc("GET /media/{type}/{id}/submissions", sceneHandler.GetSubmissionsByMediaID)
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	slog.Info("Running server...")
	if err := server.ListenAndServe(); err != nil {
		slog.Error("Failed to start server", "error", err)
		os.Exit(1)
	}
}
