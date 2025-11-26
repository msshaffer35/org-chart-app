import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import MainLayout from '../components/Layout/MainLayout';
import { ArrowLeft, ArrowRight, Plus, FileText, GitCompare } from 'lucide-react';

const AnalysisSetup = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject } = useStore();

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
                // If same project is in target, clear target
                if (targetProject?.id === project.id) setTargetProject(null);
            } else {
                setTargetProject(project);
                // If same project is in base, clear base
                if (baseProject?.id === project.id) setBaseProject(null);
            }
        }
        setDraggedProject(null);
    };

    const handleStartAnalysis = () => {
        if (!targetProject) return;

        if (baseProject) {
            navigate(`/compare/${baseProject.id}/${targetProject.id}`);
        } else {
            navigate(`/analysis/${targetProject.id}`);
        }
    };

    const handleStartFromScratch = async () => {
        const name = prompt("Enter a name for the new analysis project:");
        if (!name) return;

        try {
            const id = await createProject({
                account: name,
                department: 'Analysis',
                dateCollected: new Date().toISOString().split('T')[0]
            });
            navigate(`/analysis/${id}`);
        } catch (error) {
            console.error("Failed to create project", error);
        }
    };

    return (
        <MainLayout>
            <div className="flex h-full bg-slate-50">
                {/* Sidebar - Project List */}
                <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
                    <div className="p-4 border-b border-slate-200 flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="text-slate-500 hover:text-slate-800">
                            <ArrowLeft size={20} />
                        </button>
                        <h2 className="font-semibold text-slate-800">Select Projects</h2>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        <p className="text-xs text-slate-500 mb-2">Drag projects to the analysis zones</p>
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

                {/* Main Content - Drop Zones */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <div className="max-w-4xl w-full">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Setup New Analysis</h1>
                        <p className="text-slate-500 text-center mb-12">Compare two charts or analyze a single one</p>

                        <div className="flex items-center gap-8 mb-12">
                            {/* Base Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'base')}
                                className={`flex-1 h-64 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${baseProject ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-slate-100 hover:border-slate-400'}`}
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
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded uppercase tracking-wider">
                                            Base (Optional)
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400 pointer-events-none">
                                        <GitCompare size={48} className="mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">Drop Base Chart Here</p>
                                        <p className="text-xs mt-1">For comparison baseline</p>
                                    </div>
                                )}
                            </div>

                            <div className="text-slate-300">
                                <ArrowRight size={32} />
                            </div>

                            {/* Target Zone */}
                            <div
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, 'target')}
                                className={`flex-1 h-64 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center relative ${targetProject ? 'border-green-500 bg-green-50' : 'border-slate-300 bg-slate-100 hover:border-slate-400'}`}
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
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded uppercase tracking-wider">
                                            Target / Analysis
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-400 pointer-events-none">
                                        <FileText size={48} className="mx-auto mb-3 opacity-50" />
                                        <p className="font-medium">Drop Target Chart Here</p>
                                        <p className="text-xs mt-1">The chart you want to analyze</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={handleStartAnalysis}
                                disabled={!targetProject}
                                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-lg font-semibold shadow-sm transition-all flex items-center gap-2 text-lg"
                            >
                                {baseProject ? 'Start Comparison' : 'Start Analysis'}
                                <ArrowRight size={20} />
                            </button>

                            <div className="flex items-center gap-4 text-slate-400 text-sm">
                                <span className="w-12 h-px bg-slate-300"></span>
                                <span>OR</span>
                                <span className="w-12 h-px bg-slate-300"></span>
                            </div>

                            <button
                                onClick={handleStartFromScratch}
                                className="text-slate-600 hover:text-blue-600 font-medium flex items-center gap-2 transition-colors"
                            >
                                <Plus size={18} />
                                Start from Scratch (New Project)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default AnalysisSetup;
