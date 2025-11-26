/**
 * Store entry point
 * Composes all slices into a unified Zustand store
 */

import { create } from 'zustand';
import { createGraphSlice } from './slices/graphSlice';
import { createProjectSlice } from './slices/projectSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createFilterSlice } from './slices/filterSlice';
import { createPersistenceMiddleware } from './middleware/persistenceMiddleware';

const useStore = create(
    createPersistenceMiddleware(
        (set, get) => ({
            // Spread all slices into a single unified store
            ...createGraphSlice(set, get),
            ...createProjectSlice(set, get),
            ...createSettingsSlice(set, get),
            ...createFilterSlice(set, get),
        })
    )
);

export default useStore;
