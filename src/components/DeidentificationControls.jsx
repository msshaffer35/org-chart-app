import React, { useState } from 'react';
import useStore from '../store/useStore';
import { Shield, ShieldAlert, Settings, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import MappingManagerModal from './MappingManagerModal';

const DeidentificationControls = () => {
    const { settings, updateSettings, applyFilter } = useStore();
    const { deidentifiedMode, deidentificationSettings } = settings;
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const toggleMode = () => {
        updateSettings({ deidentifiedMode: !deidentifiedMode });
        // Need to trigger filter re-application
        setTimeout(applyFilter, 0);
    };

    const updateDeidSettings = (newSettings) => {
        updateSettings({
            deidentificationSettings: {
                ...deidentificationSettings,
                ...newSettings
            }
        });
        setTimeout(applyFilter, 0);
    };

    return (
        <>
            <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 w-64 space-y-3 mt-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        {deidentifiedMode ? <Shield className="text-green-500" size={16} /> : <ShieldAlert className="text-gray-400" size={16} />}
                        De-identification
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Enable Mode</span>
                    <button
                        onClick={toggleMode}
                        className={`
                            w-10 h-5 flex items-center rounded-full p-1 duration-300 ease-in-out
                            ${deidentifiedMode ? 'bg-green-500' : 'bg-gray-300'}
                        `}
                    >
                        <div
                            className={`
                                bg-white w-3 h-3 rounded-full shadow-md transform duration-300 ease-in-out
                                ${deidentifiedMode ? 'translate-x-5' : ''}
                            `}
                        />
                    </button>
                </div>

                {isExpanded && (
                    <div className="space-y-3 pt-2 border-t border-gray-50">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500">Max Levels to Show</label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                value={deidentificationSettings.maxLevels}
                                onChange={(e) => updateDeidSettings({ maxLevels: parseInt(e.target.value) || 0 })}
                                className="w-full text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
                            />
                            <p className="text-[10px] text-gray-400">0 for unlimited. Hides nodes below this level.</p>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-gray-500">Standardization</label>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full flex items-center justify-center gap-2 px-2 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded border border-gray-200 text-xs font-medium transition-colors"
                            >
                                <Edit2 size={12} />
                                Manage Mappings
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <MappingManagerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default DeidentificationControls;
