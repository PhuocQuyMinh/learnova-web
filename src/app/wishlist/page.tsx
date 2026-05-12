"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { Card, Typography, Spin, Empty, Button, message, Rate } from "antd";
import { HeartFilled, HeartOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";

const { Title, Text } = Typography;

export default function WishlistPage() {
    const { token } = useAuthStore();
    const { addToCart } = useCartStore();
    const router = useRouter();
    const [favorites, setFavorites] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchFavorites = async () => {
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8000/api/store/my-favorites", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) setFavorites(data.data.favorites);
        } catch (error) {
            message.error("Lỗi lấy danh sách yêu thích");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            router.push("/login?redirect=/wishlist");
            return;
        }
        fetchFavorites();
    }, [token, router]);

    // Hủy yêu thích
    const handleToggleFavorite = async (courseId: number) => {
        try {
            const res = await fetch(`http://localhost:8000/api/store/courses/${courseId}/favorite`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                // Xóa khỏi danh sách hiển thị
                setFavorites(prev => prev.filter(f => f.Course.id !== courseId));
                message.success("Đã xóa khỏi danh sách yêu thích");
            }
        } catch (error) {
            message.error("Lỗi thao tác");
        }
    };

    // Chuyển thẳng từ Yêu thích vào Giỏ hàng
    const handleMoveToCart = async (courseId: number) => {
        if (!token) return;
        const success = await addToCart(token, courseId);
        if (success) {
            handleToggleFavorite(courseId); // Thêm vào giỏ thành công thì xóa khỏi wishlist
            router.push("/cart");
        }
    };

    if (isLoading) return <div className="min-h-screen flex justify-center py-20"><Spin size="large" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <Title level={2} className="!mb-8 flex items-center gap-2">
                    <HeartFilled className="text-red-500" /> Khóa học yêu thích
                </Title>

                {favorites.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-xl shadow-sm border border-gray-100">
                        <Empty description="Bạn chưa lưu khóa học nào." />
                        <Link href="/"><Button type="primary" className="mt-4 !bg-learnova-purple">Khám phá ngay</Button></Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {favorites.map((fav) => (
                            <Card
                                key={fav.id}
                                hoverable
                                className="rounded-xl overflow-hidden shadow-sm"
                                cover={<img alt="course" src={fav.Course.coverImage} className="h-40 object-cover" />}
                                actions={[
                                    <div onClick={() => handleToggleFavorite(fav.Course.id)} className="text-red-500 hover:text-red-600 px-4 font-medium flex items-center justify-center gap-1">
                                        <HeartFilled /> Bỏ thích
                                    </div>,
                                    <div onClick={() => handleMoveToCart(fav.Course.id)} className="text-learnova-purple hover:text-purple-700 font-bold flex items-center justify-center gap-1">
                                        <ShoppingCartOutlined /> Vào giỏ
                                    </div>
                                ]}
                            >
                                <Card.Meta
                                    title={<Link href={`/courses/${fav.Course.id}`} className="hover:text-learnova-purple">{fav.Course.title}</Link>}
                                    description={fav.Course.instructor?.fullName}
                                />
                                <div className="mt-3 flex justify-between items-center">
                                    <Rate disabled defaultValue={fav.Course.averageRating || 5} className="text-sm" />
                                    <span className="font-bold text-lg text-gray-800">{fav.Course.price.toLocaleString('vi-VN')} đ</span>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}