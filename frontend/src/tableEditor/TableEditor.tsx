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
import { KeyRound, Hash, Fingerprint, Circle, Diamond,Plus } from "lucide-react";

const isJson = (checkVal: any): boolean => {
  try {
    if (typeof checkVal === "string") {
      JSON.parse(checkVal);
      return true;
    }
    if (typeof checkVal === "object" && checkVal !== null) {
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export default function TableEditor() {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
  const { tableName } = useParams();
  const [tableData, setTableData] = useState<any[]>([]);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colName: string;
    value: string;
  } | null>(null);

  const renderColumnIcon = (column) => (
    <div className="flex items-center gap-1">
      {column.isPrimary && <KeyRound className="h-4 w-4 text-slate-800" title="Primary Key" />}
      {column.isIdentity && <Hash className="h-4 w-4 text-slate-800" title="Identity" />}
      {column.isUnique && <Fingerprint className="h-4 w-4 text-slate-800" title="Unique" />}
      {column.isNullable ? (
        <Circle className="h-4 w-4 text-slate-800" title="Nullable" />
      ) : (
        <Diamond className="h-4 w-4 text-slate-800" title="Non-Nullable" />
      )}
      {column.isForeignKey && (
        <Hash
          className="h-4 w-4 text-slate-800"
          title={`Foreign Key (${column.targetTable}.${column.targetColumn})`}
        />
      )}
    </div>
  );

  useEffect(() => {
    const dataGenerator = async () => {
      setLoading(true);
      const [tableSchemaData, tableRowData] = await Promise.all([
        GenerateTableSchema(tableName),
        GetTableData(tableName),
      ]);
      setTableSchema(tableSchemaData);
      setTableData(tableRowData);
      setLoading(false);
    };
    dataGenerator();
  }, [tableName]);

  const handleDoubleClick = (rowIndex: number, colName: string, value: any) => {
    const parsedValue =
      isJson(value) && typeof value === "object"
        ? JSON.stringify(value, null, 2)
        : value;

    setEditingCell({ rowIndex, colName, value: parsedValue });
  };

  const handleBlur = () => {
    if (editingCell) {
      const updatedTableData = [...tableData];
      const parsedValue =
        isJson(editingCell.value) && typeof editingCell.value === "string"
          ? JSON.parse(editingCell.value)
          : editingCell.value;

      updatedTableData[editingCell.rowIndex][editingCell.colName] = parsedValue;
      setTableData(updatedTableData);
      setEditingCell(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingCell) {
      setEditingCell({
        ...editingCell,
        value: e.target.value,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  const handleInsertItem = () => {

  };

  return (
    <div className="flex flex-col items-center min-h-screen py-4 w-full overflow-y-auto">
      <h1 className="text-3xl font-bold text-black">{tableName}</h1>

      {isLoading ? (
        <h1 className="text-xl font-bold text-black">Loading...</h1>
      ) : tableSchema ? (
        <div className="w-3/4">
          <div className="flex justify-end mb-4">
            {tableData && (
              <button
                className="px-4 py-2 bg-slate-200 text-gray-800 rounded hover:bg-slate-400 border-slate-200"
                onClick={handleInsertItem}
              >
                <Plus />
              </button>
            )}
          </div>
          <div className="relative">
            <div
              className="overflow-x-auto flex flex-col-reverse"
              style={{ direction: "rtl",transform : "rotate(180deg)"}}
            >
              <div style={{ direction: "ltr",transform : "rotate(-180deg)"}}>
                <Table>
                  <TableCaption>A preview of the {tableName} table.</TableCaption>
                  <TableHeader>
                    <TableRow>
                      {tableSchema.columns.map((column, index) => (
                        <TableHead key={index} className="px-6">
                          <span className="flex gap-2">
                            {column.name}
                            {renderColumnIcon(column)}
                          </span>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData &&
                      tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex} className="hover:bg-slate-100">
                          {tableSchema.columns.map((column, colIndex) => (
                            <TableCell
                              key={colIndex}
                              className="px-6"
                              onDoubleClick={() =>
                                handleDoubleClick(
                                  rowIndex,
                                  column.name,
                                  isJson(row[column.name]) && column.name.toLowerCase() === "json"
                                    ? JSON.stringify(row[column.name])
                                    : row[column.name]
                                )
                              }
                            >
                              {editingCell &&
                              editingCell.rowIndex === rowIndex &&
                              editingCell.colName === column.name ? (
                                column.type.toLowerCase() === "boolean" ? (
                                  <select
                                    value={editingCell.value}
                                    onChange={(e) =>
                                      setEditingCell({
                                        ...editingCell,
                                        value: e.target.value === "true",
                                      })
                                    }
                                    onBlur={handleBlur}
                                    className="p-1 border rounded bg-white"
                                    autoFocus
                                  >
                                    <option value="true">True</option>
                                    <option value="false">False</option>
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={editingCell.value}
                                    onChange={handleInputChange}
                                    onBlur={handleBlur}
                                    onKeyDown={handleKeyDown}
                                    className="p-1 border rounded bg-white"
                                    autoFocus
                                  />
                                )
                              ) : column.type.toLowerCase() === "boolean" ? (
                                <span>{row[column.name] ? "True" : "False"}</span>
                              ) : column.type.toLowerCase() === "json" ? (
                                JSON.stringify(row[column.name] ?? "NULL")
                              ) : (
                                row[column.name] ?? "NULL"
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h1>Table not available</h1>
        </div>
      )}

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <SchemaLegend />
      </div>
    </div>
  );
  
}
