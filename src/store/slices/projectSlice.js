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

    createFromTemplate: async (templateId, metadata) => {
        try {
            // Import dynamically to avoid circular dependencies if any, though services are usually fine
            const { templateService } = await import('../../services/templateService');
            const id = await templateService.createProjectFromTemplate(templateId, metadata);
            get().loadProjects();
            return id;
        } catch (error) {
            console.error("Failed to create from template", error);
            throw error;
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
    },

    saveProject: async () => {
        const state = get();
        const { currentProjectId, nodes, edges } = state;

        if (!currentProjectId) return;

        try {
            const metadata = aggregateMetadata(nodes);
            await storageService.saveProject(
                currentProjectId,
                { nodes, edges },
                metadata
            );

            // Update current project metadata in state if needed
            // The storageService.saveProject updates the lastModified in local storage
            // We might want to reflect that in the UI immediately
            const updatedMeta = storageService.getProjectMetadata(currentProjectId);
            set({ currentProject: updatedMeta });

        } catch (error) {
            console.error('Failed to save project:', error);
            throw error;
        }
    }
});

// Helper to aggregate metadata from nodes
const aggregateMetadata = (nodes) => {
    const metadata = {
        functions: new Set(),
        subFunctions: new Set(),
        employeeTypes: new Set(),
        regions: new Set(),
        scrumTeams: new Set(),
        coes: new Set()
    };

    nodes.forEach(node => {
        if (node.data) {
            if (node.data.employeeType) {
                metadata.employeeTypes.add(node.data.employeeType);
            }

            if (node.data.teamType) {
                if (node.data.teamType.scrum) {
                    metadata.scrumTeams.add(node.data.teamType.scrum);
                }
                if (node.data.teamType.coe) {
                    metadata.coes.add(node.data.teamType.coe);
                }
                if (Array.isArray(node.data.teamType.regions)) {
                    node.data.teamType.regions.forEach(r => metadata.regions.add(r));
                }
                if (Array.isArray(node.data.teamType.functions)) {
                    node.data.teamType.functions.forEach(f => metadata.functions.add(f));
                }
                if (Array.isArray(node.data.teamType.subFunctions)) {
                    node.data.teamType.subFunctions.forEach(sf =>
                        metadata.subFunctions.add(sf)
                    );
                }
            }
        }
    });

    return {
        functions: Array.from(metadata.functions),
        subFunctions: Array.from(metadata.subFunctions),
        employeeTypes: Array.from(metadata.employeeTypes),
        regions: Array.from(metadata.regions),
        scrumTeams: Array.from(metadata.scrumTeams),
        coes: Array.from(metadata.coes)
    };
};
