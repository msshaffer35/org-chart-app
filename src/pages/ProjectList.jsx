import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store';
import { Plus, RefreshCw, LayoutGrid, List, Search, GitCompare } from 'lucide-react';
import { storageService } from '../services/storageService';
import AccountCard from '../components/AccountCard';
import { useProjectFilters } from '../hooks/useProjectFilters';
import ProjectFilters from '../components/project-list/ProjectFilters';
import ProjectCard from '../components/project-list/ProjectCard';
import ProjectModal from '../components/project-list/ProjectModal';
import AnalysisList from '../components/analysis-list/AnalysisList';
import TemplateList from '../components/template-list/TemplateList';

const ProjectList = () => {
    const navigate = useNavigate();
    const { projectList, loadProjects, createProject, createScenario, updateProject, deleteProject, createFromTemplate } = useStore();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Use Custom Hook for Filters & View Logic
    const {
        viewMode, setViewMode,
        globalSearch, setGlobalSearch,
        selectedAccount, setSelectedAccount,
        accountSearch, setAccountSearch,
        isAccountDropdownOpen, setIsAccountDropdownOpen,
        selectedDept, setSelectedDept,
        deptSearch, setDeptSearch,
        isDeptDropdownOpen, setIsDeptDropdownOpen,
        selectedFunctions, setSelectedFunctions,
        selectedSubFunctions, setSelectedSubFunctions,
        selectedEmployeeTypes, setSelectedEmployeeTypes,
        selectedRegions, setSelectedRegions,
        selectedScrumTeams, setSelectedScrumTeams,
        selectedCoes, setSelectedCoes,
        sortBy, setSortBy,
        accounts, departments,
        functions, subFunctions, employeeTypes, regions, scrumTeams, coes,
        filteredAccounts, filteredDepartments, filteredProjects,
        projectTree, groupedProjects,
        selectedProjectTypes, setSelectedProjectTypes
    } = useProjectFilters(projectList);

    // Form State
    const [formData, setFormData] = useState({
        account: '',
        department: '',
        dateCollected: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadProjects();
    }, [loadProjects]);

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

    const openCreateModal = () => {
        setEditingProject(null);
        // Reset form data but keep date
        setFormData(prev => ({
            account: '',
            department: '',
            dateCollected: new Date().toISOString().split('T')[0]
        }));
        setShowModal(true);
    };

    const openCreateModalForAccount = (accountName) => {
        setEditingProject(null);
        setFormData({
            account: accountName,
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
                navigate(`/project/${id}`);
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

    const handleCreateScenario = async (e, project) => {
        e.stopPropagation();
        const name = prompt("Enter a name for this scenario (e.g. 'Jan 2025 Plan'):");
        if (!name) return;

        try {
            const newId = await createScenario(project.id, {
                versionName: name,
                account: project.account,
                department: project.department
            });
            navigate(`/compare/${project.id}/${newId}`);
        } catch (error) {
            console.error("Failed to create scenario", error);
            alert("Failed to create scenario");
        }
    };

    const handleUseTemplate = async (template) => {
        const account = prompt("Enter Client/Account Name for this new project:", "New Client");
        if (!account) return;

        try {
            const newId = await createFromTemplate(template.id, {
                account: account,
                department: 'Organizational Structure',
                dateCollected: new Date().toISOString().split('T')[0]
            });
            navigate(`/project/${newId}`);
        } catch (error) {
            console.error("Failed to create from template", error);
            alert("Failed to create project from template");
        }
    };

    const [activeTab, setActiveTab] = useState('projects'); // 'projects' | 'analyses'

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">OrgPilot</h1>
                        <p className="text-slate-500 mt-2">Manage your organization charts and analyses</p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate('/analysis/new')}
                            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                        >
                            <GitCompare size={20} />
                            New Analysis
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

                {/* Tabs */}
                <div className="flex border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'projects'
                            ? 'border-blue-600 text-blue-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Projects
                    </button>
                    <button
                        onClick={() => setActiveTab('analyses')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'analyses'
                            ? 'border-purple-600 text-purple-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Saved Analyses
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'templates'
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Templates
                    </button>
                </div>

                {activeTab === 'projects' && (
                    <>
                        {/* Project View Controls */}
                        <div className="flex justify-end mb-4 gap-3">
                            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode('accounts')}
                                    className={`p-2 rounded-md transition-all ${viewMode === 'accounts' ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    title="Account View"
                                >
                                    <List size={20} />
                                </button>
                            </div>

                            <button
                                onClick={handleRefreshMetadata}
                                disabled={isRefreshing}
                                className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                                title="Refresh metadata for all projects"
                            >
                                <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
                                {isRefreshing ? 'Refreshing...' : 'Refresh Metadata'}
                            </button>
                        </div>

                        {/* Search & Filter Bar */}
                        <ProjectFilters
                            viewMode={viewMode}
                            globalSearch={globalSearch} setGlobalSearch={setGlobalSearch}
                            selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount}
                            accountSearch={accountSearch} setAccountSearch={setAccountSearch}
                            isAccountDropdownOpen={isAccountDropdownOpen} setIsAccountDropdownOpen={setIsAccountDropdownOpen}
                            filteredAccounts={filteredAccounts}
                            selectedDept={selectedDept} setSelectedDept={setSelectedDept}
                            deptSearch={deptSearch} setDeptSearch={setDeptSearch}
                            isDeptDropdownOpen={isDeptDropdownOpen} setIsDeptDropdownOpen={setIsDeptDropdownOpen}
                            filteredDepartments={filteredDepartments}
                            sortBy={sortBy} setSortBy={setSortBy}
                            functions={functions} selectedFunctions={selectedFunctions} setSelectedFunctions={setSelectedFunctions}
                            subFunctions={subFunctions} selectedSubFunctions={selectedSubFunctions} setSelectedSubFunctions={setSelectedSubFunctions}
                            employeeTypes={employeeTypes} selectedEmployeeTypes={selectedEmployeeTypes} setSelectedEmployeeTypes={setSelectedEmployeeTypes}
                            regions={regions} selectedRegions={selectedRegions} setSelectedRegions={setSelectedRegions}
                            scrumTeams={scrumTeams} selectedScrumTeams={selectedScrumTeams} setSelectedScrumTeams={setSelectedScrumTeams}
                            coes={coes} selectedCoes={selectedCoes} setSelectedCoes={setSelectedCoes}
                            selectedProjectTypes={selectedProjectTypes} setSelectedProjectTypes={setSelectedProjectTypes}
                        />

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
                            <>
                                {viewMode === 'grid' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {projectTree.map((project) => (
                                            <ProjectCard
                                                key={project.id}
                                                project={project}
                                                onEdit={openEditModal}
                                                onDelete={handleDelete}
                                                onCreateScenario={handleCreateScenario}
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {Object.entries(groupedProjects).map(([account, projects]) => (
                                            <AccountCard
                                                key={account}
                                                accountName={account}
                                                projects={projects}
                                                onCreateNew={openCreateModalForAccount}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'analyses' && <AnalysisList />}

                {activeTab === 'templates' && (
                    <TemplateList onUseTemplate={handleUseTemplate} />
                )}

                {/* Create/Edit Project Modal */}
                <ProjectModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    editingProject={editingProject}
                    formData={formData}
                    setFormData={setFormData}
                />
            </div>
        </div >
    );
};

export default ProjectList;
