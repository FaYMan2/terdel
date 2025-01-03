import { useEffect, useState } from "react";
import { GetTableNames } from "@/SchemaDataFetcher";
import { Link, useParams } from "react-router";

export function NavigationMenu() {
  const [tableNames, setTableNames] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { tableName } = useParams(); 
    console.log(tableName)
  useEffect(() => {
    const fetchTableNames = async () => {
      setIsLoading(true);
      const names = await GetTableNames();
      setTableNames(names);
      setIsLoading(false);
    };

    fetchTableNames();
  }, []);

  return (
    <div className="bg-white text-gray-800 w-52 h-screen p-6 border-r border-gray-200">
      <h1 className="text-xl font-bold mb-6">Tables</h1>
      {isLoading ? (
        <p className="text-gray-800">Loading...</p>
      ) : (
        <ul className="space-y-4">
          {tableNames.map((name) => (
            <li key={name}>
              <Link
                to={`/table/${name}`}
                className={`block px-2 py-2 rounded-md ${
                  name === tableName
                    ? "bg-slate-100 text-gray-600 font-semibold"
                    : "bg-white text-gray-500 hover:bg-slate-100 hover:text-black"
                }`}
              >
                {name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
