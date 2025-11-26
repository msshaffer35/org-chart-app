import { storageService } from '../../services/storageService';

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Aggregate metadata from nodes
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

// Create debounced save function
const createDebouncedSave = (get) => {
    return debounce((state) => {
        if (state.currentProjectId) {
            const metadata = aggregateMetadata(state.nodes);

            storageService.saveProject(
                state.currentProjectId,
                {
                    nodes: state.nodes,
                    edges: state.edges
                },
                metadata
            );
        }
    }, 1000);
};

/**
 * Persistence middleware for Zustand store
 * Automatically saves state changes to localStorage with debouncing
 */
export const createPersistenceMiddleware = (config) => {
    return (set, get, api) => {
        // Create debounced save function
        const debouncedSave = createDebouncedSave(get);

        // Wrap set to trigger save after state changes
        const wrappedSet = (...args) => {
            set(...args);
            debouncedSave(get());
        };

        // Create the store with wrapped set function
        const store = config(wrappedSet, get, api);

        return store;
    };
};
