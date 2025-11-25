import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp, Plus, ArrowRight, Building2, Briefcase, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AccountCard = ({ accountName, projects, onCreateNew }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(true);

    // Sort projects by date collected (newest first)
    const sortedProjects = [...projects].sort((a, b) =>
        new Date(b.dateCollected || 0) - new Date(a.dateCollected || 0)
    );

    const latestProject = sortedProjects[0];
    const latestDate = latestProject ? new Date(latestProject.dateCollected) : null;

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
            {/* Header */}
            <div
                className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center text-slate-400">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-900">{accountName || 'Untitled Account'}</h3>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span>{projects.length} Org Chart{projects.length !== 1 ? 's' : ''}</span>
                            {latestDate && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                    <span>Latest: {formatDate(latestProject.dateCollected)}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onCreateNew(accountName);
                        }}
                        className="p-2 hover:bg-white rounded-lg text-blue-600 transition-colors border border-transparent hover:border-slate-200"
                        title="Create new org chart for this account"
                    >
                        <Plus size={18} />
                    </button>
                    <div className="text-slate-400">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>

            {/* Body - Project List */}
            {isExpanded && (
                <div className="divide-y divide-slate-100">
                    {sortedProjects.filter(p => p.type !== 'SCENARIO').map((project) => {
                        // Find scenarios for this project
                        const scenarios = sortedProjects.filter(s => s.type === 'SCENARIO' && s.sourceProjectId === project.id);

                        const hasAnalysis = project.analysis && (
                            (project.analysis.swot && Object.values(project.analysis.swot).some(arr => arr.length > 0)) ||
                            project.analysis.generalNotes ||
                            project.analysis.strategicAlignment
                        );

                        return (
                            <React.Fragment key={project.id}>
                                {/* Parent Project Row */}
                                <div
                                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                                    onClick={() => navigate(`/editor/${project.id}`)}
                                >
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-700 text-sm">
                                                {project.department || 'No Department'}
                                            </span>
                                            {/* Tag Badges (Mini) */}
                                            <div className="flex gap-1">
                                                {project.functions && project.functions.slice(0, 2).map(f => (
                                                    <span key={f} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200">{f}</span>
                                                ))}
                                                {project.coes && project.coes.length > 0 && (
                                                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-600 text-[10px] rounded border border-purple-100">COE</span>
                                                )}
                                                {hasAnalysis && (
                                                    <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 text-[10px] rounded border border-amber-100 flex items-center gap-1">
                                                        <FileText size={10} />
                                                        Analysis
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center text-xs text-slate-400 gap-2">
                                            <Calendar size={12} />
                                            <span>{formatDate(project.dateCollected)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {hasAnalysis && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/analysis/${project.id}`);
                                                }}
                                                className="text-amber-600 hover:text-amber-700 text-sm font-medium flex items-center gap-1"
                                            >
                                                <FileText size={14} />
                                                Analysis
                                            </button>
                                        )}
                                        <div className="flex items-center text-blue-600 text-sm font-medium">
                                            View <ArrowRight size={14} className="ml-1" />
                                        </div>
                                    </div>
                                </div>

                                {/* Nested Scenarios */}
                                {scenarios.map(scenario => (
                                    <div
                                        key={scenario.id}
                                        className="pl-12 pr-4 py-3 bg-slate-50/50 hover:bg-slate-100 transition-colors flex items-center justify-between group cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-300"
                                        onClick={() => navigate(`/compare/${project.id}/${scenario.id}`)}
                                    >
                                        <div className="flex-1 min-w-0 pr-4 relative">
                                            {/* L-shaped connector visual */}
                                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-8 border-b border-l border-slate-200 rounded-bl-lg pointer-events-none"></div>

                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Scenario</span>
                                                <span className="font-medium text-slate-700 text-sm">
                                                    {scenario.versionName || 'Untitled Scenario'}
                                                </span>
                                            </div>
                                            <div className="flex items-center text-xs text-slate-400 gap-2">
                                                <Calendar size={12} />
                                                <span>{formatDate(scenario.dateCollected)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                                            Compare <ArrowRight size={14} className="ml-1" />
                                        </div>
                                    </div>
                                ))}
                            </React.Fragment>
                        );
                    })}

                    {projects.length === 0 && (
                        <div className="p-8 text-center text-slate-500 text-sm">
                            No org charts found for this account.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AccountCard;
