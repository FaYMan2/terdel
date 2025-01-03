package handlers

import (
	"encoding/json"
	"net/http"

	dbqueries "github.com/FaYMan2/terdel/DB_queries"
	"github.com/FaYMan2/terdel/utils"
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

func (a *App) GetTableDataHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	tableName := vars["table-name"]
	if tableName == "" {
		http.Error(w, "table name is required", http.StatusBadRequest)
		return
	}
	tableData, err := dbqueries.GetTableData(a.Pool, tableName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{"data": tableData}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}

func (a *App) InsertIntoTableHandler(w http.ResponseWriter, r *http.Request) {
	// Get table name from the URL variables
	vars := mux.Vars(r)
	tableName := vars["table-name"]
	if tableName == "" {
		http.Error(w, "table name is required", http.StatusBadRequest)
		return
	}

	// Parse the JSON body
	var data map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil {
		http.Error(w, "invalid JSON body", http.StatusBadRequest)
		return
	}
	defer r.Body.Close()

	// Validate if data is present
	if len(data) == 0 {
		http.Error(w, "request body cannot be empty", http.StatusBadRequest)
		return
	}

	err := dbqueries.InsertIntoTable(a.Pool, tableName, data)
	if err != nil {
		sqlError := utils.ParseSQLError(err)
		response := map[string]string{
			"error":   "failed to insert row",
			"details": sqlError,
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Respond with success
	response := map[string]string{"message": "row inserted successfully"}
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "failed to encode response", http.StatusInternalServerError)
	}
}
