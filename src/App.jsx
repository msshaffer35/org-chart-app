import React, { useEffect } from 'react';
import OrgChartCanvas from './components/Canvas/OrgChartCanvas';
import MainLayout from './components/Layout/MainLayout';
import useStore from './store/useStore';

function App() {
  const loadChart = useStore((state) => state.loadChart);

  useEffect(() => {
    loadChart();
  }, [loadChart]);

  return (
    <MainLayout>
      <OrgChartCanvas />
    </MainLayout>
  );
}

export default App;
