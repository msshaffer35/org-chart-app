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

        {/* Analysis Setup */}
        <Route path="/analysis/new" element={<AnalysisSetup />} />

        {/* Single Analysis (Start from Scratch) */}
        <Route path="/analysis/:projectId" element={<SingleAnalysis />} />
        <Route path="/analysis/single/:analysisId" element={<SingleAnalysis />} />

        {/* Temporal Comparison (Changes Over Time) */}
        <Route path="/compare/:baseId/:targetId" element={<Comparison />} />
        <Route path="/analysis/temporal/:analysisId" element={<Comparison />} />

        {/* Side-by-Side Comparison (Different Orgs) */}
        <Route path="/view-side-by-side/:leftId/:rightId" element={<SideBySideView />} />
        <Route path="/analysis/side-by-side/:analysisId" element={<SideBySideView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
