import React, { useRef } from 'react';
import { UserPlus, FilePlus, Trash2, Upload } from 'lucide-react';
import useStore from '../../store/useStore';
import { parseCSV } from '../../utils/csvImporter';
import { getLayoutedElements } from '../../utils/layout';

const LeftPanel = () => {
    const resetChart = useStore((state) => state.resetChart);
    const setNodes = useStore((state) => state.setNodes);
    const setEdges = useStore((state) => state.setEdges);
    const fileInputRef = useRef(null);

    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    const handleNewChart = () => {
        if (window.confirm('Are you sure you want to create a new chart? All unsaved changes will be lost.')) {
            resetChart();
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        parseCSV(file, ({ nodes: newNodes, edges: newEdges }) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                newNodes,
                newEdges,
                'TB'
            );
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
        });

        // Reset input
        event.target.value = '';
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-sm">
            <div className="p-4 border-b border-gray-200">
                <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-blue-600">Org</span>Builder
                </h1>
            </div>

            <div className="p-4 flex flex-col gap-4">
                <div className="space-y-2">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</h2>
                    <button
                        onClick={handleNewChart}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                    >
                        <FilePlus size={16} />
                        New Chart
                    </button>
                    <button
                        onClick={handleImportClick}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                    >
                        <Upload size={16} />
                        Import CSV
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept=".csv"
                        className="hidden"
                    />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Toolbox</h2>
                    <div
                        className="p-3 bg-white border border-gray-200 rounded-lg shadow-sm cursor-grab hover:border-blue-400 hover:shadow-md transition-all flex items-center gap-3"
                        onDragStart={(event) => onDragStart(event, 'org')}
                        draggable
                    >
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            <UserPlus size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-700">Employee Card</p>
                            <p className="text-xs text-gray-400">Drag to canvas</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-gray-200">
                <p className="text-xs text-gray-400 text-center">
                    v1.0.0 • Local Storage
                </p>
            </div>
        </aside>
    );
};

export default LeftPanel;
