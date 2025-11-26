import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { comparisonStorageService } from '../services/comparisonStorageService';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import AnalysisPanel from '../components/AnalysisPanel';
import MainLayout from '../components/Layout/MainLayout';
import { ArrowLeft, FileText, Edit2, Check, X } from 'lucide-react';

const SingleAnalysis = () => {
    const { projectId: paramProjectId, analysisId } = useParams();
    const navigate = useNavigate();
    const loadChart = useStore((state) => state.loadChart);
    const currentProject = useStore((state) => state.currentProject);

    const [showAnalysis, setShowAnalysis] = useState(true);
    const [analysisData, setAnalysisData] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');
    const [currentProjectId, setCurrentProjectId] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            if (analysisId) {
                // Load via Analysis ID
                const analysis = comparisonStorageService.getAnalysis(analysisId);
                if (analysis) {
                    setAnalysisData(analysis);
                    setNewName(analysis.name || 'Untitled Analysis');
                    if (analysis.projectIds && analysis.projectIds.length > 0) {
                        const pid = analysis.projectIds[0];
                        setCurrentProjectId(pid);
                        loadChart(pid);
                    }
                }
            } else if (paramProjectId) {
                // Legacy / Direct Project Mode
                setCurrentProjectId(paramProjectId);
                loadChart(paramProjectId);
                setNewName('Analysis Mode');
            }
        };
        loadData();
    }, [analysisId, paramProjectId, loadChart]);

    const handleSaveAnalysis = async (data) => {
        if (analysisId) {
            await comparisonStorageService.saveAnalysis(analysisId, data);
            setAnalysisData(prev => ({ ...prev, analysis: data }));
        }
    };

    const handleRename = async () => {
        if (newName.trim() && analysisId) {
            await comparisonStorageService.renameAnalysis(analysisId, newName);
            setAnalysisData(prev => ({ ...prev, name: newName }));
            setIsRenaming(false);
        }
    };

    if (!currentProject && !analysisData) {
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

                        <div className="flex flex-col">
                            {isRenaming ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="px-2 py-0.5 border border-blue-300 rounded text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        autoFocus
                                    />
                                    <button onClick={handleRename} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => setIsRenaming(false)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <h1 className="font-semibold text-slate-800">
                                        {analysisData?.name || 'Analysis Mode'}
                                    </h1>
                                    {analysisId && (
                                        <button
                                            onClick={() => setIsRenaming(true)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                            )}
                            <div className="text-xs text-slate-500">
                                {currentProject?.account} - {currentProject?.department}
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
                            comparisonId={analysisId}
                            projectId={currentProjectId}
                            initialData={analysisData?.analysis || currentProject?.analysis}
                            onSave={handleSaveAnalysis}
                            onClose={() => setShowAnalysis(false)}
                        />
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default SingleAnalysis;
