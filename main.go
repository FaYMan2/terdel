package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/FaYMan2/terdel/handlers"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found, continuing with environment variables...")
	}

	PG_URL := os.Getenv("DATABASE_URL")
	if PG_URL == "" {
		log.Fatal("DATABASE_URL environment variable is not set")
	}

	pool, err := pgxpool.New(context.Background(), PG_URL)
	if err != nil {
		log.Fatalf("Failed to create connection pool: %v", err)
	}
	defer pool.Close()
	app := &handlers.App{Pool: pool}

	router := mux.NewRouter()
	router.HandleFunc("/pg-version", logRequest(app.GetPGversionHandler)).Methods(http.MethodGet)
	router.HandleFunc("/table-names", logRequest(app.GetTableNamesHandler)).Methods(http.MethodGet)
	router.HandleFunc("/table-schema/{table-name}", logRequest(app.GetTableSchemaHandler)).Methods(http.MethodGet)
	router.HandleFunc("/constraints", logRequest(app.GetDbConstraintsHandler)).Methods(http.MethodGet)

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}

func logRequest(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		log.Printf("Request: %s %s", r.Method, r.URL.Path)
		responseWriter := &loggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}
		handler(responseWriter, r)
		log.Printf("Response: %d %s", responseWriter.statusCode, r.URL.Path)
	}
}

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}
