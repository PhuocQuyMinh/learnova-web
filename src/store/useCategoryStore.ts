import { create } from 'zustand';

// Định nghĩa Interface theo đúng JSON API trả về
interface CategoryChild {
    id: number;
    name: string;
    parentId: number;
}

interface Category {
    id: number;
    name: string;
    children: CategoryChild[];
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    isLoading: false,
    fetchCategories: async () => {
        set({ isLoading: true });
        try {
            // Thay URL bằng endpoint thực tế của bạn
            const response = await fetch("http://localhost:8000/api/categories/");
            const result = await response.json();

            if (result.status === "success") {
                set({ categories: result.data.categories });
            }
        } catch (error) {
            console.error("Lỗi khi tải danh mục:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));