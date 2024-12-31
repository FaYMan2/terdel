import { useParams } from "react-router";
import { TableSchema } from "@/types";
import { useEffect, useState } from "react";
import { GenerateTableSchema } from "@/SchemaDataFetcher";
import { GetTableData } from "./tableDataFetcher";
import { SchemaLegend } from "@/components/SchemaLegend";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

  return (
    <div className="flex flex-col items-center min-h-screen py-8 w-screen">
      <h1 className="text-3xl font-bold mb-6 text-black">{tableName}</h1>
      {isLoading ? (
        <h1 className="text-xl font-bold text-black">Loading...</h1>
      ) : (
        <div className="w-3/4">
          <Table>
            <TableCaption>A preview of the {tableName} table.</TableCaption>
            <TableHeader>
              <TableRow>
                {tableSchema?.columns.map((column, index) => (
                  <TableHead key={index}>{column.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableData.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-slate-100">
                  {tableSchema?.columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.type.toLowerCase() === "json"
                        ? JSON.stringify(row[column.name] ?? "NULL")
                        : row[column.name] ?? "NULL"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <SchemaLegend />
      </div>
    </div>
  );
}
