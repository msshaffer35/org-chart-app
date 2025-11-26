import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import MainLayout from '../components/Layout/MainLayout';
import { ArrowLeft, ArrowRight, Plus, GitCompare, Copy } from 'lucide-react';
import { comparisonStorageService } from '../services/comparisonStorageService';

/**
 * AnalysisSetup Component
 *
 * Presents three distinct analysis workflows:
 * 1. Compare Changes Over Time - Temporal comparison with diff highlighting
 * 2. Compare Different Organizations - Side-by-side read-only comparison
 * 3. Start from Scratch - Create new project
 */
const AnalysisSetup = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject } = useStore();

    const [selectedMode, setSelectedMode] = useState(null); // 'temporal' | 'spatial' | 'scratch'
    const [baseProject, setBaseProject] = useState(null);
    const [targetProject, setTargetProject] = useState(null);
    const [draggedProject, setDraggedProject] = useState(null);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleDragStart = (e, project) => {
        setDraggedProject(project);
        e.dataTransfer.setData('projectId', project.id);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e, type) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData('projectId');
        const project = projectList.find(p => p.id === projectId);

        if (project) {
            if (type === 'base') {
                setBaseProject(project);
                // For temporal mode, prevent same project in both zones
                if (selectedMode === 'temporal' && targetProject?.id === project.id) {
                    setTargetProject(null);
                }
            } else {
                setTargetProject(project);
                // For temporal mode, prevent same project in both zones
                if (selectedMode === 'temporal' && baseProject?.id === project.id) {
                    setBaseProject(null);
                }
            }
        }
        setDraggedProject(null);
    };

    const handleModeSelect = async (mode) => {
        if (mode === 'scratch') {
            // Immediately create project and navigate
            const name = prompt("Enter a name for the new analysis project:");
            if (!name) return;

            try {
                // 1. Create the Project
                const projectId = await createProject({
                    account: name,
                    department: 'Analysis',
                    dateCollected: new Date().toISOString().split('T')[0]
                });

                // 2. Create the Analysis Record
                const analysisId = await comparisonStorageService.createAnalysis(
                    'single',
                    [projectId],
                    { name: name },
                    name // Use project name as analysis name
                );

                navigate(`/analysis/single/${analysisId}`);
            } catch (error) {
                console.error("Failed to create project or analysis", error);
            }
        } else {
            // Set mode and show drag-drop interface
            setSelectedMode(mode);
            setBaseProject(null);
            setTargetProject(null);
        }
    };

    const handleStartAnalysis = async () => {
        if (!baseProject || !targetProject) return;

        if (selectedMode === 'temporal') {
            // Option 1: Compare changes over time
            try {
                const newId = await comparisonStorageService.createAnalysis(
                    'temporal',
                    [baseProject.id, targetProject.id],
                    {
                        baseName: baseProject.account,
                        targetName: targetProject.account
                    }
                );
                navigate(`/analysis/temporal/${newId}`);
            } catch (error) {
                console.error("Failed to create temporal analysis", error);
            }
        } else if (selectedMode === 'spatial') {
            // Option 2: Compare different organizations
            try {
                const newId = await comparisonStorageService.createAnalysis(
                    'side-by-side',
                    [baseProject.id, targetProject.id],
                    {
                        leftName: baseProject.account,
                        rightName: targetProject.account
                    }
                );
                navigate(`/analysis/side-by-side/${newId}`);
            } catch (error) {
                console.error("Failed to create analysis", error);
            }
        }
    };

    const handleBack = () => {
        setSelectedMode(null);
        setBaseProject(null);
        setTargetProject(null);
    };

    const getButtonText = () => {
        if (selectedMode === 'temporal') return 'Start Comparison Analysis';
        if (selectedMode === 'spatial') return 'Start Side-by-Side View';
        return 'Start Analysis';
    };

    const getZoneLabels = () => {
        if (selectedMode === 'temporal') {
            return { base: 'Before (Base)', target: 'After (Target)' };
        } else if (selectedMode === 'spatial') {
            return { base: 'Organization A', target: 'Organization B' };
        }
        return { base: 'Base', target: 'Target' };
    };

    const getZoneDescriptions = () => {
        if (selectedMode === 'temporal') {
            return {
                base: 'The earlier version',
                target: 'The later version to compare'
            };
        } else if (selectedMode === 'spatial') {
            return {
                base: 'First organization',
                target: 'Second organization'
            };
        }
        return { base: 'Base chart', target: 'Target chart' };
    };

    return (
        <MainLayout>
            <div className="flex h-full bg-slate-50">
                {/* Sidebar - Project List (only show when mode is selected) */}
                {selectedMode && selectedMode !== 'scratch' && (
                    <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                            <button onClick={handleBack} className="text-slate-500 hover:text-slate-800">
                                <ArrowLeft size={20} />
                            </button>
                            <h2 className="font-semibold text-slate-800">Select Projects</h2>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <p className="text-xs text-slate-500 mb-2">Drag projects to the zones below</p>
                            {projectList.map(project => (
                                <div
                                    key={project.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, project)}
                                    className="p-3 bg-white border border-slate-200 rounded-lg shadow-sm cursor-grab hover:border-blue-400 hover:shadow-md transition-all active:cursor-grabbing"
                                >
                                    <div className="font-medium text-slate-800">{project.account || 'Untitled'}</div>
                                    <div className="text-xs text-slate-500 flex justify-between mt-1">
                                        <span>{project.department || 'No Dept'}</span>
                                        <span>{new Date(project.dateCollected).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="max-w-5xl w-full">
                        <div className="text-center mb-12">
                            <button
                                onClick={() => navigate('/')}
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4 transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Projects
                            </button>
                            <h1 className="text-3xl font-bold text-slate-800 mb-2">Setup New Analysis</h1>
                            <p className="text-slate-500">
                                {selectedMode ? 'Select projects to compare' : 'Choose your analysis approach'}
                            </p>
                        </div>

                        {!selectedMode ? (
                            /* Three-Card Selection */
                            <div className="grid grid-cols-3 gap-6">
                                {/* Option 1: Compare Changes Over Time */}
                                <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-400 transition-all flex flex-col p-6">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                                            <GitCompare className="text-blue-600" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                                            Compare Changes Over Time
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Track how one organization changed between two versions. See what was added, removed, or modified with visual diff highlighting.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleModeSelect('temporal')}
                                        className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Select
                                    </button>
                                </div>

                                {/* Option 2: Compare Different Organizations */}
                                <div className="bg-white rounded-xl border-2 border-purple-200 shadow-sm hover:shadow-lg hover:border-purple-400 transition-all flex flex-col p-6">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                                            <Copy className="text-purple-600" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                                            Compare Different Organizations
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            View two different organizations side-by-side. Perfect for comparing teams, departments, or companies visually.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleModeSelect('spatial')}
                                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Select
                                    </button>
                                </div>

                                {/* Option 3: Start from Scratch */}
                                <div className="bg-white rounded-xl border-2 border-green-200 shadow-sm hover:shadow-lg hover:border-green-400 transition-all flex flex-col p-6">
                                    <div className="flex-1">
                                        <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                                            <Plus className="text-green-600" size={24} />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800 mb-2">
                                            Start from Scratch
                                        </h3>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Create a new blank organizational chart. Build your structure from the ground up with full editing capabilities.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleModeSelect('scratch')}
                                        className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Drag-Drop Zones (for temporal and spatial modes) */
                            <div className="space-y-8">
                                <div className="flex items-center gap-6">
                                    {/* Base/Left Zone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'base')}
                                        className={`flex-1 h-64 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${baseProject
                                            ? `border-${selectedMode === 'temporal' ? 'blue' : 'purple'}-500 bg-${selectedMode === 'temporal' ? 'blue' : 'purple'}-50`
                                            : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                                            }`}
                                    >
                                        {baseProject ? (
                                            <div className="text-center">
                                                <div className="font-bold text-lg text-slate-800">{baseProject.account}</div>
                                                <div className="text-slate-500">{baseProject.department}</div>
                                                <button
                                                    onClick={() => setBaseProject(null)}
                                                    className="mt-4 text-xs text-red-500 hover:text-red-700 underline"
                                                >
                                                    Remove
                                                </button>
                                                <div className={`absolute top-3 left-3 px-2 py-1 bg-${selectedMode === 'temporal' ? 'blue' : 'purple'}-100 text-${selectedMode === 'temporal' ? 'blue' : 'purple'}-700 text-xs font-bold rounded uppercase tracking-wider`}>
                                                    {getZoneLabels().base}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400 pointer-events-none px-4">
                                                <GitCompare size={48} className="mx-auto mb-3 opacity-50" />
                                                <p className="font-medium">{getZoneLabels().base}</p>
                                                <p className="text-xs mt-1">{getZoneDescriptions().base}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-slate-300">
                                        <ArrowRight size={32} />
                                    </div>

                                    {/* Target/Right Zone */}
                                    <div
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => handleDrop(e, 'target')}
                                        className={`flex-1 h-64 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${targetProject
                                            ? `border-${selectedMode === 'temporal' ? 'blue' : 'purple'}-500 bg-${selectedMode === 'temporal' ? 'blue' : 'purple'}-50`
                                            : 'border-slate-300 bg-slate-100 hover:border-slate-400'
                                            }`}
                                    >
                                        {targetProject ? (
                                            <div className="text-center">
                                                <div className="font-bold text-lg text-slate-800">{targetProject.account}</div>
                                                <div className="text-slate-500">{targetProject.department}</div>
                                                <button
                                                    onClick={() => setTargetProject(null)}
                                                    className="mt-4 text-xs text-red-500 hover:text-red-700 underline"
                                                >
                                                    Remove
                                                </button>
                                                <div className={`absolute top-3 left-3 px-2 py-1 bg-${selectedMode === 'temporal' ? 'blue' : 'purple'}-100 text-${selectedMode === 'temporal' ? 'blue' : 'purple'}-700 text-xs font-bold rounded uppercase tracking-wider`}>
                                                    {getZoneLabels().target}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400 pointer-events-none px-4">
                                                <Copy size={48} className="mx-auto mb-3 opacity-50" />
                                                <p className="font-medium">{getZoneLabels().target}</p>
                                                <p className="text-xs mt-1">{getZoneDescriptions().target}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Start Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleStartAnalysis}
                                        disabled={!baseProject || !targetProject}
                                        className={`px-8 py-3 rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 text-lg disabled:bg-slate-300 disabled:cursor-not-allowed text-white ${selectedMode === 'temporal'
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-purple-600 hover:bg-purple-700'
                                            }`}
                                    >
                                        {getButtonText()}
                                        <ArrowRight size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AnalysisSetup;
