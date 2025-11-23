import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Plus, Trash2, FolderOpen, Calendar } from 'lucide-react';

const ProjectList = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject, deleteProject } = useStore();
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            const id = await createProject(`Project ${new Date().toLocaleDateString()}`);
            navigate(`/editor/${id}`);
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            await deleteProject(id);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
                        <p className="text-slate-500 mt-2">Manage your organization charts</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        disabled={isCreating}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <Plus size={20} />
                        New Project
                    </button>
                </div>

                {projectList.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FolderOpen className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No projects yet</h3>
                        <p className="text-slate-500 mt-2 mb-6">Create your first organization chart to get started</p>
                        <button
                            onClick={handleCreate}
                            className="text-blue-600 font-medium hover:text-blue-700"
                        >
                            Create a project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projectList.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/editor/${project.id}`)}
                                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden"
                            >
                                <div className="h-32 bg-slate-100 flex items-center justify-center border-b border-slate-100 group-hover:bg-slate-50 transition-colors">
                                    <FolderOpen className="text-slate-300 group-hover:text-blue-400 transition-colors" size={48} />
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-semibold text-slate-900 truncate pr-4">{project.name}</h3>
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                            title="Delete project"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center text-xs text-slate-500 mt-4">
                                        <Calendar size={14} className="mr-1.5" />
                                        <span>Last modified: {new Date(project.lastModified).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
