package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	dbqueries "github.com/FaYMan2/terdel/DB_queries"
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

	version, err := dbqueries.GetPGversion(pool)
	if err != nil {
		log.Fatalf("Failed to get PostgreSQL version: %v", err)
	}
	log.Printf("PostgreSQL version: %s\n", version)

	tableNames, err := dbqueries.GetTableNames(pool)
	if err != nil {
		log.Fatalf("Could not get table names: %v", err)
	}
	for index, tableName := range tableNames {
		fmt.Printf("%d.\t%s\n", index+1, tableName)
	}

	fmt.Printf("\n")
	for _, tableName := range tableNames {
		var schemas []map[string]interface{}
		schemas, err := dbqueries.GetTableSchema(pool, tableName)
		if err != nil {
			log.Fatalf("Getting table schema for table : %s failed with err : %v", tableName, err)
		}
		schemaJSON, err := json.Marshal(schemas)
		if err != nil {
			log.Fatalf("error marshalling schema %v", err)
		}
		fmt.Printf("schema for table %s is \n%s\n", tableName, schemaJSON)
	}
	fmt.Printf("\n")
	contraints, err := dbqueries.GetConstraints(pool)
	if err != nil {
		log.Fatalf("getting contraints failed %v", err)
	}
	constraintsJSON, err := json.Marshal(contraints)
	if err != nil {
		log.Fatalf("JSON marshalling for contraints query failed %v", err)
	}
	fmt.Printf("contraits in db are : %s\n", constraintsJSON)
}
