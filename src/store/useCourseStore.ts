import { create } from 'zustand';

interface Course {
    id: number;
    title: string;
    price: number;
    coverImage: string | null;
    averageRating: number;
    instructor: {
        fullName: string;
    };
}

interface TrendingCourse {
    courseId: number;
    enrollmentCount: number;
    Course: Course;
}

interface CourseState {
    trendingCourses: TrendingCourse[];
    isLoading: boolean;
    fetchTrendingCourses: () => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
    trendingCourses: [],
    isLoading: false,
    fetchTrendingCourses: async () => {
        set({ isLoading: true });
        try {
            const response = await fetch("http://localhost:8000/api/store/courses/top-popular");
            const result = await response.json();
            if (result.status === "success") {
                set({ trendingCourses: result.data.courses });
            }
        } catch (error) {
            console.error("Lỗi khi tải khóa học thịnh hành:", error);
        } finally {
            set({ isLoading: false });
        }
    },
}));