import { storageService } from '../../services/storageService';

/**
 * Project Slice
 * Manages project/scenario lifecycle and metadata
 */
export const createProjectSlice = (set, get) => ({
    // State
    currentProjectId: null,
    currentProject: null, // { id, account, department, dateCollected, ... }
    projectList: [],

    // Actions
    loadProjects: () => {
        const projects = storageService.getProjects();
        set({ projectList: projects });
    },

    createProject: async (metadata) => {
        try {
            const id = await storageService.createProject(metadata);
            get().loadProjects();
            return id;
        } catch (error) {
            console.error(error);
        }
    },

    createScenario: async (sourceProjectId, metadata) => {
        try {
            const id = await storageService.createScenario(sourceProjectId, metadata);
            get().loadProjects();
            return id;
        } catch (error) {
            console.error(error);
        }
    },

    updateProject: async (id, metadata) => {
        try {
            await storageService.updateProjectMetadata(id, metadata);
            get().loadProjects();

            // If we are currently viewing this project, update the currentProject state
            const { currentProjectId } = get();
            if (currentProjectId === id) {
                const updatedMeta = storageService.getProjectMetadata(id);
                set({ currentProject: updatedMeta });
            }
        } catch (error) {
            console.error(error);
        }
    },

    deleteProject: async (id) => {
        try {
            await storageService.deleteProject(id);
            get().loadProjects();
        } catch (error) {
            console.error(error);
        }
    },

    loadChart: async (projectId) => {
        if (!projectId) return;

        set({ isLoading: true, error: null, currentProjectId: projectId });

        // Load metadata
        const metadata = storageService.getProjectMetadata(projectId);
        set({ currentProject: metadata });

        try {
            const data = await storageService.loadProject(projectId);
            if (data) {
                set({ nodes: data.nodes || [], edges: data.edges || [] });
            } else {
                // New project or empty
                set({ nodes: [], edges: [] });
            }
        } catch (err) {
            set({ error: 'Failed to load chart' });
        } finally {
            set({ isLoading: false });
        }
    },

    resetChart: async () => {
        // Only clear current state, don't delete persistence unless explicitly requested
        set({ nodes: [], edges: [], filterState: { type: 'NONE', value: null } });
    }
});
