import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import AnalysisPanel from '../components/AnalysisPanel';
import MainLayout from '../components/Layout/MainLayout';
import { ArrowLeft, FileText } from 'lucide-react';

const SingleAnalysis = () => {
    const { projectId } = useParams();
    const navigate = useNavigate();
    const loadChart = useStore((state) => state.loadChart);
    const currentProject = useStore((state) => state.currentProject);

    const [showAnalysis, setShowAnalysis] = useState(true);

    useEffect(() => {
        if (projectId) {
            loadChart(projectId);
        }
    }, [projectId, loadChart]);

    if (!currentProject) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full w-full">
                {/* Header */}
                <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shadow-sm z-20 flex-none">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="font-semibold text-slate-800">Analysis Mode</h1>
                            <div className="text-xs text-slate-500">
                                {currentProject.account} - {currentProject.department}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${showAnalysis ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <FileText size={16} />
                        {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 relative overflow-hidden">
                    <OrgChartCanvas />

                    {showAnalysis && (
                        <AnalysisPanel
                            projectId={projectId}
                            initialData={currentProject.analysis}
                            onClose={() => setShowAnalysis(false)}
                        />
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default SingleAnalysis;
