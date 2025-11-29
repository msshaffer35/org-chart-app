import { storageService } from '../../services/storageService';

// Debounce helper
const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

// Create debounced save function
const createDebouncedSave = (get) => {
    return debounce((state) => {
        // Check if auto-save is enabled
        if (state.currentProjectId && state.settings && state.settings.autoSaveEnabled) {
            // Use the centralized save action
            if (typeof state.saveProject === 'function') {
                state.saveProject();
            } else {
                console.warn('saveProject action not found in state');
            }
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
