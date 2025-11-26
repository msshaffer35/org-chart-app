import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, ChevronRight, Briefcase, Target, Pencil, Trash2, Calendar, FileText } from 'lucide-react';

const ProjectCard = ({ project, onEdit, onDelete, onCreateScenario }) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    const hasAnalysis = project.analysis && (
        (project.analysis.swot && Object.values(project.analysis.swot).some(arr => arr.length > 0)) ||
        project.analysis.generalNotes ||
        project.analysis.strategicAlignment
    );

    return (
        <div
            className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col relative"
        >
            <div className="h-24 bg-slate-100 flex items-center justify-center border-b border-slate-100 group-hover:bg-slate-50 transition-colors relative">
                <Building2 className="text-slate-300 group-hover:text-blue-400 transition-colors" size={40} />

                {/* Expand Toggle for Tree View */}
                {project.children && project.children.length > 0 && (
                    <button
                        onClick={toggleExpand}
                        className="absolute top-2 left-2 p-1 bg-white/80 rounded-full hover:bg-white text-slate-500 hover:text-blue-600 transition-colors shadow-sm z-10"
                        title={isExpanded ? "Collapse Scenarios" : "Show Scenarios"}
                    >
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                )}

                {/* Tag Badges Overlay */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                    {project.coes && project.coes.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full" title={`COE: ${project.coes.join(', ')}`}>COE</span>
                    )}
                    {project.scrumTeams && project.scrumTeams.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-medium rounded-full" title={`Scrum: ${project.scrumTeams.join(', ')}`}>Scrum</span>
                    )}
                    {hasAnalysis && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-medium rounded-full flex items-center gap-1">
                            <FileText size={10} />
                            Analysis
                        </span>
                    )}
                </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate pr-2" title={project.account}>
                            {project.account || 'Untitled Account'}
                        </h3>
                        <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                            <Briefcase size={12} />
                            {project.department || 'No Department'}
                        </p>

                        {/* Tags Summary */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {project.functions && project.functions.slice(0, 2).map(f => (
                                <span key={f} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200">{f}</span>
                            ))}
                            {project.functions && project.functions.length > 2 && (
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200">+{project.functions.length - 2}</span>
                            )}

                            {project.employeeTypes && project.employeeTypes.slice(0, 2).map(et => (
                                <span key={et} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100">{et}</span>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={(e) => onCreateScenario(e, project)}
                            className="text-slate-400 hover:text-green-500 transition-colors p-1 rounded-md hover:bg-green-50"
                            title="Create Scenario / Future Version"
                        >
                            <Target size={18} />
                        </button>
                        <button
                            onClick={(e) => onEdit(e, project)}
                            className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50"
                            title="Edit project"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={(e) => onDelete(e, project.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                            title="Delete project"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>

                </div>

                <div className="mt-auto pt-4 space-y-3">
                    {/* Action Buttons - Always visible on mobile, hover on desktop */}
                    <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/project/${project.id}`);
                            }}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Building2 size={16} />
                            View Chart
                        </button>
                        {hasAnalysis && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/analysis/${project.id}`);
                                }}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                <FileText size={16} />
                                View Analysis
                            </button>
                        )}
                    </div>

                    {/* Date Footer */}
                    <div className="border-t border-slate-100 pt-3 space-y-1">
                        <div className="flex items-center text-xs text-slate-500">
                            <Calendar size={12} className="mr-1.5" />
                            <span>Collected: {formatDate(project.dateCollected)}</span>
                        </div>
                        <div className="flex items-center text-xs text-slate-400">
                            <span className="ml-4.5">Modified: {formatDate(project.lastModified)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Child Count Badge */}
            {project.children && project.children.length > 0 && (
                <div className="absolute top-2 right-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 shadow-sm z-10">
                    {project.children.length} Scenario{project.children.length !== 1 ? 's' : ''}
                </div>
            )}

            {/* Nested Scenarios (Inside Card) */}
            {isExpanded && project.children && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                    {project.children.map(scenario => (
                        <div
                            key={scenario.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/compare/${project.id}/${scenario.id}`);
                            }}
                            className="px-5 py-3 hover:bg-slate-100 transition-colors flex items-center justify-between group/scenario cursor-pointer border-l-4 border-l-transparent hover:border-l-purple-300 relative"
                        >
                            {/* Indentation Visual */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover/scenario:bg-purple-300 transition-colors"></div>

                            <div className="flex-1 min-w-0 pl-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider flex-none">Scenario</span>
                                    <h4 className="font-medium text-slate-900 truncate text-sm">{scenario.versionName || 'Untitled Scenario'}</h4>
                                </div>
                                <div className="flex items-center text-xs text-slate-400 gap-2 pl-1">
                                    <Calendar size={10} />
                                    <span>{formatDate(scenario.dateCollected)}</span>
                                </div>
                            </div>

                            <div className="flex gap-1 opacity-0 group-hover/scenario:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => onDelete(e, scenario.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                    title="Delete scenario"
                                >
                                    <Trash2 size={14} />
                                </button>
                                <div className="text-purple-600 flex items-center text-xs font-medium ml-1">
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectCard;
