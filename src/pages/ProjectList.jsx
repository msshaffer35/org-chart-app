import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { Plus, Trash2, FolderOpen, Calendar, Building2, Briefcase, Pencil, Search, Filter, ArrowUpDown, ChevronDown, Check, RefreshCw, Users, Globe, Target, Layers } from 'lucide-react';
import { storageService } from '../services/storageService';

const ProjectList = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject, updateProject, deleteProject } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Search & Filter State
    const [globalSearch, setGlobalSearch] = useState('');

    // Account Filter State
    const [selectedAccount, setSelectedAccount] = useState('All');
    const [accountSearch, setAccountSearch] = useState('');
    const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);

    // Department Filter State
    const [selectedDept, setSelectedDept] = useState('All');
    const [deptSearch, setDeptSearch] = useState('');
    const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

    // New Filters
    const [selectedFunction, setSelectedFunction] = useState('All');
    const [selectedSubFunction, setSelectedSubFunction] = useState('All');
    const [selectedEmployeeType, setSelectedEmployeeType] = useState('All');
    const [selectedRegion, setSelectedRegion] = useState('All');
    const [selectedScrum, setSelectedScrum] = useState('All');
    const [selectedCoe, setSelectedCoe] = useState('All');

    const [sortBy, setSortBy] = useState('dateCollected-desc');

    const accountDropdownRef = useRef(null);
    const deptDropdownRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        account: '',
        department: '',
        dateCollected: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

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
    }, []);

    // Derived Data
    const accounts = useMemo(() => {
        const accs = new Set(projectList.map(p => p.account).filter(Boolean));
        return ['All', ...Array.from(accs).sort()];
    }, [projectList]);

    const departments = useMemo(() => {
        const depts = new Set(projectList.map(p => p.department).filter(Boolean));
        return ['All', ...Array.from(depts).sort()];
    }, [projectList]);

    // Helper to extract unique values from arrays or single values
    const getUniqueValues = (field) => {
        const values = new Set();
        projectList.forEach(p => {
            if (Array.isArray(p[field])) {
                p[field].forEach(v => v && values.add(v));
            } else if (p[field]) {
                values.add(p[field]);
            }
        });
        return ['All', ...Array.from(values).sort()];
    };

    const functions = useMemo(() => getUniqueValues('functions'), [projectList]);
    const subFunctions = useMemo(() => getUniqueValues('subFunctions'), [projectList]);
    const employeeTypes = useMemo(() => getUniqueValues('employeeTypes'), [projectList]);
    const regions = useMemo(() => getUniqueValues('regions'), [projectList]);
    const scrumTeams = useMemo(() => getUniqueValues('scrumTeams'), [projectList]);
    const coes = useMemo(() => getUniqueValues('coes'), [projectList]);

    const handleRefreshMetadata = async () => {
        setIsRefreshing(true);
        try {
            await storageService.refreshAllProjectMetadata();
            loadProjects();
        } catch (error) {
            console.error("Failed to refresh metadata", error);
            alert("Failed to refresh metadata. Please try again.");
        } finally {
            setIsRefreshing(false);
        }
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter(acc =>
            acc.toLowerCase().includes(accountSearch.toLowerCase())
        );
    }, [accounts, accountSearch]);

    const filteredDepartments = useMemo(() => {
        return departments.filter(dept =>
            dept.toLowerCase().includes(deptSearch.toLowerCase())
        );
    }, [departments, deptSearch]);

    const filteredProjects = useMemo(() => {
        return projectList
            .filter(project => {
                // Global Search (Account, Dept, Date, and new tags)
                const searchLower = globalSearch.toLowerCase();

                const checkTags = (tags) => {
                    if (!tags) return false;
                    if (Array.isArray(tags)) {
                        return tags.some(t => t.toLowerCase().includes(searchLower));
                    }
                    return tags.toLowerCase().includes(searchLower);
                };

                const matchesGlobal =
                    (project.account || '').toLowerCase().includes(searchLower) ||
                    (project.department || '').toLowerCase().includes(searchLower) ||
                    checkTags(project.functions) ||
                    checkTags(project.subFunctions) ||
                    checkTags(project.employeeTypes) ||
                    checkTags(project.regions) ||
                    checkTags(project.scrumTeams) ||
                    checkTags(project.coes) ||
                    (() => {
                        if (!project.dateCollected) return false;
                        const date = new Date(project.dateCollected);
                        // Check against multiple formats
                        const fullDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase(); // "january 22, 2024"
                        const shortDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).toLowerCase(); // "jan 22, 2024"
                        const numericDate = date.toLocaleDateString('en-US').toLowerCase(); // "1/22/2024"
                        const isoDate = project.dateCollected.toLowerCase(); // "2024-01-22"

                        return fullDate.includes(searchLower) ||
                            shortDate.includes(searchLower) ||
                            numericDate.includes(searchLower) ||
                            isoDate.includes(searchLower);
                    })();

                // Account Filter
                const matchesAccount = selectedAccount === 'All' || project.account === selectedAccount;

                // Department Filter
                const matchesDept = selectedDept === 'All' || project.department === selectedDept;

                // New Filters
                const matchesFunction = selectedFunction === 'All' || (project.functions && project.functions.includes(selectedFunction));
                const matchesSubFunction = selectedSubFunction === 'All' || (project.subFunctions && project.subFunctions.includes(selectedSubFunction));
                const matchesEmployeeType = selectedEmployeeType === 'All' || (project.employeeTypes && project.employeeTypes.includes(selectedEmployeeType));
                const matchesRegion = selectedRegion === 'All' || (project.regions && project.regions.includes(selectedRegion));
                const matchesScrum = selectedScrum === 'All' || (project.scrumTeams && project.scrumTeams.includes(selectedScrum));
                const matchesCoe = selectedCoe === 'All' || (project.coes && project.coes.includes(selectedCoe));

                return matchesGlobal && matchesAccount && matchesDept &&
                    matchesFunction && matchesSubFunction && matchesEmployeeType &&
                    matchesRegion && matchesScrum && matchesCoe;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'dateCollected-desc':
                        return new Date(b.dateCollected || 0) - new Date(a.dateCollected || 0);
                    case 'dateCollected-asc':
                        return new Date(a.dateCollected || 0) - new Date(b.dateCollected || 0);
                    case 'account-asc':
                        return (a.account || '').localeCompare(b.account || '');
                    case 'lastModified-desc':
                        return new Date(b.lastModified || 0) - new Date(a.lastModified || 0);
                    default:
                        return 0;
                }
            });
    }, [projectList, globalSearch, selectedAccount, selectedDept, sortBy, selectedFunction, selectedSubFunction, selectedEmployeeType, selectedRegion, selectedScrum, selectedCoe]);

    const openCreateModal = () => {
        setEditingProject(null);
        setFormData({
            account: '',
            department: '',
            dateCollected: new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const openEditModal = (e, project) => {
        e.stopPropagation();
        setEditingProject(project);
        setFormData({
            account: project.account || '',
            department: project.department || '',
            dateCollected: project.dateCollected || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (editingProject) {
                await updateProject(editingProject.id, formData);
            } else {
                const id = await createProject(formData);
                navigate(`/editor/${id}`);
            }
            setShowModal(false);
        } catch (error) {
            console.error("Failed to save project", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project? This cannot be undone.')) {
            await deleteProject(id);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">My Projects</h1>
                        <p className="text-slate-500 mt-2">Manage your organization charts</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handleRefreshMetadata}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                            title="Refresh metadata for all projects"
                        >
                            <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                            {isRefreshing ? 'Refreshing...' : 'Refresh Metadata'}
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <Plus size={20} />
                            New Project
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
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

                        {/* Sort Options */}
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
                    </div>

                    {/* Extended Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-100">
                        {/* Function Filter */}
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedFunction}
                                onChange={(e) => setSelectedFunction(e.target.value)}
                            >
                                {functions.map(f => <option key={f} value={f}>{f === 'All' ? 'All Functions' : f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Sub-Function Filter */}
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedSubFunction}
                                onChange={(e) => setSelectedSubFunction(e.target.value)}
                            >
                                {subFunctions.map(f => <option key={f} value={f}>{f === 'All' ? 'All Sub-Functions' : f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Employee Type Filter */}
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedEmployeeType}
                                onChange={(e) => setSelectedEmployeeType(e.target.value)}
                            >
                                {employeeTypes.map(f => <option key={f} value={f}>{f === 'All' ? 'All Emp Types' : f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Region Filter */}
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedRegion}
                                onChange={(e) => setSelectedRegion(e.target.value)}
                            >
                                {regions.map(f => <option key={f} value={f}>{f === 'All' ? 'All Regions' : f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* Scrum Filter */}
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedScrum}
                                onChange={(e) => setSelectedScrum(e.target.value)}
                            >
                                {scrumTeams.map(f => <option key={f} value={f}>{f === 'All' ? 'All Scrum Teams' : f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>

                        {/* COE Filter */}
                        <div className="relative">
                            <select
                                className="w-full pl-3 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white cursor-pointer"
                                value={selectedCoe}
                                onChange={(e) => setSelectedCoe(e.target.value)}
                            >
                                {coes.map(f => <option key={f} value={f}>{f === 'All' ? 'All COEs' : f}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                        </div>
                    </div>
                </div>

                {filteredProjects.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-slate-400" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No projects found</h3>
                        <p className="text-slate-500 mt-2 mb-6">
                            {projectList.length === 0
                                ? "Create your first organization chart to get started"
                                : "Try adjusting your search or filters"}
                        </p>
                        {projectList.length === 0 && (
                            <button
                                onClick={openCreateModal}
                                className="text-blue-600 font-medium hover:text-blue-700"
                            >
                                Create a project
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => navigate(`/editor/${project.id}`)}
                                className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden flex flex-col"
                            >
                                <div className="h-24 bg-slate-100 flex items-center justify-center border-b border-slate-100 group-hover:bg-slate-50 transition-colors relative">
                                    <Building2 className="text-slate-300 group-hover:text-blue-400 transition-colors" size={40} />
                                    {/* Tag Badges Overlay */}
                                    <div className="absolute bottom-2 right-2 flex gap-1">
                                        {project.coes && project.coes.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-medium rounded-full" title={`COE: ${project.coes.join(', ')}`}>COE</span>
                                        )}
                                        {project.scrumTeams && project.scrumTeams.length > 0 && (
                                            <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-medium rounded-full" title={`Scrum: ${project.scrumTeams.join(', ')}`}>Scrum</span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate pr-2" title={project.account}>
                                                {project.account || 'Untitled Account'}
                                            </h3>
                                            <p className="text-sm text-slate-500 flex items-center gap-1 mb-1">
                                                <Briefcase size={12} />
                                                {project.department || 'No Department'}
                                            </p>

                                            {/* Tags Summary */}
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {project.functions && project.functions.slice(0, 2).map(f => (
                                                    <span key={f} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded border border-slate-200">{f}</span>
                                                ))}
                                                {project.functions && project.functions.length > 2 && (
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[10px] rounded border border-slate-200">+{project.functions.length - 2}</span>
                                                )}

                                                {project.employeeTypes && project.employeeTypes.slice(0, 2).map(et => (
                                                    <span key={et} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-100">{et}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={(e) => openEditModal(e, project)}
                                                className="text-slate-400 hover:text-blue-500 transition-colors p-1 rounded-md hover:bg-blue-50"
                                                title="Edit project"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(e, project.id)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                                                title="Delete project"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-slate-100 space-y-1">
                                        <div className="flex items-center text-xs text-slate-500">
                                            <Calendar size={12} className="mr-1.5" />
                                            <span>Collected: {formatDate(project.dateCollected)}</span>
                                        </div>
                                        <div className="flex items-center text-xs text-slate-400">
                                            <span className="ml-4.5">Modified: {formatDate(project.lastModified)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Create/Edit Project Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">
                                {editingProject ? 'Edit Project' : 'New Project'}
                            </h2>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Acme Corp"
                                            value={formData.account}
                                            onChange={(e) => setFormData({ ...formData, account: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            placeholder="e.g. Sales"
                                            value={formData.department}
                                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Date Collected</label>
                                        <input
                                            type="date"
                                            required
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                            value={formData.dateCollected}
                                            onChange={(e) => setFormData({ ...formData, dateCollected: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? 'Saving...' : (editingProject ? 'Save Changes' : 'Create Project')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectList;
