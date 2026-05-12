"use client";

import { Button, Input, Divider, Rate, Empty } from "antd";
import { TagOutlined, DeleteOutlined, HeartOutlined } from "@ant-design/icons";
import Link from "next/link";
import Image from "next/image";

// DỮ LIỆU TĨNH (Mock Data) ĐỂ XEM TRƯỚC GIAO DIỆN
const MOCK_CART_ITEMS = [
    {
        id: 1,
        title: "Lập trình Node.js & Express RESTful API từ cơ bản đến nâng cao",
        instructor: "Trịnh Ạt Min",
        rating: 4.8,
        reviews: 1250,
        price: 2496000,
        originalPrice: 3200000,
        thumbnail: "https://placehold.co/400x225/A435F0/FFFFFF?text=Node.js", // Ảnh placeholder
    },
    {
        id: 2,
        title: "Master React.js & Next.js 14 - Xây dựng dự án thực tế",
        instructor: "Nguyễn Văn A",
        rating: 4.9,
        reviews: 3420,
        price: 1850000,
        originalPrice: 2500000,
        thumbnail: "https://placehold.co/400x225/1890ff/FFFFFF?text=React+NextJS",
    },
];

export default function CartPage() {
    const cartItems = MOCK_CART_ITEMS; // Thử đổi thành mảng rỗng [] để xem giao diện giỏ hàng trống

    // Tính toán tổng tiền mô phỏng
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);
    const totalOriginalPrice = cartItems.reduce((sum, item) => sum + item.originalPrice, 0);
    const discountAmount = totalOriginalPrice - totalPrice;

    return (
        <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

                {cartItems.length === 0 ? (
                    // ==========================================
                    // GIAO DIỆN KHI GIỎ HÀNG TRỐNG
                    // ==========================================
                    <div className="border border-gray-200 rounded-lg py-20 flex flex-col items-center justify-center bg-gray-50">
                        <Empty
                            description={<span className="text-gray-500 text-lg">Giỏ hàng của bạn đang trống. Hãy tiếp tục mua sắm để tìm một khóa học!</span>}
                        />
                        <Link href="/" className="mt-6">
                            <Button type="primary" size="large" className="!bg-[#A435F0] border-none font-bold px-8">
                                Tiếp tục mua sắm
                            </Button>
                        </Link>
                    </div>
                ) : (
                    // ==========================================
                    // GIAO DIỆN KHI CÓ KHÓA HỌC TRONG GIỎ HÀNG
                    // ==========================================
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* CỘT TRÁI: DANH SÁCH KHÓA HỌC (Chiếm 3/4) */}
                        <div className="w-full lg:w-3/4">
                            <p className="text-lg font-bold text-gray-700 mb-4">{cartItems.length} khóa học trong giỏ</p>

                            <div className="flex flex-col gap-6">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex flex-col sm:flex-row gap-4 border border-gray-200 p-4 rounded-lg hover:shadow-sm transition-shadow">

                                        {/* Ảnh khóa học */}
                                        <div className="w-full sm:w-48 h-28 flex-shrink-0 bg-gray-200 rounded-md overflow-hidden relative">
                                            <img src={item.thumbnail} alt={item.title} className="object-cover w-full h-full" />
                                        </div>

                                        {/* Thông tin chính */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">Bởi {item.instructor}</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-bold text-[#b4690e]">{item.rating}</span>
                                                    <Rate disabled defaultValue={item.rating} allowHalf className="text-sm text-[#b4690e]" />
                                                    <span className="text-xs text-gray-400">({item.reviews.toLocaleString('vi-VN')} đánh giá)</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tương tác & Giá tiền */}
                                        <div className="flex flex-row sm:flex-col justify-between sm:items-end w-full sm:w-auto mt-4 sm:mt-0">
                                            <div className="flex flex-col text-left sm:text-right">
                                                <span className="text-xl font-extrabold text-[#A435F0]">
                                                    {item.price.toLocaleString('vi-VN')} đ
                                                </span>
                                                <span className="text-sm text-gray-400 line-through">
                                                    {item.originalPrice.toLocaleString('vi-VN')} đ
                                                </span>
                                            </div>
                                            <div className="flex sm:flex-col gap-3 text-[#A435F0] text-sm">
                                                <span className="cursor-pointer hover:text-purple-900 font-medium flex items-center gap-1">
                                                    <DeleteOutlined /> Xóa
                                                </span>
                                                <span className="cursor-pointer hover:text-purple-900 font-medium flex items-center gap-1">
                                                    <HeartOutlined /> Yêu thích
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG (Chiếm 1/4) */}
                        <div className="w-full lg:w-1/4">
                            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-600 mb-4">Tổng cộng</h3>

                                <div className="flex flex-col gap-2 mb-4">
                                    <div className="flex justify-between items-center text-gray-500">
                                        <span>Giá gốc:</span>
                                        <span className="line-through">{totalOriginalPrice.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                                    </div>
                                    <Divider className="my-2" />
                                    <div className="text-3xl font-extrabold text-gray-900 mb-2">
                                        {totalPrice.toLocaleString('vi-VN')} đ
                                    </div>
                                </div>

                                <Button
                                    type="primary"
                                    size="large"
                                    className="w-full h-12 text-lg font-bold !bg-[#A435F0] hover:!bg-[#8e2ce0] border-none rounded-none"
                                >
                                    Thanh toán
                                </Button>

                                <div className="mt-6">
                                    <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                        <TagOutlined /> Nhập mã giảm giá
                                    </p>
                                    <div className="flex">
                                        <Input placeholder="Mã giảm giá" className="rounded-none rounded-l-md border-r-0" />
                                        <Button className="rounded-none rounded-r-md !bg-gray-800 !text-white hover:!bg-gray-700 border-none font-bold">
                                            Áp dụng
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}