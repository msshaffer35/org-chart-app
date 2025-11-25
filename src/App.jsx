import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import Editor from './pages/Editor';
import Comparison from './pages/Comparison';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/project/:projectId" element={<Editor />} />
        <Route path="/compare/:baseId/:targetId" element={<Comparison />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
