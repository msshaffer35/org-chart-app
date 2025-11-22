const STORAGE_KEY = 'org_chart_data';

export const storageService = {
    saveChart: (data) => {
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(STORAGE_KEY, serialized);
            return Promise.resolve(true);
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return Promise.reject(error);
        }
    },

    loadChart: () => {
        try {
            const serialized = localStorage.getItem(STORAGE_KEY);
            if (!serialized) return Promise.resolve(null);
            return Promise.resolve(JSON.parse(serialized));
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return Promise.reject(error);
        }
    },

    clearChart: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            return Promise.resolve(true);
        } catch (error) {
            return Promise.reject(error);
        }
    }
};
