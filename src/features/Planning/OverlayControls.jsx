import React from 'react';
import { Layers, AlertCircle, Users } from 'lucide-react';

const OverlayControls = ({ activeOverlay, onToggleOverlay }) => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-md w-64 mt-4">
            <div className="flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-gray-600" />
                <h3 className="font-bold text-gray-700 text-sm">Data Overlays</h3>
            </div>

            <div className="space-y-2">
                <button
                    onClick={() => onToggleOverlay('skills')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${activeOverlay === 'skills'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <AlertCircle className="w-4 h-4" />
                    <span>Skills Gaps</span>
                </button>

                <button
                    onClick={() => onToggleOverlay('scrum')}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${activeOverlay === 'scrum'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    <span>Scrum Teams</span>
                </button>
            </div>
        </div>
    );
};

export default OverlayControls;
