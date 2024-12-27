package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/FaYMan2/terdel/handlers"
	"github.com/FaYMan2/terdel/middleware"
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
	router.Use(middleware.LoggingMiddleware)
	router.HandleFunc("/pg-version", app.GetPGversionHandler).Methods(http.MethodGet)
	router.HandleFunc("/table-names", app.GetTableNamesHandler).Methods(http.MethodGet)
	router.HandleFunc("/table-schema/{table-name}", app.GetTableSchemaHandler).Methods(http.MethodGet)
	router.HandleFunc("/constraints", app.GetDbConstraintsHandler).Methods(http.MethodGet)

	fmt.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
