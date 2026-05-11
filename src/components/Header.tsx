"use client";

import { useState, useEffect } from "react"; // Thêm useEffect
import Link from "next/link";
import { Input, Badge, Avatar, Dropdown, Button, MenuProps, Skeleton } from "antd";
import { SearchOutlined, HeartOutlined, ShoppingCartOutlined, BellOutlined, UserOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore"; // Import Store mới
import { useRouter, usePathname } from "next/navigation";

export default function Header() {
    const { user, logout } = useAuthStore();
    const { categories, isLoading, fetchCategories } = useCategoryStore(); // Lấy data từ Store
    const router = useRouter();
    const pathname = usePathname();
    const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
    const [searchValue, setSearchValue] = useState("");

    // Hàm xử lý tìm kiếm
    const handleSearch = () => {
        if (searchValue.trim()) {
            router.push(`/search?keyword=${encodeURIComponent(searchValue)}`);
        }
    };

    // Gọi API ngay khi Component Header được khởi tạo
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const hideHeaderRoutes = ["/login", "/register", "/forgot-password"];
    if (hideHeaderRoutes.includes(pathname)) return null;

    const userMenuItems: MenuProps["items"] = [
        { key: "profile", label: <Link href="/profile">Hồ sơ của tôi</Link> },
        { type: "divider" },
        { key: "logout", label: "Đăng xuất", danger: true, onClick: () => { logout(); router.push("/"); } },
    ];

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex-shrink-0 w-44">
                    <Link href="/"><h1 className="text-3xl font-extrabold text-[#A435F0] m-0 tracking-tighter">Leanova</h1></Link>
                </div>
                <div className="flex-1 flex justify-center max-w-2xl px-4">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm nội dung bất kỳ..."
                        prefix={<SearchOutlined className="text-gray-400 mr-2" />}
                        className="
      rounded-full bg-[#f7f9fa] h-11 w-full border-gray-300 
      transition-all duration-300
      hover:!border-[#A435F0] 
      focus:!border-[#A435F0] 
      focus:!shadow-[0_0_0_2px_rgba(164,53,240,0.1)]
    "
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onPressEnter={handleSearch}
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
                                <Link href="/login">
                                    <Button
                                        className="font-bold h-10 px-5 border-black text-black hover:!text-[#A435F0] hover:!border-[#A435F0] hover:!bg-[#f8f0ff] rounded-none transition-all"
                                    >
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button
                                        type="primary"
                                        /* 1. Sử dụng !bg-learnova-purple và !hover:bg-learnova-purple-hover */
                                        /* 2. Đổi rounded-learnova thành rounded-none nếu bạn muốn kiểu sắc sảo của Udemy */
                                        className="font-bold h-10 px-5 !bg-[#A435F0] hover:!bg-[#8e2ce0] border-none rounded-none transition-all"
                                        /* 3. Thêm style inline để đảm bảo Antd không ghi đè màu xanh lúc mới load trang */
                                        style={{ backgroundColor: '#A435F0' }}
                                    >
                                        Đăng ký
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* THANH MENUBAR 2 & 3: Danh mục động từ API */}
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

                {/* Bar Danh mục cấp 2 (Màu tím đậm - Concept Udemy) */}
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