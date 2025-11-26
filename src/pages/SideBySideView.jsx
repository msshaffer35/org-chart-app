import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { comparisonStorageService } from '../services/comparisonStorageService';
import ReadOnlyCanvas from '../components/Canvas/ReadOnlyCanvas';
import AnalysisPanel from '../components/AnalysisPanel';
import MainLayout from '../components/Layout/MainLayout';
import DualPaneLayout from '../components/Layout/DualPaneLayout';
import { ArrowLeft, FileText, AlertCircle } from 'lucide-react';

/**
 * SideBySideView Component
 *
 * Displays two different organizational charts side-by-side for comparison.
 * Both charts are read-only. No diff highlighting is applied.
 * Supports analysis notes that are saved separately from the original projects.
 */
const SideBySideView = () => {
    const { leftId, rightId } = useParams();
    const navigate = useNavigate();

    // Local state for both charts (NOT using Zustand store to avoid pollution)
    const [leftData, setLeftData] = useState({ nodes: [], edges: [] });
    const [rightData, setRightData] = useState({ nodes: [], edges: [] });
    const [leftProject, setLeftProject] = useState(null);
    const [rightProject, setRightProject] = useState(null);
    const [comparisonData, setComparisonData] = useState(null);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load both projects and comparison data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                // Load left project
                const leftProj = storageService.getProjectMetadata(leftId);
                const leftChartData = await storageService.loadProject(leftId);

                if (!leftProj || !leftChartData) {
                    throw new Error(`Left project (ID: ${leftId}) not found`);
                }

                setLeftProject(leftProj);
                setLeftData(leftChartData);

                // Load right project
                const rightProj = storageService.getProjectMetadata(rightId);
                const rightChartData = await storageService.loadProject(rightId);

                if (!rightProj || !rightChartData) {
                    throw new Error(`Right project (ID: ${rightId}) not found`);
                }

                setRightProject(rightProj);
                setRightData(rightChartData);

                // Load or initialize comparison data
                const existingComparison = comparisonStorageService.loadComparison(leftId, rightId);

                if (existingComparison) {
                    setComparisonData(existingComparison);
                } else {
                    // Create initial comparison record
                    const initialAnalysis = comparisonStorageService.getEmptyAnalysis();
                    await comparisonStorageService.saveComparison(
                        leftId,
                        rightId,
                        initialAnalysis,
                        leftProj.account || 'Unnamed',
                        rightProj.account || 'Unnamed'
                    );

                    setComparisonData({
                        id: `comparison_${leftId}_${rightId}`,
                        leftProjectId: leftId,
                        rightProjectId: rightId,
                        leftProjectName: leftProj.account || 'Unnamed',
                        rightProjectName: rightProj.account || 'Unnamed',
                        createdAt: Date.now(),
                        lastModified: Date.now(),
                        analysis: initialAnalysis
                    });
                }
            } catch (err) {
                console.error('Failed to load side-by-side view data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [leftId, rightId]);

    // Handle saving analysis data
    const handleSaveAnalysis = async (analysisData) => {
        try {
            await comparisonStorageService.saveComparison(
                leftId,
                rightId,
                analysisData,
                leftProject?.account || 'Unnamed',
                rightProject?.account || 'Unnamed'
            );

            // Update local state
            setComparisonData(prev => ({
                ...prev,
                analysis: analysisData,
                lastModified: Date.now()
            }));
        } catch (error) {
            console.error('Failed to save comparison analysis:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-slate-600">Loading comparison view...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <AlertCircle size={48} className="text-red-500" />
                <div className="text-xl font-semibold text-slate-800">Failed to Load Comparison</div>
                <div className="text-slate-600">{error}</div>
                <button
                    onClick={() => navigate('/analysis/new')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Back to Analysis Setup
                </button>
            </div>
        );
    }

    return (
        <MainLayout>
            <div className="flex flex-col h-full w-full">
                {/* Header */}
                <div className="h-14 bg-white border-b border-slate-200 flex items-center px-4 justify-between shadow-sm z-20 flex-none">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/analysis/new')}
                            className="text-slate-500 hover:text-slate-800 transition-colors"
                            title="Back to Analysis Setup"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <h1 className="font-semibold text-slate-800">Side-by-Side Comparison</h1>

                        {leftProject && rightProject && (
                            <div className="flex gap-2 text-sm text-slate-600 px-4 border-l border-slate-200">
                                <span className="font-medium">{leftProject.account}</span>
                                <span className="text-slate-400">vs</span>
                                <span className="font-medium">{rightProject.account}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${
                            showAnalysis
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Toggle Analysis Panel"
                    >
                        <FileText size={16} />
                        Analysis
                    </button>
                </div>

                {/* Split View using DualPaneLayout */}
                <DualPaneLayout
                    leftPane={
                        <ReadOnlyCanvas
                            nodes={leftData.nodes}
                            edges={leftData.edges}
                            label={leftProject?.account || 'Organization A'}
                        />
                    }
                    rightPane={
                        <>
                            <ReadOnlyCanvas
                                nodes={rightData.nodes}
                                edges={rightData.edges}
                                label={rightProject?.account || 'Organization B'}
                            />

                            {showAnalysis && comparisonData && (
                                <AnalysisPanel
                                    comparisonId={`${leftId}_${rightId}`}
                                    leftProjectId={leftId}
                                    rightProjectId={rightId}
                                    initialData={comparisonData.analysis}
                                    onSave={handleSaveAnalysis}
                                    onClose={() => setShowAnalysis(false)}
                                />
                            )}
                        </>
                    }
                    dividerColor="purple-200"
                />
            </div>
        </MainLayout>
    );
};

export default SideBySideView;
