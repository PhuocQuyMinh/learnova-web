import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'; // Thêm middleware

interface User {
    id: number;
    fullName: string;
    email: string;
    role: string;
    avatarUrl: string | null;
}

interface AuthState {
    token: string | null;
    user: User | null;
    login: (token: string, user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            login: (token, user) => set({ token, user }),
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'learnova-auth', // Tên key sẽ lưu trong localStorage
            storage: createJSONStorage(() => localStorage), // Lưu vào ổ cứng trình duyệt
        }
    )
);