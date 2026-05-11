"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Input, Badge, Avatar, Dropdown, Button, MenuProps, Skeleton, message } from "antd";
import {
    SearchOutlined,
    HeartOutlined,
    ShoppingCartOutlined,
    BellOutlined,
    UserOutlined
} from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
    const { user, logout } = useAuthStore();
    const { categories, isLoading, fetchCategories } = useCategoryStore();
    const router = useRouter();
    const pathname = usePathname();
    const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
    const [searchValue, setSearchValue] = useState("");

    // Gọi API lấy danh mục khi component mount
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Hàm điều hướng yêu cầu đăng nhập
    const handleProtectedNavigation = (path: string, actionName: string) => {
        if (!user) {
            message.warning(`Vui lòng đăng nhập để sử dụng tính năng ${actionName}!`);
            router.push("/login");
            return;
        }
        router.push(path);
    };

    const handleSearch = () => {
        if (searchValue.trim()) {
            router.push(`/search?keyword=${encodeURIComponent(searchValue)}`);
        }
    };

    // Không hiển thị Header ở các trang Auth
    const hideHeaderRoutes = ["/login", "/register", "/forgot-password", "/verify-email"];
    if (hideHeaderRoutes.includes(pathname)) return null;

    const userMenuItems: MenuProps["items"] = [
        { key: "profile", label: <Link href="/profile">Hồ sơ của tôi</Link> },
        { type: "divider" },
        {
            key: "logout",
            label: "Đăng xuất",
            danger: true,
            onClick: () => { logout(); router.push("/"); }
        },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                {/* LOGO */}
                <div className="flex-shrink-0 w-44">
                    <Link href="/">
                        <h1 className="text-3xl font-extrabold text-[#A435F0] m-0 tracking-tighter">Leanova</h1>
                    </Link>
                </div>

                {/* THANH TÌM KIẾM */}
                <div className="flex-1 flex justify-center max-w-2xl px-4">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm nội dung bất kỳ..."
                        prefix={<SearchOutlined className="text-gray-400 mr-2" />}
                        className="rounded-full bg-[#f7f9fa] h-11 w-full border-gray-300 transition-all duration-300 hover:!border-[#A435F0] focus:!border-[#A435F0]"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onPressEnter={handleSearch}
                    />
                </div>

                {/* NAVBAR BÊN PHẢI */}
                <div className="flex items-center justify-end gap-5 flex-shrink-0 min-w-[350px]">
                    <div className="hidden lg:flex items-center gap-5 text-[14px] font-medium text-gray-700">
                        <span
                            onClick={() => handleProtectedNavigation("/instructor", "Giảng dạy")}
                            className="hover:text-[#A435F0] cursor-pointer"
                        >
                            Giảng dạy
                        </span>
                        <span
                            onClick={() => handleProtectedNavigation("/my-learning", "Học tập")}
                            className="hover:text-[#A435F0] cursor-pointer"
                        >
                            Học tập
                        </span>
                    </div>

                    <div className="flex items-center gap-2 ml-2">
                        {/* ICON YÊU THÍCH */}
                        <div
                            onClick={() => handleProtectedNavigation("/wishlist", "Danh sách yêu thích")}
                            className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <HeartOutlined className="text-[22px] text-gray-600 group-hover:text-[#A435F0] transition-colors" />
                        </div>

                        {/* ICON GIỎ HÀNG */}
                        <div
                            onClick={() => handleProtectedNavigation("/cart", "Giỏ hàng")}
                            className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-all cursor-pointer"
                        >
                            <Badge count={user ? 2 : 0} size="small" color="#A435F0" offset={[-2, 4]}>
                                <ShoppingCartOutlined className="text-[22px] text-gray-600 group-hover:text-[#A435F0] transition-colors" />
                            </Badge>
                        </div>

                        {user ? (
                            <>
                                {/* THÔNG BÁO */}
                                <div className="group flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-50 transition-all cursor-pointer">
                                    <Badge dot color="#A435F0" offset={[-4, 6]}>
                                        <BellOutlined className="text-[22px] text-gray-600 group-hover:text-[#A435F0] transition-colors" />
                                    </Badge>
                                </div>
                                {/* AVATAR DROPDOWN */}
                                <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
                                    <div className="ml-2 flex items-center cursor-pointer">
                                        <Badge dot color="#52c41a" offset={[-4, 34]}>
                                            <Avatar size="large" icon={<UserOutlined />} src={user.avatarUrl} className="bg-[#A435F0]" />
                                        </Badge>
                                    </div>
                                </Dropdown>
                            </>
                        ) : (
                            <div className="flex items-center gap-2 ml-2">
                                <Link href="/login">
                                    <Button className="font-bold h-10 px-5 border-black text-black hover:!text-[#A435F0] hover:!border-[#A435F0] rounded-none transition-all">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button type="primary" className="font-bold h-10 px-5 !bg-[#A435F0] hover:!bg-[#8e2ce0] border-none rounded-none transition-all">
                                        Đăng ký
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- THANH MENUBAR DANH MỤC (PHẦN BẠN CẦN ĐÂY) --- */}
            <div
                className="relative border-t border-gray-100 shadow-sm hidden md:block"
                onMouseLeave={() => setHoveredCategory(null)}
            >
                {/* Bar Danh mục cấp 1 */}
                <div className="max-w-7xl mx-auto px-4 h-11 flex items-center justify-center gap-10">
                    {isLoading ? (
                        <Skeleton.Button active size="small" style={{ width: 800 }} />
                    ) : (
                        categories.map((cat) => (
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
                                {hoveredCategory === cat.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#A435F0]" />
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Bar Danh mục cấp 2 (Dropdown đen chuẩn Udemy) */}
                {!isLoading && categories.map((cat) => (
                    cat.children && cat.children.length > 0 && (
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
                                        className="text-[13px] font-medium text-white/90 hover:text-white transition-all whitespace-nowrap"
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