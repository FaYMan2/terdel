package dbqueries

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

func GetTableNames(pool *pgxpool.Pool) ([]string, error) {
	if pool == nil {
		return nil, errors.New("connection pool is not initialized")
	}

	query := `
		SELECT tablename
		FROM pg_tables
		WHERE schemaname = 'public';
	`

	conn, err := pool.Acquire(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to acquire connection from pool: %w", err)
	}
	defer conn.Release()

	rows, err := conn.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query for table names: %w", err)
	}
	defer rows.Close()

	var tableNames []string
	for rows.Next() {
		var tablename string
		if err := rows.Scan(&tablename); err != nil {
			return nil, fmt.Errorf("error scanning table name: %w", err)
		}
		tableNames = append(tableNames, tablename)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over rows: %w", err)
	}

	if len(tableNames) == 0 {
		return nil, errors.New("no tables found in the public schema")
	}

	return tableNames, nil
}

func GetPGversion(pool *pgxpool.Pool) (string, error) {
	if pool == nil {
		return "", errors.New("connection pool is not initialized")
	}

	conn, err := pool.Acquire(context.Background())
	if err != nil {
		return "", fmt.Errorf("failed to acquire connection from pool: %w", err)
	}
	defer conn.Release()

	var version string
	err = conn.QueryRow(context.Background(), "SELECT version()").Scan(&version)
	if err != nil {
		return "", fmt.Errorf("query failed: %w", err)
	}

	return version, nil
}

func GetTableSchema(pool *pgxpool.Pool, tableName string) ([]map[string]interface{}, error) {
	if pool == nil {
		return nil, errors.New("connection pool is not initialized")
	}

	query := `
		SELECT 
			a.attname AS column_name,
			pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
			a.attnotnull AS is_nullable,
			a.attnum AS column_order,
			pg_catalog.pg_get_expr(d.adbin, d.adrelid) AS default_value
		FROM 
			pg_attribute a
		LEFT JOIN
			pg_attrdef d ON a.attnum = d.adnum AND a.attrelid = d.adrelid
		WHERE 
			a.attrelid = $1::regclass
			AND a.attnum > 0
			AND NOT a.attisdropped
		ORDER BY 
			a.attnum;
	`

	conn, err := pool.Acquire(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to acquire connection from pool: %w", err)
	}
	defer conn.Release()

	rows, err := conn.Query(context.Background(), query, tableName)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	var schema []map[string]interface{}
	for rows.Next() {
		var columnName, dataType, defaultValue *string
		var isNullable bool
		var columnOrder int

		err := rows.Scan(&columnName, &dataType, &isNullable, &columnOrder, &defaultValue)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}

		schema = append(schema, map[string]interface{}{
			"column_name":   columnName,
			"data_type":     dataType,
			"is_nullable":   !isNullable,
			"column_order":  columnOrder,
			"default_value": defaultValue,
		})
	}

	if rows.Err() != nil {
		return nil, fmt.Errorf("error iterating over rows: %w", rows.Err())
	}

	return schema, nil
}

func GetConstraints(pool *pgxpool.Pool) ([]map[string]interface{}, error) {
	if pool == nil {
		return nil, errors.New("connection pool is not initialized")
	}

	conn, err := pool.Acquire(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to acquire connection from pool: %w", err)
	}
	defer conn.Release()

	query := `
        SELECT
            c.conname AS constraint_name,
            rel_t1.relname AS source_table,
            a1.attname AS source_column,
            rel_t2.relname AS target_table,
            a2.attname AS target_column,
            c.contype AS constraint_type
        FROM
            pg_constraint c
        JOIN
            pg_class rel_t1 ON c.conrelid = rel_t1.oid
        JOIN
            pg_namespace n1 ON rel_t1.relnamespace = n1.oid
        LEFT JOIN
            pg_class rel_t2 ON c.confrelid = rel_t2.oid
        LEFT JOIN
            pg_namespace n2 ON rel_t2.relnamespace = n2.oid
        LEFT JOIN
            pg_attribute a1 ON a1.attrelid = rel_t1.oid AND a1.attnum = ANY (c.conkey)
        LEFT JOIN
            pg_attribute a2 ON a2.attrelid = rel_t2.oid AND a2.attnum = ANY (c.confkey)
        WHERE
            n1.nspname = 'public'
            AND (n2.nspname IS NULL OR n2.nspname = 'public');
    `

	rows, err := conn.Query(context.Background(), query)
	if err != nil {
		return nil, fmt.Errorf("failed to execute query: %w", err)
	}
	defer rows.Close()

	var constraints []map[string]interface{}
	for rows.Next() {
		var constraintName, sourceTable, sourceColumn, targetTable, targetColumn *string
		var constraintType byte
		err := rows.Scan(&constraintName, &sourceTable, &sourceColumn, &targetTable, &targetColumn, &constraintType)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		constraints = append(constraints, map[string]interface{}{
			"constraintName": constraintName,
			"sourceTable":    sourceTable,
			"sourceColumn":   sourceColumn,
			"targetTable":    targetTable,
			"targetColumn":   targetColumn,
			"constraintType": string(constraintType),
		})
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating rows: %w", err)
	}

	return constraints, nil
}
