import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { comparisonStorageService } from '../../services/comparisonStorageService';
import { FileText, Trash2, ExternalLink, Edit2, Check, X, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

const AnalysisList = () => {
    const navigate = useNavigate();
    const [analyses, setAnalyses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');

    // Search, Filter, Sort, Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortOption, setSortOption] = useState('date-desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

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

    // Filter and Sort Logic
    const filteredAndSortedAnalyses = React.useMemo(() => {
        let result = [...analyses];

        // Filter by Search Term
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(a => {
                // Match displayed name (handle empty name)
                const displayedName = a.name || 'Untitled Analysis';
                const nameMatch = displayedName.toLowerCase().includes(lowerTerm);

                // Match displayed type label
                const displayedType = getAnalysisTypeLabel(a.type);
                const typeMatch = displayedType.toLowerCase().includes(lowerTerm);

                // Check meta fields for project names
                const meta = a.meta || {};
                const leftMatch = meta.leftName && meta.leftName.toLowerCase().includes(lowerTerm);
                const rightMatch = meta.rightName && meta.rightName.toLowerCase().includes(lowerTerm);
                const baseMatch = meta.baseName && meta.baseName.toLowerCase().includes(lowerTerm);
                const targetMatch = meta.targetName && meta.targetName.toLowerCase().includes(lowerTerm);
                const singleMatch = meta.name && meta.name.toLowerCase().includes(lowerTerm); // For single analysis

                return nameMatch || typeMatch || leftMatch || rightMatch || baseMatch || targetMatch || singleMatch;
            });
        }

        // Filter by Type
        if (filterType !== 'all') {
            result = result.filter(a => a.type === filterType);
        }

        // Sort
        result.sort((a, b) => {
            switch (sortOption) {
                case 'date-desc':
                    return (b.lastModified || 0) - (a.lastModified || 0);
                case 'date-asc':
                    return (a.lastModified || 0) - (b.lastModified || 0);
                case 'name-asc':
                    return (a.name || '').localeCompare(b.name || '');
                case 'name-desc':
                    return (b.name || '').localeCompare(a.name || '');
                default:
                    return 0;
            }
        });

        return result;
    }, [analyses, searchTerm, filterType, sortOption]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredAndSortedAnalyses.length / itemsPerPage);
    const paginatedAnalyses = filteredAndSortedAnalyses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filterType, sortOption]);

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading analyses...</div>;
    }

    return (
        <div className="space-y-4">
            {/* Controls Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search analyses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="all">All Types</option>
                            <option value="side-by-side">Side-by-Side</option>
                            <option value="temporal">Temporal</option>
                            <option value="single">Single</option>
                        </select>
                    </div>

                    <div className="relative">
                        <ArrowUpDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="date-desc">Newest First</option>
                            <option value="date-asc">Oldest First</option>
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Analysis List */}
            {analyses.length === 0 ? (
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
            ) : filteredAndSortedAnalyses.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <p className="text-slate-500">No analyses match your search filters.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setFilterType('all'); }}
                        className="mt-2 text-purple-600 hover:text-purple-700 font-medium"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
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
                            {paginatedAnalyses.map((analysis) => (
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

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
                            <div className="text-sm text-slate-500">
                                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedAnalyses.length)}</span> of <span className="font-medium">{filteredAndSortedAnalyses.length}</span> results
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-sm font-medium text-slate-700">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-slate-300 rounded-md bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AnalysisList;
