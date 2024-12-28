import { SchemaTable } from './components/SchemaTable';
import { SchemaLegend } from './components/SchemaLegend';
import { useState, useEffect } from 'react';
import TableDataGenerator from './tableDataGenerator';

const GRID_COLUMNS = 4; // Adjust this number for column count
const TABLE_WIDTH = 200; // Width of each table
const TABLE_HEIGHT = 200;


export default function App() {
  const [isLoading, setLoading] = useState(true);
  const [tables, setTables] = useState([]);
  const [calculatedPositions, setCalculatedPositions] = useState([]);

  useEffect(() => {
    const dataGenerator = async () => {
      setLoading(true);
      const data = await TableDataGenerator();
      console.log(data);

      const positions = data.map((_, index) => {
        const col = index % GRID_COLUMNS;
        const row = Math.floor(index / GRID_COLUMNS);
        return {
          x: col * TABLE_WIDTH + 20,
          y: row * TABLE_HEIGHT + 50 ,
        };
      });

      setTables(data);
      setCalculatedPositions(positions);
      setLoading(false);
    };

    dataGenerator();
  }, []);

  return (
    <>
      {isLoading ? (
        <h1>Loading...</h1>
      ) : (
        <div
          className="min-h-screen bg-background p-8  overflow-auto"
          style={{
            width: `${GRID_COLUMNS * TABLE_WIDTH}px`,
          }}
        >
          <div className="absolute inset-0">
            {tables.map((table, index) => (
              <SchemaTable
                key={table.name}
                {...table}
                initialPosition={calculatedPositions[index]} // Use pre-calculated positions
              />
            ))}
          </div>
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
            <SchemaLegend />
          </div>
        </div>
      )}
    </>
  );
}
