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

    createProject: (metadata) => {
        try {
            const projects = storageService.getProjects();
            const newProject = {
                id: crypto.randomUUID(),
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

    saveProject: (id, data) => {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(`${PROJECT_PREFIX}${id}`, serialized);

            // Update last modified timestamp
            storageService.updateProjectMetadata(id, {});

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
