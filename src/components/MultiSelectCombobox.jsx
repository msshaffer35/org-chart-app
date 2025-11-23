import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

const MultiSelectCombobox = ({
    label,
    options = [],
    selectedValues = [],
    onChange,
    placeholder = "Select..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef(null);

    // Filter options based on search term
    const filteredOptions = useMemo(() => {
        return options.filter(option =>
            option.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [options, searchTerm]);

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option) => {
        const newSelected = selectedValues.includes(option)
            ? selectedValues.filter(v => v !== option)
            : [...selectedValues, option];
        onChange(newSelected);
    };

    const clearSelection = (e) => {
        e.stopPropagation();
        onChange([]);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Trigger Button */}
            <div
                className={`w-full flex items-center justify-between px-3 py-1.5 text-sm border rounded-lg cursor-pointer bg-white transition-colors ${isOpen ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300'
                    }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    <span className={`truncate ${selectedValues.length === 0 ? 'text-slate-500' : 'text-slate-900'}`}>
                        {selectedValues.length === 0
                            ? placeholder
                            : selectedValues.length === 1
                                ? selectedValues[0]
                                : `${label} (${selectedValues.length})`}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {selectedValues.length > 0 && (
                        <div
                            role="button"
                            onClick={clearSelection}
                            className="p-0.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X size={14} />
                        </div>
                    )}
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 flex flex-col max-h-64 animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-slate-100 sticky top-0 bg-white rounded-t-lg">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                placeholder={`Search ${label}...`}
                                className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1 py-1">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-slate-500 text-center">
                                No results found
                            </div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = selectedValues.includes(option);
                                return (
                                    <div
                                        key={option}
                                        className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 hover:bg-slate-50 transition-colors ${isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                                            }`}
                                        onClick={() => toggleOption(option)}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                                            }`}>
                                            {isSelected && <Check size={10} className="text-white" />}
                                        </div>
                                        <span className="truncate">{option}</span>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer with counts */}
                    <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between rounded-b-lg">
                        <span>{selectedValues.length} selected</span>
                        {selectedValues.length > 0 && (
                            <button
                                onClick={() => onChange([])}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiSelectCombobox;
