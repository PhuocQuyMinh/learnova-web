"use client";

import { useEffect, useState } from "react";
import { Button, List, Typography, Divider, message, Spin, Empty } from "antd";
import { DeleteOutlined, ShoppingCartOutlined, CreditCardOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const { Title, Text } = Typography;

export default function CartPage() {
    const router = useRouter();
    const { token, user } = useAuthStore();
    const { items, isLoading, fetchCart, removeFromCart, getTotalPrice } = useCartStore();

    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Vừa vào trang là lấy giỏ hàng từ API liền
    useEffect(() => {
        if (token) {
            fetchCart(token);
        }
    }, [token, fetchCart]);

    const handleRemove = async (courseId: number) => {
        if (token) {
            await removeFromCart(token, courseId);
        }
    };

    const handleCheckout = async () => {
        if (!token) return;
        setIsCheckingOut(true);

        try {
            // Gọi API checkout. CỰC KỲ AN TOÀN: Không cần truyền body gì cả vì backend tự tính tiền trong DB
            const response = await fetch("http://localhost:8000/api/store/checkout", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok && data.data?.paymentUrl) {
                // Backend trả về link VNPay -> Redirect người dùng qua đó
                window.location.href = data.data.paymentUrl;
            } else {
                message.error(data.message || "Không thể khởi tạo thanh toán.");
                setIsCheckingOut(false);
            }
        } catch (error) {
            console.error("Lỗi checkout:", error);
            message.error("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.");
            setIsCheckingOut(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Empty description="Bạn cần đăng nhập để xem giỏ hàng" />
                <Button type="primary" className="mt-4" onClick={() => router.push('/login?redirect=/cart')}>
                    Đăng nhập ngay
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8">

                {/* CỘT TRÁI: DANH SÁCH KHÓA HỌC */}
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100 min-h-[400px]">
                    <Title level={3} className="!mb-6">
                        <ShoppingCartOutlined className="mr-2 text-learnova-purple" />
                        Giỏ hàng của bạn ({items.length})
                    </Title>

                    {isLoading ? (
                        <div className="flex justify-center items-center h-40"><Spin size="large" /></div>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={items}
                            locale={{ emptyText: "Giỏ hàng trống. Hãy tìm thêm khóa học nhé!" }}
                            renderItem={(item) => (
                                <List.Item
                                    className="hover:bg-gray-50 transition-colors px-4 rounded-lg border-b border-gray-100 last:border-none"
                                    actions={[
                                        <Button
                                            type="text"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => handleRemove(item.courseId)} // Pass courseId
                                        >
                                            Xóa
                                        </Button>
                                    ]}
                                >
                                    <List.Item.Meta
                                        avatar={
                                            <div className="w-32 h-20 bg-gray-200 rounded overflow-hidden">
                                                <img
                                                    src={item.Course.coverImage || 'https://placehold.co/600x400?text=No+Image'}
                                                    alt={item.Course.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        }
                                        title={
                                            <Link href={`/courses/${item.courseId}`} className="text-lg font-bold text-gray-800 hover:text-learnova-purple">
                                                {item.Course.title}
                                            </Link>
                                        }
                                    />
                                    <div className="text-lg font-bold text-learnova-purple">
                                        {item.Course.price.toLocaleString('vi-VN')} VNĐ
                                    </div>
                                </List.Item>
                            )}
                        />
                    )}
                </div>

                {/* CỘT PHẢI: THANH TOÁN */}
                <div className="w-full md:w-80 h-fit bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-24">
                    <Title level={4} className="!mb-4">Tạm tính</Title>
                    <div className="flex justify-between items-center mb-4">
                        <Text className="text-gray-500">Tổng phụ:</Text>
                        <Text strong className="text-lg">{getTotalPrice().toLocaleString('vi-VN')} đ</Text>
                    </div>
                    <Divider className="my-4" />
                    <div className="flex justify-between items-center mb-6">
                        <Text className="font-bold text-gray-800 text-lg">Tổng cộng:</Text>
                        <Text strong className="text-2xl text-learnova-purple">
                            {getTotalPrice().toLocaleString('vi-VN')} đ
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        size="large"
                        block
                        icon={<CreditCardOutlined />}
                        className="!bg-learnova-purple hover:!bg-purple-700 border-none h-12 font-bold text-lg shadow-md"
                        onClick={handleCheckout}
                        loading={isCheckingOut || isLoading}
                        disabled={items.length === 0}
                    >
                        Thanh toán ngay
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Bằng việc thanh toán, bạn đồng ý với Điều khoản dịch vụ của Leanova.
                    </p>
                </div>

            </div>
        </div>
    );
}