interface Column {
    name: string;
    type: string;
    isPrimary?: boolean;
    isIdentity?: boolean;
    isUnique?: boolean;
    isNullable?: boolean;
    isForeignKey: boolean;
    targetTable: string | null;
    targetColumn: string | null;
  }
  
  export interface TableSchema {
    name: string;
    columns: Column[];
  }