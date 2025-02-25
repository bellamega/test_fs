import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AddNewArticle from './pages/AddNewArticle';
import EditArticle from './pages/EditArticle';
import Preview from './pages/Preview';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        {/* Route default yang mengarahkan ke /posts */}
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<Dashboard />} />
        <Route path="/add-new" element={<AddNewArticle />} />
        <Route path="/edit/:id" element={<EditArticle />} />
        <Route path="/preview" element={<Preview />} />
      </Routes>
    </Router>
  );
}

export default App;
