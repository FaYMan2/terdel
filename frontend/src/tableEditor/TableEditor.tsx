import { useParams } from "react-router"
import { TableSchema } from "@/types"
import { useEffect,useState } from "react"
import { GenerateTableSchema } from "@/SchemaDataFetcher"
import { GetTableData } from "./tableDataFetcher"

export default function TableEditor() {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
    const { tableName } = useParams();
    const [tableData, setTableData] = useState(null) 
    useEffect(() => {
      const dataGenerator = async () => {
        setLoading(true);
        const [tableSchemaData,tableRowData] = await Promise.all([GenerateTableSchema(tableName),GetTableData(tableName)])
        console.log(`Data fetched:`, tableSchemaData);
        setTableSchema(tableSchemaData);
        setTableData(tableRowData);
        setLoading(false);
      };
      dataGenerator();
    }, [tableName]);
  
    return (
      <div>
        {isLoading ? (
          <h1>Loading...</h1>
        ) : (
          <div>
            <h1>{tableName}</h1>
            {tableSchema && tableSchema.columns ? (
              <table style={{ width: "100%", textAlign: "left", border: "1px solid black" }}>
                <thead>
                  <tr>
                    {tableSchema.columns.map((column, index) => (
                      <th key={index}>{column.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.length > 0 ? (
                    tableData.map((row, index) => (
                      <tr key={index}>
                        {tableSchema.columns.map((column, colIndex) => (
                          <td key={colIndex}>{row[column.name]}</td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableSchema.columns.length}>No data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <h1>Error loading schema</h1>
            )}
          </div>
        )}
      </div>
    );
  }
