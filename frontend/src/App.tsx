import { SchemaTable } from './components/SchemaTable';
import { SchemaLegend } from './components/SchemaLegend';
import { useState, useEffect } from 'react';
import TableDataGenerator from './tableDataGenerator';

export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const dataGenerator = async () => {
      setLoading(true);
      const data = await TableDataGenerator();
      console.log(data);
      setTables(data);
      setLoading(false);
    };

    dataGenerator();
  }, []);

  return (
    <>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <> 
            <SchemaTable tables={tables}/>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
              <SchemaLegend />
            </div>
        </>
      )}
    </>
  );
}
