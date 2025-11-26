import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, { ReactFlowProvider } from 'reactflow';
import useStore from '../store/useStore';
import { storageService } from '../services/storageService';
import { diffOrgCharts } from '../utils/diffUtils';
import ReadOnlyCanvas from '../components/Canvas/ReadOnlyCanvas';
import OrgChartCanvas from '../components/Canvas/OrgChartCanvas';
import AnalysisPanel from '../components/AnalysisPanel';
import MainLayout from '../components/Layout/MainLayout';
import DualPaneLayout from '../components/Layout/DualPaneLayout';
import { ArrowLeft, RefreshCw, AlertCircle, FileText } from 'lucide-react';


const Comparison = () => {
    const { baseId, targetId } = useParams();
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

    const currentProject = useStore((state) => state.currentProject);


    // Load Data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // 1. Load Base Data (Directly)
                const base = await storageService.loadProject(baseId);
                setBaseData(base || { nodes: [], edges: [] });

                // 2. Load Target Data (Into Store)
                await loadChart(targetId);

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
    }, [baseId, targetId, loadChart]);

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

        // Apply visual highlights to Target Nodes in Store
        // We don't want to persist these styles, just show them.
        // But since OrgChartCanvas reads from store, we must update store.
        // We should be careful not to save these "highlight" classes if we save the project.
        // For now, let's assume the user accepts that "Comparison Mode" might temporarily dirty the state.
        // Ideally, we'd use a separate "overlay" layer, but modifying data is easier for now.

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
                        <h1 className="font-semibold text-slate-800">Comparison Mode</h1>

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
                    </div>

                    <button
                        onClick={() => setShowAnalysis(!showAnalysis)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${showAnalysis ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                    >
                        <FileText size={16} />
                        Analysis
                    </button>
                </div>


                {/* Split View using DualPaneLayout */}
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

                            {showAnalysis && currentProject && (
                                <AnalysisPanel
                                    projectId={targetId}
                                    initialData={currentProject.analysis}
                                    onClose={() => setShowAnalysis(false)}
                                />
                            )}
                        </>
                    }
                />
            </div>
        </MainLayout>
    );
};

export default Comparison;
