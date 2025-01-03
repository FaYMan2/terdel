package utils

import (
	"errors"
	"fmt"

	"github.com/jackc/pgconn"
)

func ParseSQLError(err error) string {
	var pgError *pgconn.PgError
	if errors.As(err, &pgError) {
		return fmt.Sprintf(
			"SQL Error: %s (Code: %s, Detail: %s, Hint: %s)",
			pgError.Message,
			pgError.Code,
			pgError.Detail,
			pgError.Hint,
		)
	}
	return "an unexpected error occurred"
}
