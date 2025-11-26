import React, { useRef, useEffect } from 'react';
import { Search, Building2, ChevronDown, Check, Filter, ArrowUpDown } from 'lucide-react';
import MultiSelectCombobox from '../../components/MultiSelectCombobox';

const ProjectFilters = ({
    viewMode,
    globalSearch, setGlobalSearch,
    selectedAccount, setSelectedAccount,
    accountSearch, setAccountSearch,
    isAccountDropdownOpen, setIsAccountDropdownOpen,
    filteredAccounts,
    selectedDept, setSelectedDept,
    deptSearch, setDeptSearch,
    isDeptDropdownOpen, setIsDeptDropdownOpen,
    filteredDepartments,
    sortBy, setSortBy,
    functions, selectedFunctions, setSelectedFunctions,
    subFunctions, selectedSubFunctions, setSelectedSubFunctions,
    employeeTypes, selectedEmployeeTypes, setSelectedEmployeeTypes,
    regions, selectedRegions, setSelectedRegions,
    scrumTeams, selectedScrumTeams, setSelectedScrumTeams,
    coes, selectedCoes, setSelectedCoes,
    selectedProjectTypes, setSelectedProjectTypes
}) => {
    const accountDropdownRef = useRef(null);
    const deptDropdownRef = useRef(null);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
                setIsAccountDropdownOpen(false);
            }
            if (deptDropdownRef.current && !deptDropdownRef.current.contains(event.target)) {
                setIsDeptDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsAccountDropdownOpen, setIsDeptDropdownOpen]);

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col gap-4">
            {/* Global Search */}
            <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Search all fields (Account, Department, Date)..."
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                {/* Account Combobox */}
                <div className="relative flex-1" ref={accountDropdownRef}>
                    <div
                        className="relative cursor-pointer"
                        onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                    >
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            readOnly
                            placeholder="Filter by Account"
                            className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white"
                            value={selectedAccount === 'All' ? 'All Accounts' : selectedAccount}
                        />
                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${isAccountDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                    </div>

                    {isAccountDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                            <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                                <input
                                    type="text"
                                    placeholder="Type to filter accounts..."
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
                                    value={accountSearch}
                                    onChange={(e) => setAccountSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                            <div className="py-1">
                                {filteredAccounts.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-slate-500">No accounts found</div>
                                ) : (
                                    filteredAccounts.map(acc => (
                                        <div
                                            key={acc}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between ${selectedAccount === acc ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}
                                            onClick={() => {
                                                setSelectedAccount(acc);
                                                setIsAccountDropdownOpen(false);
                                                setAccountSearch('');
                                            }}
                                        >
                                            <span>{acc === 'All' ? 'All Accounts' : acc}</span>
                                            {selectedAccount === acc && <Check size={14} />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Department Combobox */}
                <div className="relative flex-1" ref={deptDropdownRef}>
                    <div
                        className="relative cursor-pointer"
                        onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    >
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            readOnly
                            placeholder="Filter by Department"
                            className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer bg-white"
                            value={selectedDept === 'All' ? 'All Departments' : selectedDept}
                        />
                        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} size={16} />
                    </div>

                    {isDeptDropdownOpen && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                            <div className="p-2 sticky top-0 bg-white border-b border-slate-100">
                                <input
                                    type="text"
                                    placeholder="Type to filter departments..."
                                    className="w-full px-3 py-1.5 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-blue-500"
                                    value={deptSearch}
                                    onChange={(e) => setDeptSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                    autoFocus
                                />
                            </div>
                            <div className="py-1">
                                {filteredDepartments.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-slate-500">No departments found</div>
                                ) : (
                                    filteredDepartments.map(dept => (
                                        <div
                                            key={dept}
                                            className={`px-4 py-2 text-sm cursor-pointer hover:bg-slate-50 flex items-center justify-between ${selectedDept === dept ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}
                                            onClick={() => {
                                                setSelectedDept(dept);
                                                setIsDeptDropdownOpen(false);
                                                setDeptSearch('');
                                            }}
                                        >
                                            <span>{dept === 'All' ? 'All Departments' : dept}</span>
                                            {selectedDept === dept && <Check size={14} />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sort Options - Only show in Grid Mode */}
                {viewMode === 'grid' && (
                    <div className="relative flex-1">
                        <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white cursor-pointer"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="dateCollected-desc">Date Collected (Newest)</option>
                            <option value="dateCollected-asc">Date Collected (Oldest)</option>
                            <option value="account-asc">Account Name (A-Z)</option>
                            <option value="lastModified-desc">Last Modified</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                )}
            </div>

            {/* Extended Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100">
                <MultiSelectCombobox
                    label="Function"
                    options={functions}
                    selectedValues={selectedFunctions}
                    onChange={setSelectedFunctions}
                    placeholder="All Functions"
                />
                <MultiSelectCombobox
                    label="Sub-Function"
                    options={subFunctions}
                    selectedValues={selectedSubFunctions}
                    onChange={setSelectedSubFunctions}
                    placeholder="All Sub-Functions"
                />
                <MultiSelectCombobox
                    label="Emp Type"
                    options={employeeTypes}
                    selectedValues={selectedEmployeeTypes}
                    onChange={setSelectedEmployeeTypes}
                    placeholder="All Emp Types"
                />
                <MultiSelectCombobox
                    label="Region"
                    options={regions}
                    selectedValues={selectedRegions}
                    onChange={setSelectedRegions}
                    placeholder="All Regions"
                />
                <MultiSelectCombobox
                    label="Scrum Team"
                    options={scrumTeams}
                    selectedValues={selectedScrumTeams}
                    onChange={setSelectedScrumTeams}
                    placeholder="All Scrum Teams"
                />
                <MultiSelectCombobox
                    label="COE"
                    options={coes}
                    selectedValues={selectedCoes}
                    onChange={setSelectedCoes}
                    placeholder="All COEs"
                />
            </div>

            {/* Project Type Filter Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100">
                <MultiSelectCombobox
                    label="Project Type"
                    options={['Charts', 'Analyzed Projects', 'Scenarios']}
                    selectedValues={selectedProjectTypes}
                    onChange={setSelectedProjectTypes}
                    placeholder="All Project Types"
                />
            </div>
        </div>
    );
};

export default ProjectFilters;
