import { create } from 'zustand';
import { message } from 'antd';

// Cấu trúc dữ liệu trả về từ API getMyCart
export interface CartItemAPI {
    id: number; // ID của bản ghi trong bảng CartItems
    courseId: number;
    Course: {
        id: number;
        title: string;
        price: number;
        coverImage: string;
    }
}

interface CartState {
    items: CartItemAPI[];
    isLoading: boolean;

    // Các hàm tương tác với Backend
    fetchCart: (token: string) => Promise<void>;
    addToCart: (token: string, courseId: number) => Promise<boolean>;
    removeFromCart: (token: string, courseId: number) => Promise<boolean>;

    // Các hàm tiện ích Frontend
    getTotalPrice: () => number;
    clearCartLocal: () => void;
}

const API_URL = "http://localhost:8000/api/store";

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    isLoading: false,

    // 1. LẤY GIỎ HÀNG TỪ BACKEND
    fetchCart: async (token: string) => {
        set({ isLoading: true });
        try {
            const res = await fetch(`${API_URL}/cart`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                set({ items: data.data.cart });
            }
        } catch (error) {
            console.error("Lỗi tải giỏ hàng:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    // 2. THÊM VÀO GIỎ HÀNG (Gọi API)
    addToCart: async (token: string, courseId: number) => {
        try {
            const res = await fetch(`${API_URL}/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ courseId })
            });
            const data = await res.json();

            if (res.ok) {
                message.success("Đã thêm khóa học vào giỏ hàng!");
                // Gọi lại fetchCart để cập nhật danh sách mới nhất
                await get().fetchCart(token);
                return true;
            } else {
                message.warning(data.message || "Không thể thêm vào giỏ hàng!");
                return false;
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ.");
            return false;
        }
    },

    // 3. XÓA KHỎI GIỎ HÀNG (Gọi API)
    removeFromCart: async (token: string, courseId: number) => {
        try {
            const res = await fetch(`${API_URL}/cart/${courseId}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (res.ok || res.status === 204) {
                message.success("Đã xóa khỏi giỏ hàng");
                // Cập nhật lại state nội bộ cho nhanh (không cần gọi lại API fetchCart)
                set((state) => ({
                    items: state.items.filter(item => item.courseId !== courseId)
                }));
                return true;
            } else {
                message.error("Không thể xóa khóa học này!");
                return false;
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ.");
            return false;
        }
    },

    // 4. Tính tổng tiền từ danh sách hiện tại
    getTotalPrice: () => {
        return get().items.reduce((total, item) => total + item.Course.price, 0);
    },

    // 5. Xóa local (Dùng sau khi thanh toán thành công vì DB đã tự xóa)
    clearCartLocal: () => set({ items: [] })
}));