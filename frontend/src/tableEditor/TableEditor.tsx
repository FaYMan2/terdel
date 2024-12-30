import { useParams } from "react-router";
import { TableSchema } from "@/types";
import { useEffect, useState } from "react";
import { GenerateTableSchema } from "@/SchemaDataFetcher";
import { GetTableData } from "./tableDataFetcher";
import { KeyRound, Hash, Fingerprint, Circle, Diamond } from "lucide-react";

export default function TableEditor() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const { tableName } = useParams();
  const [tableData, setTableData] = useState(null);

  useEffect(() => {
    const dataGenerator = async () => {
      setLoading(true);
      const [tableSchemaData, tableRowData] = await Promise.all([
        GenerateTableSchema(tableName),
        GetTableData(tableName),
      ]);
      console.log(`Data fetched:`, tableSchemaData);
      setTableSchema(tableSchemaData);
      setTableData(tableRowData);
      setLoading(false);
    };
    dataGenerator();
  }, [tableName]);

  const renderColumnIcon = (column: Column) => (
    <div className="flex items-center gap-1">
      {column.isPrimary && <KeyRound className="h-4 w-4" title="Primary Key" />}
      {column.isIdentity && <Hash className="h-4 w-4" title="Identity" />}
      {column.isUnique && <Fingerprint className="h-4 w-4" title="Unique" />}
      {column.isNullable ? (
        <Circle className="h-4 w-4" title="Nullable" />
      ) : (
        <Diamond className="h-4 w-4" title="Non-Nullable" />
      )}
      {column.isForeignKey && (
        <Hash
          className="h-4 w-4"
          title={`Foreign Key (${column.targetTable}.${column.targetColumn})`}
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-900 text-white py-8 w-screen">
      <h1 className="text-3xl font-bold mb-6">{tableName}</h1>
      {isLoading ? (
        <h1 className="text-xl font-bold">Loading...</h1>
      ) : (
        <div className="overflow-x-auto bg-gray-800 text-white rounded-md shadow-md w-3/4">
         <table className="w-full table-auto border-collapse text-center">
            <thead className="bg-gray-700">
              <tr>
              {tableSchema?.columns.map((column, index) => (
                <th
                  key={index}
                  className="px-4 py-2 font-semibold border-b border-gray-600 text-center"
                >
                  <div className="flex justify-center items-center gap-1">
                    < span>{column.name}</span>
                    {renderColumnIcon(column)}
                  </div>
                </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`hover:bg-gray-700 ${
                    rowIndex % 2 === 0 ? "bg-gray-800" : "bg-gray-900"
                  }`}
                >
                  {tableSchema?.columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-4 py-2 border-b border-gray-600 text-center align-middle"
                    >
                      {column.type.toLowerCase() === "json"
                        ? JSON.stringify(row[column.name] ?? "NULL")
                        : row[column.name] ?? "NULL"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
         </table>  
        </div>
      )}
    </div>
  );
}
