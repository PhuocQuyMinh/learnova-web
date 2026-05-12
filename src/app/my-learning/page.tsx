"use client";

import { Progress, Button, Empty, Tabs } from "antd";
import { PlayCircleFilled, CheckCircleFilled } from "@ant-design/icons";
import Link from "next/link";

// DỮ LIỆU TĨNH (Mock Data) KẾT QUẢ TỪ API: getMyEnrollments
const MOCK_ENROLLMENTS = [
    {
        id: 1,
        courseId: 101,
        title: "Lập trình Node.js & Express RESTful API từ cơ bản đến nâng cao",
        instructor: "Trịnh Ạt Min",
        thumbnail: "https://placehold.co/400x225/A435F0/FFFFFF?text=Node.js+RESTful+API", // Dùng lại ảnh lúc nãy cho chân thực
        progressPercent: 45,
    },
    {
        id: 2,
        courseId: 102,
        title: "Master React.js & Next.js 14 - Xây dựng dự án thực tế",
        instructor: "Nguyễn Văn A",
        thumbnail: "https://placehold.co/400x225/1890ff/FFFFFF?text=React+NextJS",
        progressPercent: 100, // Đã hoàn thành
    },
    {
        id: 3,
        courseId: 103,
        title: "Làm chủ Docker & CI/CD trong 8 giờ",
        instructor: "Trần B",
        thumbnail: "https://placehold.co/400x225/fa8c16/FFFFFF?text=Docker",
        progressPercent: 0, // Chưa học tí nào
    }
];

export default function MyLearningPage() {
    const enrollments = MOCK_ENROLLMENTS; // Thử đổi thành [] để xem lúc chưa mua khóa nào

    return (
        <div className="min-h-screen bg-white">
            {/* HEADER ĐEN ĐẶC TRƯNG CỦA TRANG HỌC TẬP */}
            <div className="bg-[#1c1d1f] py-12 px-4 sm:px-6 lg:px-8 text-white">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-extrabold mb-0">Không gian học tập</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs
                    defaultActiveKey="all"
                    size="large"
                    items={[
                        {
                            key: "all",
                            label: <span className="font-bold">Tất cả khóa học</span>,
                            children: (
                                <div className="pt-4">
                                    {enrollments.length === 0 ? (
                                        // ==========================================
                                        // GIAO DIỆN KHI CHƯA MUA KHÓA HỌC NÀO
                                        // ==========================================
                                        <div className="border border-gray-200 rounded-lg py-24 flex flex-col items-center justify-center bg-gray-50 mt-4">
                                            <Empty
                                                description={<span className="text-gray-500 text-lg">Bạn chưa đăng ký khóa học nào.</span>}
                                            />
                                            <Link href="/" className="mt-6">
                                                <Button type="primary" size="large" className="!bg-[#A435F0] border-none font-bold px-8">
                                                    Khám phá khóa học ngay
                                                </Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        // ==========================================
                                        // LƯỚI DANH SÁCH KHÓA HỌC (GRID)
                                        // ==========================================
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                            {enrollments.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex flex-col border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group cursor-pointer"
                                                >
                                                    {/* Ảnh bìa khóa học + Nút Play Overlay */}
                                                    <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
                                                        <img
                                                            src={item.thumbnail}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {/* Lớp phủ đen mờ hiện lên khi hover */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <PlayCircleFilled className="text-white text-5xl shadow-sm" />
                                                        </div>
                                                    </div>

                                                    {/* Thông tin khóa học */}
                                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                                        <div>
                                                            <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#A435F0] transition-colors">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-xs text-gray-500 mt-2">Giảng viên: {item.instructor}</p>
                                                        </div>

                                                        {/* Thanh tiến độ (Progress Bar) */}
                                                        <div className="mt-4">
                                                            <div className="flex justify-between items-end mb-1 text-xs font-medium text-gray-600">
                                                                <span>Tiến độ học tập</span>
                                                                {item.progressPercent === 100 ? (
                                                                    <span className="text-green-600 flex items-center gap-1"><CheckCircleFilled /> Hoàn thành</span>
                                                                ) : (
                                                                    <span>{item.progressPercent}%</span>
                                                                )}
                                                            </div>
                                                            <Progress
                                                                percent={item.progressPercent}
                                                                showInfo={false}
                                                                strokeColor={item.progressPercent === 100 ? "#52c41a" : "#A435F0"}
                                                                trailColor="#e5e7eb"
                                                                size="small"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ),
                        },
                        { key: "in_progress", label: <span className="font-bold">Đang học</span>, children: <p className="py-10 text-center text-gray-500">Chức năng lọc sẽ ghép cùng API</p> },
                        { key: "completed", label: <span className="font-bold">Đã hoàn thành</span>, children: <p className="py-10 text-center text-gray-500">Chức năng lọc sẽ ghép cùng API</p> },
                    ]}
                />
            </div>
        </div>
    );
}