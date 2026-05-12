"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
    Card, Progress, Input, Select, Button, Skeleton,
    Empty, Pagination, Typography, message
} from "antd";
import {
    SearchOutlined,
    PlayCircleOutlined,
    CheckCircleFilled,
    BookOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

// Định nghĩa interface dựa trên response của API
interface EnrolledCourse {
    id: number;
    courseId: number;
    progressPercent: number;
    Course: {
        id: number;
        title: string;
        coverImage: string;
        instructor: {
            id: number;
            fullName: string;
        }
    };
}

export default function MyLearningPage() {
    const { token, user } = useAuthStore();
    const router = useRouter();

    const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // State cho bộ lọc và phân trang
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [progressFilter, setProgressFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 8; // Số khóa học trên mỗi trang

    const fetchMyCourses = useCallback(async () => {
        if (!token) return;
        setIsLoading(true);

        try {
            // Xây dựng URL với các tham số query
            let url = `http://localhost:8000/api/store/my-courses?page=${currentPage}&limit=${pageSize}`;

            if (keyword) url += `&keyword=${encodeURIComponent(keyword)}`;

            // Xử lý bộ lọc tiến độ
            if (progressFilter === "not_started") {
                url += `&maxProgress=0`;
            } else if (progressFilter === "in_progress") {
                url += `&minProgress=1&maxProgress=99`;
            } else if (progressFilter === "completed") {
                url += `&minProgress=100`;
            }

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setEnrollments(data.data.enrollments);
                setTotalItems(data.data.totalItems);
            } else {
                message.error(data.message || "Không thể tải danh sách khóa học");
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách khóa học:", error);
            message.error("Lỗi kết nối đến máy chủ.");
        } finally {
            setIsLoading(false);
        }
    }, [token, currentPage, keyword, progressFilter]);

    // Chạy fetch khi các dependency thay đổi
    useEffect(() => {
        if (!token) {
            router.push("/login?redirect=/my-learning");
            return;
        }
        fetchMyCourses();
    }, [fetchMyCourses, token, router]);

    // Xử lý tìm kiếm khi ấn Enter hoặc bấm nút
    const handleSearch = () => {
        setCurrentPage(1); // Reset về trang 1 khi tìm kiếm mới
        setKeyword(searchInput);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* HEADER */}
                <div className="mb-8">
                    <Title level={2} className="!mb-2 !font-extrabold flex items-center gap-3">
                        <BookOutlined className="text-learnova-purple" /> Không gian học tập của tôi
                    </Title>
                    <Text className="text-gray-500 text-base">
                        Tiếp tục hành trình chinh phục tri thức của bạn cùng Leanova
                    </Text>
                </div>

                {/* BỘ LỌC (FILTERS) */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 mb-8">
                    <Input
                        placeholder="Tìm kiếm khóa học..."
                        size="large"
                        prefix={<SearchOutlined className="text-gray-400" />}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onPressEnter={handleSearch}
                        className="max-w-md"
                    />
                    <Button type="primary" size="large" onClick={handleSearch} className="!bg-learnova-purple border-none">
                        Tìm kiếm
                    </Button>

                    <div className="sm:ml-auto flex items-center gap-3">
                        <Text strong>Trạng thái:</Text>
                        <Select
                            size="large"
                            defaultValue="all"
                            style={{ width: 180 }}
                            onChange={(value) => {
                                setProgressFilter(value);
                                setCurrentPage(1); // Reset page khi đổi bộ lọc
                            }}
                            options={[
                                { value: 'all', label: 'Tất cả khóa học' },
                                { value: 'not_started', label: 'Chưa bắt đầu (0%)' },
                                { value: 'in_progress', label: 'Đang học (1-99%)' },
                                { value: 'completed', label: 'Đã hoàn thành (100%)' },
                            ]}
                        />
                    </div>
                </div>

                {/* DANH SÁCH KHÓA HỌC */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map(n => (
                            <Card key={n} className="rounded-xl overflow-hidden shadow-sm">
                                <Skeleton.Image active className="!w-full !h-40 mb-4" />
                                <Skeleton active paragraph={{ rows: 2 }} />
                            </Card>
                        ))}
                    </div>
                ) : enrollments.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 py-20">
                        <Empty
                            description={<span className="text-gray-500 text-lg">Bạn chưa có khóa học nào khớp với tìm kiếm.</span>}
                        >
                            <Link href="/">
                                <Button type="primary" size="large" className="mt-4 !bg-learnova-purple border-none font-bold">
                                    Khám phá khóa học ngay
                                </Button>
                            </Link>
                        </Empty>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                            {enrollments.map((enrollment) => (
                                <Card
                                    key={enrollment.id}
                                    hoverable
                                    className="rounded-xl overflow-hidden shadow-sm border border-gray-100 group transition-all duration-300 hover:shadow-md"
                                    cover={
                                        <div className="relative h-40 overflow-hidden bg-gray-200">
                                            <img
                                                alt={enrollment.Course.title}
                                                src={enrollment.Course.coverImage || "https://placehold.co/600x400?text=Course"}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            {/* Nút Overlay Play khi hover */}
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <PlayCircleOutlined className="text-white text-5xl" />
                                            </div>
                                        </div>
                                    }
                                    bodyStyle={{ padding: '20px' }}
                                    onClick={() => router.push(`/learning/${enrollment.Course.id}`)}
                                >
                                    <div className="h-12 mb-2">
                                        <h3 className="font-bold text-gray-800 line-clamp-2 text-base group-hover:text-learnova-purple transition-colors">
                                            {enrollment.Course.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-4">
                                        {enrollment.Course.instructor.fullName}
                                    </p>

                                    {/* THANH TIẾN ĐỘ (PROGRESS BAR) */}
                                    <div className="mt-auto">
                                        <div className="flex justify-between items-end mb-1">
                                            <Text className="text-xs font-semibold text-gray-600">
                                                {enrollment.progressPercent === 100 ? (
                                                    <span className="text-green-600 flex items-center gap-1"><CheckCircleFilled /> Đã hoàn thành</span>
                                                ) : enrollment.progressPercent === 0 ? (
                                                    "Chưa bắt đầu"
                                                ) : (
                                                    "Tiến độ học tập"
                                                )}
                                            </Text>
                                            <Text className="text-xs font-bold text-learnova-purple">{enrollment.progressPercent}%</Text>
                                        </div>
                                        <Progress
                                            percent={enrollment.progressPercent}
                                            showInfo={false}
                                            strokeColor={enrollment.progressPercent === 100 ? "#52c41a" : "#A435F0"}
                                            trailColor="#f0f0f0"
                                            size="small"
                                        />
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* PHÂN TRANG */}
                        {totalItems > pageSize && (
                            <div className="flex justify-center mt-8">
                                <Pagination
                                    current={currentPage}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    onChange={(page) => setCurrentPage(page)}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}