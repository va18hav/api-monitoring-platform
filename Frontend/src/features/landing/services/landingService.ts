import { useAuthStore } from '../../../store/authStore';

export const landingService = {
    /**
     * Checks if the user is currently authenticated in the Zustand application store.
     */
    isAuthenticated: (): boolean => {
        return useAuthStore.getState().isAuthenticated;
    },

    /**
     * Helper to read a local storage indicator that hints at whether a session has been initiated.
     * Useful to check state synchronously during initial paint/hydration.
     */
    hasSessionHint: (): boolean => {
        return localStorage.getItem('pingdeck_session_active') === 'true';
    },

    /**
     * Syncs session hint status into local storage.
     */
    setSessionHint: (active: boolean): void => {
        if (active) {
            localStorage.setItem('pingdeck_session_active', 'true');
        } else {
            localStorage.removeItem('pingdeck_session_active');
        }
    }
};
