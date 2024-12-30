import { TableSchema } from "./types";

export default async function TableDataGenerator() : Promise<TableSchema[]> {
    try {
      const [tableNames, constraints] = await Promise.all([GetTableNames(), GetConstraints()]);
  
      if (!tableNames || tableNames.length === 0) {
        console.error("No table names found.");
        return [];
      }
  
      const tableSchemas = await Promise.all(
        tableNames.map((tableName) => GetTableSchema(tableName, constraints))
      );
  
      return tableSchemas.filter((schema) => schema !== null);
    } catch (error) {
      console.error("Error generating table data:", error);
      return [];
    }
  }
  

async function GetTableNames(): Promise<string[]> {
    try {
        const response = await fetch(`http://localhost:8080/table-names`);
            if (response.ok) {
            const data = await response.json();
            return data.table_names;
        } else {
            console.error(`Failed to fetch table names. Status: ${response.status}`);
        }
    } catch (e) {
        console.error("Fetching table names failed: " + e);
    }
    return []; 
}

async function GetTableSchema(tableName: string, constraints: any[]): Promise<TableSchema | null> {
    try {
      const response = await fetch(`http://localhost:8080/table-schema/${tableName}`);
      if (response.ok) {
        const data = await response.json();
  
        const tableConstraints = constraints.filter(
          (constraint) => constraint.sourceTable === tableName
        );
  
        const transformedData = {
          name: tableName,
          columns: data.table_schema.map((column: any) => {
            const primaryConstraint = tableConstraints.find(
              (constraint) =>
                constraint.constraintType === "p" && constraint.sourceColumn === column.column_name
            );
  
            const foreignKeyConstraint = tableConstraints.find(
              (constraint) =>
                constraint.constraintType === "f" && constraint.sourceColumn === column.column_name
            );
  
            return {
              name: column.column_name,
              type: column.data_type,
              isPrimary: !!primaryConstraint,
              isIdentity: column.default_value?.includes("nextval") || false,
              isNullable: column.is_nullable,
              isUnique: false, 
              isForeignKey: !!foreignKeyConstraint,
              targetTable: foreignKeyConstraint?.targetTable || null,
              targetColumn: foreignKeyConstraint?.targetColumn || null,
            };
          }),
        };
  
        return transformedData;
      } else {
        console.error(`Failed to fetch table schema for ${tableName}. Status: ${response.status}`);
      }
    } catch (e) {
      console.error("Fetching table schema failed: " + e);
    }
    return null;
  }
  

async function GetConstraints() : Promise<any> {
    try {
        const response = await fetch(`http://localhost:8080/constraints`)
        if (response.ok){
            const data = await response.json()
            return data.constraints
        } else {
            console.error(`Failed to fetch constraints. Status: ${response.status}`);
        }
    }
    catch (e) {
      console.error("Fetching constraints failed : " + e);
    }
    return null;
}


export async function GenerateTableSchema(tableName : string) : Promise<TableSchema | null> {
  try {
    const contrainsts = await GetConstraints()
    const tableSchema = await GetTableSchema(tableName,contrainsts)
    return tableSchema
  }
  catch (e) {
    console.error("Fetching Table schema failed : " + e);
  }
  return null
}