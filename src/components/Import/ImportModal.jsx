import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, ArrowRight, Check, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

const REQUIRED_FIELDS = [
    { key: 'id', label: 'Employee ID', required: true },
    { key: 'name', label: 'Name', required: true },
    { key: 'managerId', label: 'Manager ID', required: false }, // Can be empty for root
    { key: 'role', label: 'Role', required: false },
    { key: 'department', label: 'Department', required: false },
    { key: 'image', label: 'Image URL', required: false },
];

const ImportModal = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState('upload'); // upload, mapping
    const [file, setFile] = useState(null);
    const [csvHeaders, setCsvHeaders] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [mapping, setMapping] = useState({});
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    if (!isOpen) return null;

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const processFile = (file) => {
        setFile(file);
        Papa.parse(file, {
            header: true,
            preview: 5, // Get first 5 rows for preview
            complete: (results) => {
                if (results.meta && results.meta.fields) {
                    setCsvHeaders(results.meta.fields);
                    setPreviewData(results.data);

                    // Auto-map fields if matches found
                    const initialMapping = {};
                    REQUIRED_FIELDS.forEach(field => {
                        const match = results.meta.fields.find(h =>
                            h.toLowerCase().replace(/[^a-z0-9]/g, '') === field.key.toLowerCase() ||
                            h.toLowerCase().includes(field.key.toLowerCase())
                        );
                        if (match) {
                            initialMapping[field.key] = match;
                        }
                    });
                    setMapping(initialMapping);
                    setStep('mapping');
                    setError(null);
                } else {
                    setError('Could not parse CSV headers.');
                }
            },
            error: (err) => {
                setError('Error parsing CSV file: ' + err.message);
            }
        });
    };

    const handleMappingChange = (appField, csvHeader) => {
        setMapping(prev => ({
            ...prev,
            [appField]: csvHeader
        }));
    };

    const handleImport = () => {
        // Validate required fields
        const missing = REQUIRED_FIELDS.filter(f => f.required && !mapping[f.key]);
        if (missing.length > 0) {
            setError(`Please map the following required fields: ${missing.map(f => f.label).join(', ')}`);
            return;
        }

        // Parse full file with mapping
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const mappedData = results.data.map(row => {
                    // Skip empty rows
                    if (!Object.values(row).some(val => val)) return null;

                    const nodeData = {};
                    REQUIRED_FIELDS.forEach(field => {
                        const csvHeader = mapping[field.key];
                        if (csvHeader) {
                            nodeData[field.key] = row[csvHeader];
                        }
                    });
                    return nodeData;
                }).filter(Boolean);

                onImport(mappedData);
                onClose();
                // Reset state
                setStep('upload');
                setFile(null);
                setMapping({});
            }
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">Import Data</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {step === 'upload' ? (
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={32} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-1">Click to upload CSV</h3>
                            <p className="text-sm text-gray-500">or drag and drop file here</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                                accept=".csv"
                                className="hidden"
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600">
                                Map the columns from your CSV file to the corresponding fields in the Org Chart.
                            </p>

                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-4 py-3">App Field</th>
                                            <th className="px-4 py-3">CSV Column</th>
                                            <th className="px-4 py-3">Preview (Row 1)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {REQUIRED_FIELDS.map((field) => (
                                            <tr key={field.key} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-700">
                                                    {field.label}
                                                    {field.required && <span className="text-red-500 ml-1">*</span>}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <select
                                                        value={mapping[field.key] || ''}
                                                        onChange={(e) => handleMappingChange(field.key, e.target.value)}
                                                        className={`w-full p-2 border rounded-md outline-none focus:ring-2 focus:ring-blue-500 ${!mapping[field.key] && field.required ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                                                    >
                                                        <option value="">-- Select Column --</option>
                                                        {csvHeaders.map(header => (
                                                            <option key={header} value={header}>{header}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 truncate max-w-xs">
                                                    {mapping[field.key] ? (previewData[0]?.[mapping[field.key]] || '-') : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    {step === 'mapping' && (
                        <button
                            onClick={handleImport}
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-2 transition-all"
                        >
                            <Check size={16} />
                            Import Data
                        </button>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ImportModal;
