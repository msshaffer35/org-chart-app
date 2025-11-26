import React, { useState, useEffect, useMemo } from 'react';
import useStore from '../store';
import { X, Save, RotateCcw } from 'lucide-react';

const MappingManagerModal = ({ isOpen, onClose }) => {
    const { nodes, settings, updateSettings, applyFilter } = useStore();
    const { deidentificationSettings } = settings;

    const [activeTab, setActiveTab] = useState('titles'); // 'titles' or 'departments'
    const [localMappings, setLocalMappings] = useState({
        titleMappings: {},
        departmentMappings: {}
    });

    // Initialize local state from settings when modal opens
    useEffect(() => {
        if (isOpen) {
            setLocalMappings({
                titleMappings: { ...deidentificationSettings.titleMappings },
                departmentMappings: { ...deidentificationSettings.departmentMappings }
            });
        }
    }, [isOpen, deidentificationSettings]);

    // Extract unique values from nodes
    const uniqueValues = useMemo(() => {
        const titles = new Set();
        const departments = new Set();

        nodes.forEach(node => {
            if (node.data) {
                if (node.data.role) titles.add(node.data.role);
                if (node.data.department) departments.add(node.data.department);
            }
        });

        return {
            titles: Array.from(titles).sort(),
            departments: Array.from(departments).sort()
        };
    }, [nodes]);

    const handleMappingChange = (original, standard) => {
        const key = activeTab === 'titles' ? 'titleMappings' : 'departmentMappings';
        setLocalMappings(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [original]: standard
            }
        }));
    };

    const handleSave = () => {
        updateSettings({
            deidentificationSettings: {
                ...deidentificationSettings,
                titleMappings: localMappings.titleMappings,
                departmentMappings: localMappings.departmentMappings
            }
        });

        // Re-apply filter to update view immediately
        setTimeout(applyFilter, 0);
        onClose();
    };

    const handleReset = () => {
        if (window.confirm("Are you sure you want to discard changes?")) {
            setLocalMappings({
                titleMappings: { ...deidentificationSettings.titleMappings },
                departmentMappings: { ...deidentificationSettings.departmentMappings }
            });
        }
    };

    if (!isOpen) return null;

    const currentList = activeTab === 'titles' ? uniqueValues.titles : uniqueValues.departments;
    const currentMappings = activeTab === 'titles' ? localMappings.titleMappings : localMappings.departmentMappings;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Standardization Mappings</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'titles' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('titles')}
                    >
                        Job Titles
                    </button>
                    <button
                        className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'departments' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}
                        onClick={() => setActiveTab('departments')}
                    >
                        Departments
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-2 gap-4 mb-2 font-medium text-xs text-gray-500 uppercase tracking-wider">
                        <div>Original Value</div>
                        <div>Standardized Value</div>
                    </div>

                    <div className="space-y-3">
                        {currentList.map(original => (
                            <div key={original} className="grid grid-cols-2 gap-4 items-center">
                                <div className="text-sm text-gray-700 truncate" title={original}>
                                    {original}
                                </div>
                                <input
                                    type="text"
                                    value={currentMappings[original] || ''}
                                    placeholder={original}
                                    onChange={(e) => handleMappingChange(original, e.target.value)}
                                    className="w-full text-sm border border-gray-300 rounded px-3 py-1.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                                />
                            </div>
                        ))}
                        {currentList.length === 0 && (
                            <div className="text-center text-gray-400 py-8 text-sm">
                                No {activeTab} found in the current chart.
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50 rounded-b-lg">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                    >
                        <RotateCcw size={16} />
                        Reset
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium shadow-sm transition-colors"
                        >
                            <Save size={16} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MappingManagerModal;
