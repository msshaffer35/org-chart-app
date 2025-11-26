import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { comparisonStorageService } from '../services/comparisonStorageService';
import ReadOnlyCanvas from '../components/Canvas/ReadOnlyCanvas';
import AnalysisPanel from '../components/AnalysisPanel';
import MainLayout from '../components/Layout/MainLayout';
import DualPaneLayout from '../components/Layout/DualPaneLayout';
import { ArrowLeft, FileText, AlertCircle, Edit2, Check, X } from 'lucide-react';

/**
 * SideBySideView Component
 *
 * Displays two different organizational charts side-by-side for comparison.
 * Both charts are read-only. No diff highlighting is applied.
 * Supports analysis notes that are saved separately from the original projects.
 */
const SideBySideView = () => {
    const { leftId: paramLeftId, rightId: paramRightId, analysisId } = useParams();
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

    // Renaming state
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');

    // Load both projects and comparison data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                let currentLeftId = paramLeftId;
                let currentRightId = paramRightId;
                let currentAnalysis = null;

                // Scenario 1: Loaded via Analysis ID
                if (analysisId) {
                    currentAnalysis = comparisonStorageService.getAnalysis(analysisId);
                    if (!currentAnalysis) {
                        throw new Error(`Analysis (ID: ${analysisId}) not found`);
                    }

                    if (currentAnalysis.projectIds && currentAnalysis.projectIds.length >= 2) {
                        currentLeftId = currentAnalysis.projectIds[0];
                        currentRightId = currentAnalysis.projectIds[1];
                    } else {
                        throw new Error("Analysis record is missing project IDs");
                    }

                    setComparisonData(currentAnalysis);
                    setNewName(currentAnalysis.name || 'Untitled Analysis');
                }
                // Scenario 2: Loaded via Legacy Route (Left/Right IDs)
                else if (paramLeftId && paramRightId) {
                    // Check for legacy comparison or create new analysis
                    const legacyData = comparisonStorageService.loadComparison(paramLeftId, paramRightId);

                    if (legacyData) {
                        // Use legacy data but we should probably migrate it or just use it as is
                        setComparisonData(legacyData);
                        currentLeftId = paramLeftId;
                        currentRightId = paramRightId;
                        setNewName('Legacy Comparison');
                    } else {
                        // Create a NEW analysis and redirect
                        const newId = await comparisonStorageService.createAnalysis(
                            'side-by-side',
                            [paramLeftId, paramRightId]
                        );
                        navigate(`/analysis/side-by-side/${newId}`, { replace: true });
                        return; // Stop execution to allow redirect
                    }
                } else {
                    throw new Error("Invalid parameters");
                }

                // Load left project
                const leftProj = storageService.getProjectMetadata(currentLeftId);
                const leftChartData = await storageService.loadProject(currentLeftId);

                if (!leftProj || !leftChartData) {
                    throw new Error(`Left project (ID: ${currentLeftId}) not found`);
                }

                setLeftProject(leftProj);
                setLeftData(leftChartData);

                // Load right project
                const rightProj = storageService.getProjectMetadata(currentRightId);
                const rightChartData = await storageService.loadProject(currentRightId);

                if (!rightProj || !rightChartData) {
                    throw new Error(`Right project (ID: ${currentRightId}) not found`);
                }

                setRightProject(rightProj);
                setRightData(rightChartData);

            } catch (err) {
                console.error('Failed to load side-by-side view data:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [paramLeftId, paramRightId, analysisId, navigate]);

    // Handle saving analysis data
    const handleSaveAnalysis = async (analysisData) => {
        try {
            if (comparisonData?.id) {
                // Determine if we are saving a legacy comparison or a new analysis
                if (comparisonData.id.startsWith('comparison_')) {
                    // Legacy save
                    const leftId = comparisonData.leftProjectId || paramLeftId;
                    const rightId = comparisonData.rightProjectId || paramRightId;

                    await comparisonStorageService.saveComparison(
                        leftId,
                        rightId,
                        analysisData,
                        leftProject?.account || 'Unnamed',
                        rightProject?.account || 'Unnamed'
                    );
                } else {
                    // New Analysis save
                    await comparisonStorageService.saveAnalysis(comparisonData.id, analysisData);
                }

                // Update local state
                setComparisonData(prev => ({
                    ...prev,
                    analysis: analysisData,
                    lastModified: Date.now()
                }));
            }
        } catch (error) {
            console.error('Failed to save comparison analysis:', error);
        }
    };

    const handleRename = async () => {
        if (newName.trim() && comparisonData?.id && !comparisonData.id.startsWith('comparison_')) {
            try {
                await comparisonStorageService.renameAnalysis(comparisonData.id, newName);
                setComparisonData(prev => ({ ...prev, name: newName }));
                setIsRenaming(false);
            } catch (error) {
                console.error("Failed to rename analysis", error);
            }
        } else {
            setIsRenaming(false);
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
                    onClick={() => navigate('/')}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    Back to Projects
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
                            onClick={() => navigate('/')}
                            className="text-slate-500 hover:text-slate-800 transition-colors"
                            title="Back to Projects"
                        >
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
                                        {comparisonData?.name || 'Side-by-Side Comparison'}
                                    </h1>
                                    {comparisonData?.id && !comparisonData.id.startsWith('comparison_') && (
                                        <button
                                            onClick={() => setIsRenaming(true)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    )}
                                </div>
                            )}

                            {leftProject && rightProject && (
                                <div className="text-xs text-slate-500 flex gap-2">
                                    <span>{leftProject.account}</span>
                                    <span className="text-slate-300">vs</span>
                                    <span>{rightProject.account}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${showAnalysis
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
                                    comparisonId={comparisonData.id}
                                    leftProjectId={leftProject?.id}
                                    rightProjectId={rightProject?.id}
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
