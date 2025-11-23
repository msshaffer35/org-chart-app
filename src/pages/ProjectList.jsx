import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Plus, Trash2, FolderOpen, Calendar, Building2, Briefcase } from 'lucide-react';

const ProjectList = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject, deleteProject } = useStore();
    const [isCreating, setIsCreating] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        account: '',
        department: '',
        dateCollected: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            const id = await createProject(formData);
            navigate(`/editor/${id}`);
        } catch (error) {
            console.error("Failed to create project", error);
        } finally {
            setIsCreating(false);
            setShowModal(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            await deleteProject(id);
        }
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

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
                        <p className="text-slate-500 mt-2">Manage your organization charts</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
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
                            onClick={() => setShowModal(true)}
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
                                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
                            >
                                <div className="h-24 bg-slate-100 flex items-center justify-center border-b border-slate-100 group-hover:bg-slate-50 transition-colors">
                                    <Building2 className="text-slate-300 group-hover:text-blue-400 transition-colors" size={40} />
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-slate-900 truncate pr-2" title={project.account}>
                                                {project.account || 'Untitled Account'}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Briefcase size={12} />
                                                {project.department || 'No Department'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, project.id)}
                                            className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                            title="Delete project"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-1">
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
                        ))}
                    </div>
                )}

                {/* Create Project Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">New Project</h2>
                            <form onSubmit={handleCreate}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Acme Corp"
                                            value={formData.account}
                                            onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Sales"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date Collected</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={formData.dateCollected}
                                            onChange={(e) => setFormData({ ...formData, dateCollected: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isCreating ? 'Creating...' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
