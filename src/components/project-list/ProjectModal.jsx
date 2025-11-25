import React from 'react';

const ProjectModal = ({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    editingProject,
    formData,
    setFormData
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                    {editingProject ? 'Edit Project' : 'New Project'}
                </h2>
                <form onSubmit={onSubmit}>
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
                            onClick={onClose}
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
    );
};

export default ProjectModal;
