import { useState, useMemo } from 'react';

export const useProjectFilters = (projectList) => {
    // View Mode State
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'accounts'

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

    // New Filters (Multi-Select Arrays)
    const [selectedFunctions, setSelectedFunctions] = useState([]);
    const [selectedSubFunctions, setSelectedSubFunctions] = useState([]);
    const [selectedEmployeeTypes, setSelectedEmployeeTypes] = useState([]);
    const [selectedRegions, setSelectedRegions] = useState([]);
    const [selectedScrumTeams, setSelectedScrumTeams] = useState([]);
    const [selectedCoes, setSelectedCoes] = useState([]);

    const [sortBy, setSortBy] = useState('dateCollected-desc');

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
        return Array.from(values).sort();
    };

    const functions = useMemo(() => getUniqueValues('functions'), [projectList]);
    const subFunctions = useMemo(() => getUniqueValues('subFunctions'), [projectList]);
    const employeeTypes = useMemo(() => getUniqueValues('employeeTypes'), [projectList]);
    const regions = useMemo(() => getUniqueValues('regions'), [projectList]);
    const scrumTeams = useMemo(() => getUniqueValues('scrumTeams'), [projectList]);
    const coes = useMemo(() => getUniqueValues('coes'), [projectList]);

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

                // New Filters (Multi-Select Logic: Match ANY)
                const checkMultiSelect = (projectTags, selectedTags) => {
                    if (selectedTags.length === 0) return true; // No filter selected = match all
                    if (!projectTags) return false; // Filter selected but project has no tags = no match

                    // If projectTags is array, check intersection
                    if (Array.isArray(projectTags)) {
                        return projectTags.some(tag => selectedTags.includes(tag));
                    }
                    // If projectTags is single value, check inclusion
                    return selectedTags.includes(projectTags);
                };

                const matchesFunction = checkMultiSelect(project.functions, selectedFunctions);
                const matchesSubFunction = checkMultiSelect(project.subFunctions, selectedSubFunctions);
                const matchesEmployeeType = checkMultiSelect(project.employeeTypes, selectedEmployeeTypes);
                const matchesRegion = checkMultiSelect(project.regions, selectedRegions);
                const matchesScrum = checkMultiSelect(project.scrumTeams, selectedScrumTeams);
                const matchesCoe = checkMultiSelect(project.coes, selectedCoes);

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
    }, [projectList, globalSearch, selectedAccount, selectedDept, sortBy, selectedFunctions, selectedSubFunctions, selectedEmployeeTypes, selectedRegions, selectedScrumTeams, selectedCoes]);

    // Tree View Logic: Group Scenarios under Actuals
    const projectTree = useMemo(() => {
        const actuals = filteredProjects.filter(p => p.type !== 'SCENARIO');
        const scenarios = filteredProjects.filter(p => p.type === 'SCENARIO');

        // Create a map of scenarios by sourceProjectId
        const scenariosBySource = {};
        scenarios.forEach(s => {
            if (!s.sourceProjectId) return; // Orphan scenario?
            if (!scenariosBySource[s.sourceProjectId]) scenariosBySource[s.sourceProjectId] = [];
            scenariosBySource[s.sourceProjectId].push(s);
        });

        // Attach scenarios to actuals
        return actuals.map(actual => ({
            ...actual,
            children: scenariosBySource[actual.id] || []
        }));
    }, [filteredProjects]);

    // Group projects by account for Account View
    const groupedProjects = useMemo(() => {
        const groups = {};
        filteredProjects.forEach(p => {
            const acc = p.account || 'Untitled Account';
            if (!groups[acc]) groups[acc] = [];
            groups[acc].push(p);
        });
        return groups;
    }, [filteredProjects]);

    return {
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
        projectTree, groupedProjects
    };
};
