package handlers

import (
	"encoding/json"
	"net/http"

	dbqueries "github.com/FaYMan2/terdel/DB_queries"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
)

type App struct {
	Pool *pgxpool.Pool
}

func (a *App) GetPGversionHandler(w http.ResponseWriter, r *http.Request) {
	version, err := dbqueries.GetPGversion(a.Pool)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]string{"version": version}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (a *App) GetTableNamesHandler(w http.ResponseWriter, r *http.Request) {
	tableNames, err := dbqueries.GetTableNames(a.Pool)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string][]string{"table_names": tableNames}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (a *App) GetTableSchemaHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tableName := vars["table-name"]
	tableSchema, err := dbqueries.GetTableSchema(a.Pool, tableName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{"table_schema": tableSchema}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (a *App) GetDbConstraintsHandler(w http.ResponseWriter, r *http.Request) {
	cosntraints, err := dbqueries.GetConstraints(a.Pool)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{"constraints": cosntraints}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
