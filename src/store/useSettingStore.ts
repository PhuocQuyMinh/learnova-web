import { create } from 'zustand';

interface ContactData {
    email: string;
    phone: string;
    address: string;
    facebook: string;
    workingHours: string;
    aboutUs: string;
}

interface SettingState {
    contactInfo: ContactData | null;
    isLoading: boolean;
    fetchSettings: () => Promise<void>;
}

export const useSettingStore = create<SettingState>((set) => ({
    contactInfo: null,
    isLoading: false,
    fetchSettings: async () => {
        set({ isLoading: true });
        try {
            // Thay URL bằng endpoint API thực tế của bạn
            const response = await fetch("http://localhost:8000/api/moderation/contact-info");
            const result = await response.json();
            if (result.status === "success") {
                set({ contactInfo: result.data });
            }
        } catch (error) {
            console.error("Lỗi khi tải thông tin cấu hình:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));