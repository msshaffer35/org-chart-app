import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comparisonStorageService } from '../../services/comparisonStorageService';
import { FileText, Trash2, ExternalLink, Edit2, Check, X } from 'lucide-react';

const AnalysisList = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    const loadAnalyses = () => {
        setLoading(true);
        try {
            const list = comparisonStorageService.listAnalyses();
            setAnalyses(list);
        } catch (error) {
            console.error("Failed to load analyses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalyses();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this analysis?')) {
            await comparisonStorageService.deleteAnalysis(id);
            loadAnalyses();
        }
    };

    const handleStartEdit = (analysis) => {
        setEditingId(analysis.id);
        setEditName(analysis.name || 'Untitled Analysis');
    };

    const handleSaveEdit = async () => {
        if (editName.trim()) {
            await comparisonStorageService.renameAnalysis(editingId, editName);
            setEditingId(null);
            loadAnalyses();
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditName('');
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        return new Date(timestamp).toLocaleDateString() + ' ' + new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getAnalysisTypeLabel = (type) => {
        switch (type) {
            case 'side-by-side': return 'Side-by-Side Comparison';
            case 'temporal': return 'Time Comparison';
            case 'single': return 'Single Analysis';
            default: return type || 'Analysis';
        }
    };

    const getBadgeStyles = (type) => {
        switch (type) {
            case 'side-by-side':
                return 'bg-purple-100 text-purple-800';
            case 'temporal':
                return 'bg-blue-100 text-blue-800';
            case 'single':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };

    const renderProjectsInvolved = (analysis) => {
        const { type, meta } = analysis;

        if (type === 'side-by-side' && meta?.leftName && meta?.rightName) {
            return (
                <div className="flex flex-col text-xs">
                    <span>{meta.leftName}</span>
                    <span className="text-slate-400">vs</span>
                    <span>{meta.rightName}</span>
                </div>
            );
        }

        if (type === 'temporal' && meta?.baseName && meta?.targetName) {
            return (
                <div className="flex flex-col text-xs">
                    <span>{meta.baseName} <span className="text-slate-400">(before)</span></span>
                    <span>{meta.targetName} <span className="text-slate-400">(after)</span></span>
                </div>
            );
        }

        if (type === 'single' && meta?.name) {
            return <span className="text-xs">{meta.name}</span>;
        }

        return <span className="text-slate-400 italic text-xs">Unknown Projects</span>;
    };

    const getAnalysisRoute = (analysis) => {
        switch (analysis.type) {
            case 'side-by-side':
                return `/analysis/side-by-side/${analysis.id}`;
            case 'temporal':
                return `/analysis/temporal/${analysis.id}`;
            case 'single':
                return `/analysis/single/${analysis.id}`;
            default:
                return `/analysis/side-by-side/${analysis.id}`;
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading analyses...</div>;
    }

    if (analyses.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-purple-500" size={32} />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No saved analyses</h3>
                <p className="text-slate-500 mt-2 mb-6">
                    Start a new analysis to compare organizations or track changes.
                </p>
                <button
                    onClick={() => navigate('/analysis/new')}
                    className="text-purple-600 font-medium hover:text-purple-700"
                >
                    Start New Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 font-semibold text-slate-700">Analysis Name</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Type</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Projects Involved</th>
                        <th className="px-6 py-4 font-semibold text-slate-700">Last Modified</th>
                        <th className="px-6 py-4 font-semibold text-slate-700 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {analyses.map((analysis) => (
                        <tr key={analysis.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                {editingId === analysis.id ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="px-2 py-1 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            autoFocus
                                        />
                                        <button onClick={handleSaveEdit} className="text-green-600 hover:bg-green-50 p-1 rounded">
                                            <Check size={16} />
                                        </button>
                                        <button onClick={handleCancelEdit} className="text-red-500 hover:bg-red-50 p-1 rounded">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group">
                                        <span className="font-medium text-slate-800">
                                            {analysis.name || 'Untitled Analysis'}
                                        </span>
                                        <button
                                            onClick={() => handleStartEdit(analysis)}
                                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeStyles(analysis.type)}`}>
                                    {getAnalysisTypeLabel(analysis.type)}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                                {renderProjectsInvolved(analysis)}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                                {formatDate(analysis.lastModified)}
                            </td>
                            <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                    <button
                                        onClick={() => navigate(getAnalysisRoute(analysis))}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                                    >
                                        Open <ExternalLink size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(analysis.id)}
                                        className="text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AnalysisList;
