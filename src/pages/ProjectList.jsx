import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Plus, Trash2, FolderOpen, Calendar, Building2, Briefcase, Pencil, Search, Filter, ArrowUpDown } from 'lucide-react';

const ProjectList = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject, updateProject, deleteProject } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('All');
    const [sortBy, setSortBy] = useState('dateCollected-desc'); // dateCollected-desc, dateCollected-asc, account-asc, lastModified-desc

    // Form State
    const [formData, setFormData] = useState({
        account: '',
        department: '',
        dateCollected: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

    // Derived Data
    const departments = useMemo(() => {
        const depts = new Set(projectList.map(p => p.department).filter(Boolean));
        return ['All', ...Array.from(depts).sort()];
    }, [projectList]);

    const filteredProjects = useMemo(() => {
        return projectList
            .filter(project => {
                const matchesSearch = (project.account || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesDept = selectedDept === 'All' || project.department === selectedDept;
                return matchesSearch && matchesDept;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'dateCollected-desc':
                        return new Date(b.dateCollected || 0) - new Date(a.dateCollected || 0);
                    case 'dateCollected-asc':
                        return new Date(a.dateCollected || 0) - new Date(b.dateCollected || 0);
                    case 'account-asc':
                        return (a.account || '').localeCompare(b.account || '');
                    case 'lastModified-desc':
                        return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
                    default:
                        return 0;
                }
            });
    }, [projectList, searchQuery, selectedDept, sortBy]);

    const openCreateModal = () => {
        setEditingProject(null);
        setFormData({
            account: '',
            department: '',
            dateCollected: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const openEditModal = (e, project) => {
        e.stopPropagation();
        setEditingProject(project);
        setFormData({
            account: project.account || '',
            department: project.department || '',
            dateCollected: project.dateCollected || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingProject) {
                await updateProject(editingProject.id, formData);
            } else {
                const id = await createProject(formData);
                navigate(`/editor/${id}`);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Failed to save project", error);
        } finally {
            setIsSubmitting(false);
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
                        <p className="text-slate-500 mt-2">Manage your organization charts</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        New Project
                    </button>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-48">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                            >
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative flex-1 md:w-56">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="dateCollected-desc">Date Collected (Newest)</option>
                                <option value="dateCollected-asc">Date Collected (Oldest)</option>
                                <option value="account-asc">Account Name (A-Z)</option>
                                <option value="lastModified-desc">Last Modified</option>
                            </select>
                        </div>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No projects found</h3>
                        <p className="text-slate-500 mt-2 mb-6">
                            {projectList.length === 0
                                ? "Create your first organization chart to get started"
                                : "Try adjusting your search or filters"}
                        </p>
                        {projectList.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="text-blue-600 font-medium hover:text-blue-700"
                            >
                                Create a project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
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
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate pr-2" title={project.account}>
                                                {project.account || 'Untitled Account'}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1">
                                                <Briefcase size={12} />
                                                {project.department || 'No Department'}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => openEditModal(e, project)}
                                                className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50"
                                                title="Edit project"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                                title="Delete project"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
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

                {/* Create/Edit Project Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                {editingProject ? 'Edit Project' : 'New Project'}
                            </h2>
                            <form onSubmit={handleSubmit}>
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
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create Project')}
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
