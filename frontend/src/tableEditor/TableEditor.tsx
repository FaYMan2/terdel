import { useParams } from "react-router"
import { TableSchema } from "@/types"
import { useEffect,useState } from "react"
import { GenerateTableSchema } from "@/tableDataGenerator"

export default function TableEditor() {
    const [isLoading, setLoading] = useState<boolean>(true);
    const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
    const { tableName } = useParams();
  
    useEffect(() => {
      const dataGenerator = async () => {
        setLoading(true);
        const data = await GenerateTableSchema(tableName);
        console.log(`Data fetched:`, data);
        setTableSchema(data);
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
              tableSchema.columns.map((column, index) => (
                <h1 key={index}>{column.name}</h1>
              ))
            ) : (
              <h1>Error</h1>
            )}
          </div>
        )}
      </div>
    );
  }
