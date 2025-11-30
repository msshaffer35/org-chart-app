import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store';
import { storageService } from '../services/storageService';
import { comparisonStorageService } from '../services/comparisonStorageService';
import { diffOrgCharts } from '../utils/diffUtils';
import ReadOnlyCanvas from '../components/Canvas/ReadOnlyCanvas';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import AnalysisPanel from '../components/AnalysisPanel';
import MainLayout from '../components/Layout/MainLayout';
import DualPaneLayout from '../components/Layout/DualPaneLayout';
import ComparativeDashboard from '../components/ComparativeDashboard';
import { ArrowLeft, FileText, Edit2, Check, X, Save } from 'lucide-react';


const Comparison = () => {
    const { baseId: paramBaseId, targetId: paramTargetId, analysisId } = useParams();
    const navigate = useNavigate();

    // Store hooks for Target (Right Side)
    const loadChart = useStore((state) => state.loadChart);
    const targetNodes = useStore((state) => state.nodes);
    const targetEdges = useStore((state) => state.edges);
    const setNodes = useStore((state) => state.setNodes);

    // Local state for Base (Left Side)
    const [baseData, setBaseData] = useState({ nodes: [], edges: [] });
    const [loading, setLoading] = useState(true);
    const [diffStats, setDiffStats] = useState({ added: 0, removed: 0, modified: 0, moved: 0 });
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [showDashboard, setShowDashboard] = useState(false);

    // Analysis State
    const [analysisData, setAnalysisData] = useState(null);
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');

    // IDs
    const [currentBaseId, setCurrentBaseId] = useState(null);
    const [currentTargetId, setCurrentTargetId] = useState(null);

    // Settings (Moved to top level to avoid hook order violation)
    const autoSaveEnabled = useStore((state) => state.settings?.autoSaveEnabled || false);

    // Save State
    const [isSaving, setIsSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error

    useEffect(() => {
        if (saveStatus === 'saved') {
            const timer = setTimeout(() => setSaveStatus('idle'), 2000);
            return () => clearTimeout(timer);
        }
    }, [saveStatus]);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                let bId = paramBaseId;
                let tId = paramTargetId;

                // Scenario 1: Loaded via Analysis ID
                if (analysisId) {
                    const analysis = comparisonStorageService.getAnalysis(analysisId);
                    if (analysis) {
                        setAnalysisData(analysis);
                        setNewName(analysis.name || 'Untitled Analysis');
                        if (analysis.projectIds && analysis.projectIds.length >= 2) {
                            bId = analysis.projectIds[0];
                            tId = analysis.projectIds[1];
                        }
                    }
                }
                // Scenario 2: Legacy Route -> Create Analysis & Redirect
                else if (paramBaseId && paramTargetId) {
                    // Check for legacy comparison or create new analysis
                    // For temporal, we just create a new one to ensure consistency
                    const newId = await comparisonStorageService.createAnalysis(
                        'temporal',
                        [paramBaseId, paramTargetId]
                    );
                    navigate(`/analysis/temporal/${newId}`, { replace: true });
                    return;
                }

                if (!bId || !tId) throw new Error("Missing project IDs");

                setCurrentBaseId(bId);
                setCurrentTargetId(tId);

                // 1. Load Base Data (Directly)
                const base = await storageService.loadProject(bId);
                setBaseData(base || { nodes: [], edges: [] });

                // 2. Load Target Data (Into Store)
                await loadChart(tId);

                // Disable filters for comparison accuracy
                useStore.getState().clearFilter();
                useStore.getState().updateSettings({ deidentifiedMode: false });

            } catch (error) {
                console.error("Failed to load comparison data", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [paramBaseId, paramTargetId, analysisId, loadChart, navigate]);

    // Calculate Diff & Apply Highlights
    useEffect(() => {
        if (!baseData.nodes.length || !targetNodes.length) return;

        const diff = diffOrgCharts(baseData.nodes, targetNodes, baseData.edges, targetEdges);
        setDiffStats({
            added: diff.added.length,
            removed: diff.removed.length,
            modified: diff.modified.length,
            moved: diff.moved.length
        });

        const newNodes = targetNodes.map(node => {
            let highlightClass = '';

            if (diff.added.find(n => n.id === node.id)) {
                highlightClass = 'ring-4 ring-green-400 ring-opacity-50';
            } else if (diff.modified.find(n => n.id === node.id)) {
                highlightClass = 'ring-4 ring-orange-400 ring-opacity-50';
            } else if (diff.moved.find(n => n.id === node.id)) {
                highlightClass = 'ring-4 ring-blue-400 ring-opacity-50';
            }

            // Check if we need to update
            if (node.className !== highlightClass) {
                return { ...node, className: highlightClass };
            }
            return node;
        });

        // Only update if changes detected to avoid infinite loop
        const hasChanges = newNodes.some((n, i) => n.className !== targetNodes[i].className);
        if (hasChanges) {
            setNodes(newNodes);
        }

    }, [baseData, targetNodes, targetEdges, setNodes]);

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

    if (loading) {
        return <div className="flex items-center justify-center h-screen">Loading Comparison...</div>;
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
                                        {analysisData?.name || 'Comparison Mode'}
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
                        </div>

                        {/* View Switcher */}
                        <div className="flex bg-slate-100 p-1 rounded-lg ml-4">
                            <button
                                onClick={() => setShowDashboard(false)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${!showDashboard ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Side-by-Side
                            </button>
                            <button
                                onClick={() => setShowDashboard(true)}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${showDashboard ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Dashboard
                            </button>
                        </div>

                        {!showDashboard && (
                            <div className="flex gap-3 text-xs font-medium px-4 border-l border-slate-200">
                                <span className="text-green-600 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    {diffStats.added} Added
                                </span>
                                <span className="text-red-600 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {diffStats.removed} Removed
                                </span>
                                <span className="text-orange-600 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                    {diffStats.modified} Modified
                                </span>
                                <span className="text-blue-600 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    {diffStats.moved} Moved
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm border border-slate-200">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={autoSaveEnabled}
                                        onChange={(e) => {
                                            useStore.getState().updateSettings({ autoSaveEnabled: e.target.checked });
                                        }}
                                    />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                                <span className="text-sm font-medium text-slate-600">Auto-Save</span>
                            </label>
                        </div>

                        <button
                            onClick={async () => {
                                try {
                                    setIsSaving(true);
                                    setSaveStatus('saving');

                                    // Save Project (Target)
                                    const saveProject = useStore.getState().saveProject;
                                    if (saveProject) {
                                        await saveProject();
                                    }

                                    // Save Analysis Data if available
                                    if (analysisData && analysisId) {
                                        await comparisonStorageService.saveAnalysis(analysisId, analysisData);
                                    }

                                    setSaveStatus('saved');
                                } catch (error) {
                                    console.error('Manual save failed:', error);
                                    setSaveStatus('error');
                                    alert('Failed to save');
                                } finally {
                                    setIsSaving(false);
                                }
                            }}
                            disabled={isSaving}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm border transition-all hover:shadow-md text-sm font-medium ${saveStatus === 'saved'
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:text-slate-900 border-slate-200'
                                }`}
                        >
                            <Save size={16} className={saveStatus === 'saved' ? 'text-green-600' : ''} />
                            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                        </button>

                        {!showDashboard && (
                            <button
                                onClick={() => setShowAnalysis(!showAnalysis)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${showAnalysis ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                            >
                                <FileText size={16} />
                                Analysis
                            </button>
                        )}
                    </div>
                </div>


                {/* Content Area */}
                {showDashboard ? (
                    <ComparativeDashboard
                        baseId={currentBaseId}
                        targetId={currentTargetId}
                    />
                ) : (
                    <DualPaneLayout
                        leftPane={
                            <ReadOnlyCanvas
                                nodes={baseData.nodes}
                                edges={baseData.edges}
                                label="Before"
                            />
                        }
                        rightPane={
                            <>
                                <OrgChartCanvas isComparison={true} />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-3 py-1 rounded shadow-sm border border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider pointer-events-none z-10">
                                    Scenario / Target
                                </div>

                                {showAnalysis && (
                                    <AnalysisPanel
                                        comparisonId={analysisId}
                                        projectId={currentTargetId}
                                        initialData={analysisData?.analysis}
                                        onSave={handleSaveAnalysis}
                                        onClose={() => setShowAnalysis(false)}
                                    />
                                )}
                            </>
                        }
                    />
                )}
            </div>
        </MainLayout>
    );
};

export default Comparison;
