"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, Row, Col, Typography, Button, Avatar } from "antd";
import {
    PlaySquareOutlined,
    DollarOutlined,
    MessageOutlined,
    UsergroupAddOutlined,
    RightOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function InstructorDashboard() {
    const { user, token } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!token) {
            router.push("/login?redirect=/instructor/dashboard");
            return;
        }
        if (user?.role !== "Instructor" && user?.role !== "Admin") {
            router.push("/apply-instructor");
        }
    }, [token, user, router]);

    const getInitials = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(" ");
        if (words.length > 1) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        return words[0][0].toUpperCase();
    };

    const dashboardCards = [
        {
            title: "Quản lý Tài chính",
            description: "Xem biểu đồ doanh thu, cài đặt ngân hàng và yêu cầu rút tiền.",
            icon: <DollarOutlined className="text-4xl text-green-500" />,
            link: "/instructor/revenue",
            bgClass: "bg-green-50 border-green-100",
            hoverClass: "hover:border-green-300"
        },
        {
            title: "Khóa học của tôi",
            description: "Tạo mới, chỉnh sửa nội dung bài học và quản lý các khóa học đang bán.",
            icon: <PlaySquareOutlined className="text-4xl text-blue-500" />,
            link: "/instructor/courses",
            bgClass: "bg-blue-50 border-blue-100",
            hoverClass: "hover:border-blue-300"
        },
        {
            title: "Hỏi đáp (Q&A)",
            description: "Tương tác, giải đáp thắc mắc của học viên để tăng độ uy tín.",
            icon: <MessageOutlined className="text-4xl text-orange-500" />,
            link: "/instructor/qa", // API lấy danh sách câu hỏi chưa trả lời đã có sẵn ở backend của bạn
            bgClass: "bg-orange-50 border-orange-100",
            hoverClass: "hover:border-orange-300"
        },
        {
            title: "Học viên",
            description: "Xem thống kê học viên đăng ký và đánh giá (Reviews) khóa học.",
            icon: <UsergroupAddOutlined className="text-4xl text-purple-500" />,
            link: "/instructor/students",
            bgClass: "bg-purple-50 border-purple-100",
            hoverClass: "hover:border-purple-300"
        }
    ];

    if (!user || user.role !== "Instructor") return null;

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Banner Lời chào */}
            <div className="bg-[#1c1d1f] py-16 px-8 text-white mb-12">
                <div className="max-w-7xl mx-auto flex items-center gap-6">
                    <Avatar size={90} src={user.avatarUrl} className="bg-learnova-purple text-2xl font-bold border-4 border-white shadow-lg">
                        {getInitials(user.fullName)}
                    </Avatar>
                    <div>
                        <Title level={2} className="!text-white !m-0">Chào mừng trở lại, {user.fullName}!</Title>
                        <Text className="text-gray-300 text-base mt-2 block">
                            Hôm nay là một ngày tuyệt vời để chia sẻ kiến thức và xây dựng cộng đồng của bạn.
                        </Text>
                    </div>
                </div>
            </div>

            {/* Các tính năng chính */}
            <div className="max-w-7xl mx-auto px-8">
                <Title level={3} className="!mb-8 text-gray-800">Không gian làm việc</Title>

                <Row gutter={[24, 24]}>
                    {dashboardCards.map((card, index) => (
                        <Col xs={24} md={12} lg={6} key={index}>
                            <Link href={card.link}>
                                <Card
                                    className={`h-full rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border ${card.bgClass} ${card.hoverClass} group`}
                                    bodyStyle={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}
                                >
                                    <div className="mb-4 bg-white w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
                                        {card.icon}
                                    </div>
                                    <Title level={4} className="!text-gray-900 group-hover:text-learnova-purple transition-colors">
                                        {card.title}
                                    </Title>
                                    <Text className="text-gray-600 flex-1 block mb-6">
                                        {card.description}
                                    </Text>

                                    <div className="mt-auto font-bold text-gray-900 group-hover:text-learnova-purple flex items-center gap-2 transition-colors">
                                        Truy cập ngay <RightOutlined className="text-xs" />
                                    </div>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>

                {/* Khu vực tạo khóa học nhanh */}
                <div className="mt-16 bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <Title level={3} className="!m-0 text-gray-900">Bắt đầu tạo khóa học mới?</Title>
                        <Text className="text-gray-600 mt-2 block text-base">
                            Chuẩn bị tài liệu, quay video và xây dựng cấu trúc khóa học để tiếp cận hàng triệu học viên.
                        </Text>
                    </div>
                    <Button type="primary" size="large" className="!bg-learnova-purple border-none font-bold h-12 px-8 flex-shrink-0">
                        Tạo khóa học ngay
                    </Button>
                </div>
            </div>
        </div>
    );
}