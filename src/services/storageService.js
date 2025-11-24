const PROJECTS_KEY = 'org_chart_projects'; // Stores list of { id, name, lastModified }
const PROJECT_PREFIX = 'org_chart_data_'; // Stores actual data: org_chart_data_{id}

export const storageService = {
    // --- Project Management ---

    getProjects: () => {
        try {
            const serialized = localStorage.getItem(PROJECTS_KEY);
            return serialized ? JSON.parse(serialized) : [];
        } catch (error) {
            console.error('Failed to load projects list:', error);
            return [];
        }
    },

    refreshAllProjectMetadata: async () => {
        try {
            const projects = storageService.getProjects();
            const updatedProjects = [];

            for (const project of projects) {
                try {
                    // Load full project data
                    const data = await storageService.loadProject(project.id);
                    if (!data || !data.nodes) {
                        updatedProjects.push(project);
                        continue;
                    }

                    // Calculate metadata
                    const metadata = {
                        functions: new Set(),
                        subFunctions: new Set(),
                        employeeTypes: new Set(),
                        regions: new Set(),
                        scrumTeams: new Set(),
                        coes: new Set()
                    };

                    data.nodes.forEach(node => {
                        if (node.data) {
                            if (node.data.employeeType) metadata.employeeTypes.add(node.data.employeeType);

                            if (node.data.teamType) {
                                if (node.data.teamType.scrum) metadata.scrumTeams.add(node.data.teamType.scrum);
                                if (node.data.teamType.coe) metadata.coes.add(node.data.teamType.coe);

                                if (Array.isArray(node.data.teamType.regions)) {
                                    node.data.teamType.regions.forEach(r => metadata.regions.add(r));
                                }
                                if (Array.isArray(node.data.teamType.functions)) {
                                    node.data.teamType.functions.forEach(f => metadata.functions.add(f));
                                }
                                if (Array.isArray(node.data.teamType.subFunctions)) {
                                    node.data.teamType.subFunctions.forEach(sf => metadata.subFunctions.add(sf));
                                }
                            }
                        }
                    });

                    updatedProjects.push({
                        ...project,
                        functions: Array.from(metadata.functions),
                        subFunctions: Array.from(metadata.subFunctions),
                        employeeTypes: Array.from(metadata.employeeTypes),
                        regions: Array.from(metadata.regions),
                        scrumTeams: Array.from(metadata.scrumTeams),
                        coes: Array.from(metadata.coes),
                        lastModified: Date.now() // Optional: update modified time or keep original? Let's keep original for refresh only unless we want to signal change.
                        // Actually, let's NOT update lastModified on refresh so it doesn't mess up sorting by date.
                    });

                } catch (err) {
                    console.error(`Failed to refresh metadata for project ${project.id}`, err);
                    updatedProjects.push(project);
                }
            }

            localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
            return updatedProjects;
        } catch (error) {
            console.error('Failed to refresh all project metadata:', error);
            throw error;
        }
    },

    getProjectMetadata: (id) => {
        try {
            const projects = storageService.getProjects();
            return projects.find(p => p.id === id) || null;
        } catch (error) {
            console.error('Failed to load project metadata:', error);
            return null;
        }
    },

    createProject: (metadata) => {
        try {
            const projects = storageService.getProjects();
            const newProject = {
                id: crypto.randomUUID(),
                type: 'ACTUAL', // Default type
                ...metadata, // { account, department, dateCollected }
                lastModified: Date.now(),
            };
            projects.push(newProject);
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
            return Promise.resolve(newProject.id);
        } catch (error) {
            console.error('Failed to create project:', error);
            return Promise.reject(error);
        }
    },

    createScenario: async (sourceProjectId, metadata) => {
        try {
            // 1. Get Source Data
            const sourceProject = storageService.getProjectMetadata(sourceProjectId);
            const sourceData = await storageService.loadProject(sourceProjectId);

            if (!sourceProject || !sourceData) {
                throw new Error("Source project not found");
            }

            // 2. Create New Project Entry
            const projects = storageService.getProjects();
            const newId = crypto.randomUUID();

            const newProject = {
                id: newId,
                type: 'SCENARIO',
                sourceProjectId: sourceProjectId,
                ...metadata, // { versionName, account, department... }
                account: sourceProject.account, // Inherit account
                department: sourceProject.department, // Inherit dept
                lastModified: Date.now(),
                analysis: {
                    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
                    generalNotes: "",
                    strategicAlignment: ""
                }
            };

            projects.push(newProject);
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

            // 3. Clone Data
            // Deep copy nodes and edges to ensure independence
            const clonedData = JSON.parse(JSON.stringify(sourceData));
            localStorage.setItem(`${PROJECT_PREFIX}${newId}`, JSON.stringify(clonedData));

            return newId;
        } catch (error) {
            console.error('Failed to create scenario:', error);
            return Promise.reject(error);
        }
    },


    deleteProject: (id) => {
        try {
            // Remove from list
            const projects = storageService.getProjects().filter(p => p.id !== id);
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));

            // Remove data
            localStorage.removeItem(`${PROJECT_PREFIX}${id}`);
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to delete project:', error);
            return Promise.reject(error);
        }
    },

    updateProjectMetadata: (id, updates) => {
        try {
            const projects = storageService.getProjects().map(p => {
                if (p.id === id) {
                    return { ...p, ...updates, lastModified: Date.now() };
                }
                return p;
            });
            localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    },

    // --- Chart Data Persistence ---

    saveProject: (id, data, metadataUpdates = {}) => {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(`${PROJECT_PREFIX}${id}`, serialized);

            // Update last modified timestamp and other metadata
            storageService.updateProjectMetadata(id, metadataUpdates);

            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to save project data:', error);
            return Promise.reject(error);
        }
    },

    loadProject: (id) => {
        try {
            const serialized = localStorage.getItem(`${PROJECT_PREFIX}${id}`);
            if (!serialized) return Promise.resolve(null);
            return Promise.resolve(JSON.parse(serialized));
        } catch (error) {
            console.error('Failed to load project data:', error);
            return Promise.reject(error);
        }
    }
};
