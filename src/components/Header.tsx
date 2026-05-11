"use client";

import { useState } from "react";
import Link from "next/link";
import { Input, Badge, Avatar, Dropdown, Button, MenuProps } from "antd";
import {
    SearchOutlined,
    HeartOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter, usePathname } from "next/navigation";

// Dữ liệu danh mục
const categoryData = {
    categories: [
        { id: 1, name: "Kỹ thuật", children: [{ id: 6, name: "Lập trình" }, { id: 7, name: "Cơ khí" }, { id: 8, name: "Âm thanh" }, { id: 9, name: "Điện nước" }] },
        { id: 2, name: "Nghệ thuật", children: [{ id: 10, name: "Thanh nhạc (Hát)" }, { id: 11, name: "Piano" }, { id: 12, name: "Trống (Drum)" }, { id: 13, name: "Hội họa & Thiết kế" }] },
        { id: 3, name: "Kinh doanh & Marketing", children: [{ id: 14, name: "Digital Marketing" }, { id: 15, name: "Tài chính - Kế toán" }, { id: 16, name: "Khởi nghiệp" }] },
        { id: 4, name: "Ngoại ngữ", children: [{ id: 17, name: "Tiếng Anh giao tiếp" }, { id: 18, name: "IELTS / TOEIC" }, { id: 19, name: "Tiếng Nhật" }] },
        { id: 5, name: "Kỹ năng mềm", children: [{ id: 20, name: "Giao tiếp & Thuyết trình" }, { id: 21, name: "Quản lý thời gian" }] },
        { id: 22, name: "Lập trình Backend nâng cao", children: [] },
    ],
};

export default function Header() {
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    // State để theo dõi đang hover vào danh mục nào
    const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

    const hideHeaderRoutes = ["/login", "/register", "/forgot-password"];
    if (hideHeaderRoutes.includes(pathname)) return null;

    const userMenuItems: MenuProps["items"] = [
        { key: "profile", label: <Link href="/profile">Hồ sơ của tôi</Link> },
        { type: "divider" },
        { key: "logout", label: "Đăng xuất", danger: true, onClick: () => { logout(); router.push("/"); } },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            {/* THANH MENUBAR 1: Chính */}
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex-shrink-0 w-44">
                    <Link href="/">
                        <h1 className="text-3xl font-extrabold text-[#A435F0] m-0 tracking-tighter">Leanova</h1>
                    </Link>
                </div>

                <div className="flex-1 flex justify-center max-w-2xl px-4">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm nội dung bất kỳ..."
                        prefix={<SearchOutlined className="text-gray-400 mr-2" />}
                        className="rounded-full bg-[#f7f9fa] border-gray-300 h-11 w-full"
                    />
                </div>

                <div className="flex items-center justify-end gap-5 flex-shrink-0 min-w-[350px]">
                    <div className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-gray-700">
                        <Link href="/instructor" className="hover:text-[#A435F0]">Giảng dạy</Link>
                        <Link href="/my-learning" className="hover:text-[#A435F0]">Học tập</Link>
                    </div>

                    <div className="flex items-center gap-5 ml-2">
                        {user ? (
                            <>
                                <Link href="/wishlist" className="text-gray-600 hover:text-[#A435F0] text-xl"><HeartOutlined /></Link>
                                <Link href="/cart" className="text-gray-600 hover:text-[#A435F0] text-xl"><Badge count={2} size="small" color="#A435F0"><ShoppingCartOutlined /></Badge></Link>
                                <Link href="/notifications" className="text-gray-600 hover:text-[#A435F0] text-xl"><Badge dot color="#A435F0"><BellOutlined /></Badge></Link>
                                <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                                    <Badge dot color="#52c41a" offset={[-4, 34]}><Avatar size="large" icon={<UserOutlined />} src={user.avatarUrl} className="cursor-pointer bg-[#A435F0]" /></Badge>
                                </Dropdown>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/cart" className="text-gray-600 hover:text-[#A435F0] text-xl px-2"><ShoppingCartOutlined /></Link>
                                <Link href="/login"><Button className="font-bold h-10 px-5 border-gray-900 text-gray-900">Đăng nhập</Button></Link>
                                <Link href="/register"><Button type="primary" className="font-bold h-10 px-5 bg-gray-900 hover:bg-gray-800 border-none rounded-none">Đăng ký</Button></Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* THANH MENUBAR 2 & 3: Danh mục và Menu con ngang */}
            <div
                className="relative border-t border-gray-100 shadow-sm hidden md:block"
                onMouseLeave={() => setHoveredCategory(null)} // Khi rời chuột khỏi cả cụm menu thì ẩn menu con
            >
                {/* Bar Danh mục cấp 1 (Màu trắng) */}
                <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-center gap-10">
                    {categoryData.categories.map((cat) => (
                        <div
                            key={cat.id}
                            className="h-full flex items-center cursor-pointer relative"
                            onMouseEnter={() => setHoveredCategory(cat.id)}
                        >
                            <Link
                                href={`/category/${cat.id}`}
                                className={`text-[13px] font-semibold transition-colors whitespace-nowrap ${hoveredCategory === cat.id ? "text-[#A435F0]" : "text-gray-600"
                                    }`}
                            >
                                {cat.name}
                            </Link>
                            {/* Vạch kẻ dưới khi hover */}
                            {hoveredCategory === cat.id && (
                                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#A435F0]" />
                            )}
                        </div>
                    ))}
                </div>

                {/* Bar Danh mục cấp 2 (Màu tím đậm - Xuất hiện khi có children và đang hover) */}
                {categoryData.categories.map((cat) => (
                    cat.children.length > 0 && (
                        <div
                            key={`sub-${cat.id}`}
                            className={`absolute left-0 w-full bg-[#1c1d1f] transition-all duration-200 overflow-hidden z-40 ${hoveredCategory === cat.id ? "max-h-12 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                                }`}
                        >
                            <div className="max-w-7xl mx-auto px-4 h-12 flex items-center justify-center gap-8">
                                {cat.children.map((child) => (
                                    <Link
                                        key={child.id}
                                        href={`/category/${child.id}`}
                                        className="text-[13px] font-medium text-white/90 hover:text-white hover:underline transition-all whitespace-nowrap"
                                    >
                                        {child.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )
                ))}
            </div>
        </header>
    );
}