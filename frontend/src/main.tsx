import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter,Route,Routes } from "react-router";
import TableEditor from './tableEditor/TableEditor.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>  
        <Route path="/" element={<App/>}/>
        <Route path="table/:tableName" element={<TableEditor/>}/>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
