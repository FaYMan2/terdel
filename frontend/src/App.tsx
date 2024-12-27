import { SchemaTable } from './components/SchemaTable';
import { SchemaLegend } from './components/SchemaLegend';

const tables = [
  {
    name: 'test2',
    columns: [
      { name: 'id', type: 'int8', isPrimary: true, isIdentity: true },
      { name: 'created_at', type: 'timestamptz', isNullable: false },
      { name: 'creatorId', type: 'int8', isNullable: true },
      { name: 'data', type: 'json', isNullable: true },
      { name: 'consumer', type: 'text', isNullable: true, isUnique: true },
    ],
  },
  {
    name: 'test',
    columns: [
      { name: 'id', type: 'int8', isPrimary: true, isIdentity: true },
      { name: 'created_at', type: 'timestamptz', isNullable: false },
      { name: 'username', type: 'text', isNullable: true, isUnique: true },
      { name: 'password', type: 'text', isNullable: true },
    ],
  },
];

function App() {
  return (
    <div className="min-h-screen bg-background p-8 relative">
      <div className="absolute inset-0">
        {tables.map((table, index) => (
          <SchemaTable 
            key={table.name} 
            {...table} 
            initialPosition={{ 
              x: 50 + (index * 450), 
              y: 50 
            }} 
          />
        ))}
      </div>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        <SchemaLegend />
      </div>
    </div>
  );
}

export default App;