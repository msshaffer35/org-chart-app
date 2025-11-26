import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProjectList from './pages/ProjectList';
import Editor from './pages/Editor';
import Comparison from './pages/Comparison';
import SideBySideView from './pages/SideBySideView';
import AnalysisSetup from './pages/AnalysisSetup';
import SingleAnalysis from './pages/SingleAnalysis';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProjectList />} />
        <Route path="/project/:projectId" element={<Editor />} />
        <Route path="/compare/:baseId/:targetId" element={<Comparison />} />
        <Route path="/view-side-by-side/:leftId/:rightId" element={<SideBySideView />} />
        <Route path="/analysis/new" element={<AnalysisSetup />} />
        <Route path="/analysis/:projectId" element={<SingleAnalysis />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
