import { create } from 'zustand';

interface User {
    id: string;
    email: string;
    isVerified: boolean;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    setUser: (user) => {
        if (user) {
            localStorage.setItem('pingdeck_session_active', 'true');
        } else {
            localStorage.removeItem('pingdeck_session_active');
        }
        set({ user, isAuthenticated: !!user });
    },
    setLoading: (isLoading) => set({ isLoading }),
    logout: () => {
        localStorage.removeItem('pingdeck_session_active');
        set({ user: null, isAuthenticated: false });
    },
}));
