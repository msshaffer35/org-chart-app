import React, { useState, useEffect } from 'react';
import { Save, X, Check } from 'lucide-react';
import useStore from '../store';

const AnalysisPanel = ({
    projectId = null,
    comparisonId = null,
    leftProjectId = null,
    rightProjectId = null,
    initialData,
    onSave = null,
    onClose
}) => {
    const updateProject = useStore((state) => state.updateProject);

    // Detect if in comparison mode
    const isComparison = !!comparisonId;

    const [activeTab, setActiveTab] = useState('swot'); // 'swot' | 'notes'
    const [data, setData] = useState({
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        generalNotes: "",
        strategicAlignment: "",
        ...initialData
    });
    const [isSaving, setIsSaving] = useState(false);

    const [isSaved, setIsSaved] = useState(false);

    // Ensure nested objects exist
    useEffect(() => {
        if (initialData) {
            setData(prev => ({
                ...prev,
                ...initialData,
                swot: { ...prev.swot, ...(initialData.swot || {}) }
            }));
        }
    }, [initialData]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (isComparison && onSave) {
                // Comparison mode: Use parent's onSave handler
                await onSave(data);
            } else if (projectId) {
                // Single project mode: Update project metadata via store
                await updateProject(projectId, { analysis: data });
            }
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (error) {
            console.error("Failed to save analysis", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSwotChange = (type, index, value) => {
        const newSwot = { ...data.swot };
        newSwot[type][index] = value;
        setData({ ...data, swot: newSwot });
    };

    const addSwotItem = (type) => {
        const newSwot = { ...data.swot };
        if (!newSwot[type]) newSwot[type] = [];
        newSwot[type].push("");
        setData({ ...data, swot: newSwot });
    };

    const removeSwotItem = (type, index) => {
        const newSwot = { ...data.swot };
        newSwot[type].splice(index, 1);
        setData({ ...data, swot: newSwot });
    };

    return (
        <div className="h-full flex flex-col bg-white border-l border-slate-200 shadow-xl w-96 absolute right-0 top-0 z-30">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
                <div className="flex flex-col">
                    <h2 className="font-semibold text-slate-800">
                        {isComparison ? 'Comparison Analysis' : 'Analysis & Commentary'}
                    </h2>
                    {isComparison && (
                        <span className="text-xs text-slate-500 mt-0.5">
                            Comparing two organizations
                        </span>
                    )}
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200">
                <button
                    onClick={() => setActiveTab('swot')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'swot' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    SWOT Analysis
                </button>
                <button
                    onClick={() => setActiveTab('notes')}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === 'notes' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Notes & Strategy
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {activeTab === 'swot' ? (
                    <div className="space-y-6">
                        {['strengths', 'weaknesses', 'opportunities', 'threats'].map(type => (
                            <div key={type}>
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{type}</h3>
                                    <button
                                        onClick={() => addSwotItem(type)}
                                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {(data.swot[type] || []).map((item, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={(e) => handleSwotChange(type, idx, e.target.value)}
                                                className="flex-1 px-2 py-1 text-sm border border-slate-200 rounded focus:border-blue-500 outline-none"
                                                placeholder={`Add ${type.slice(0, -1)}...`}
                                            />
                                            <button
                                                onClick={() => removeSwotItem(type, idx)}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {(!data.swot[type] || data.swot[type].length === 0) && (
                                        <div className="text-xs text-slate-400 italic">No items added</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">General Notes</label>
                            <textarea
                                value={data.generalNotes}
                                onChange={(e) => setData({ ...data, generalNotes: e.target.value })}
                                className="w-full h-32 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none"
                                placeholder="Enter general observations..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Strategic Alignment</label>
                            <textarea
                                value={data.strategicAlignment}
                                onChange={(e) => setData({ ...data, strategicAlignment: e.target.value })}
                                className="w-full h-32 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:border-blue-500 outline-none resize-none"
                                placeholder="How does this structure align with future goals?"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg transition-colors disabled:opacity-50 ${isSaved ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                >
                    {isSaved ? <Check size={16} /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : (isSaved ? 'Saved!' : 'Save Analysis')}
                </button>
            </div>
        </div>
    );
};

export default AnalysisPanel;
