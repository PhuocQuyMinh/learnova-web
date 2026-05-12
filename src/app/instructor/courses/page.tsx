"use client";

import { useState } from "react";
import { Button, Input, Tag, Dropdown, MenuProps, Modal, Empty } from "antd";
import {
    SearchOutlined,
    PlusOutlined,
    MoreOutlined,
    EditOutlined,
    BarChartOutlined,
    DeleteOutlined,
    UsergroupAddOutlined,
    StarFilled
} from "@ant-design/icons";
import Link from "next/link";

// DỮ LIỆU TĨNH: DANH SÁCH KHÓA HỌC CỦA GIẢNG VIÊN
const MOCK_INSTRUCTOR_COURSES = [
    {
        id: 101,
        title: "Lập trình Node.js & Express RESTful API từ cơ bản đến nâng cao",
        status: "Published",
        thumbnail: "https://placehold.co/400x225/A435F0/FFFFFF?text=Node.js",
        price: 2496000,
        enrollments: 1250,
        rating: 4.8,
        lastUpdated: "12/05/2026",
    },
    {
        id: 102,
        title: "Master React.js & Next.js 14 - Xây dựng dự án thực tế",
        status: "Published",
        thumbnail: "https://placehold.co/400x225/1890ff/FFFFFF?text=React+NextJS",
        price: 1850000,
        enrollments: 840,
        rating: 4.9,
        lastUpdated: "01/04/2026",
    },
    {
        id: 103,
        title: "Làm chủ Cấu trúc dữ liệu và Giải thuật với C++",
        status: "Draft", // Bản nháp, chưa bán
        thumbnail: "https://placehold.co/400x225/e1e1e1/666666?text=Bản+Nháp",
        price: 1200000,
        enrollments: 0,
        rating: 0,
        lastUpdated: "Hôm nay",
    }
];

export default function InstructorCoursesPage() {
    const [courses, setCourses] = useState(MOCK_INSTRUCTOR_COURSES);
    const [searchTerm, setSearchTerm] = useState("");

    // Nút hành động (Dấu 3 chấm) cho từng khóa học
    const getActionMenu = (courseId: number, status: string): MenuProps["items"] => [
        {
            key: "edit",
            icon: <EditOutlined />,
            label: <Link href={`/instructor/courses/${courseId}/manage`}>Chỉnh sửa nội dung</Link>,
        },
        {
            key: "stats",
            icon: <BarChartOutlined />,
            label: <Link href={`/instructor/courses/${courseId}/performance`}>Thống kê doanh thu</Link>,
            disabled: status === "Draft", // Bản nháp thì không có doanh thu mà xem
        },
        { type: "divider" },
        {
            key: "delete",
            icon: <DeleteOutlined className="text-red-500" />,
            label: <span className="text-red-500 font-medium">Xóa khóa học</span>,
            onClick: () => {
                Modal.confirm({
                    title: "Bạn có chắc chắn muốn xóa khóa học này?",
                    content: "Hành động này không thể hoàn tác. Nếu khóa học đã có người mua, bạn chỉ có thể ẩn nó đi chứ không thể xóa hoàn toàn.",
                    okText: "Xóa",
                    okType: "danger",
                    cancelText: "Hủy",
                });
            }
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* HEADER QUẢN TRỊ RIÊNG CỦA GIẢNG VIÊN */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <h1 className="text-2xl font-extrabold text-gray-900 m-0">Khóa học của tôi</h1>
                    <Link href="/instructor/courses/create">
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold"
                        >
                            Tạo khóa học mới
                        </Button>
                    </Link>
                </div>
            </div>

            {/* NỘI DUNG CHÍNH */}
            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Thanh tìm kiếm & Lọc */}
                <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
                    <Input
                        size="large"
                        placeholder="Tìm kiếm khóa học của bạn..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="max-w-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* DANH SÁCH KHÓA HỌC */}
                {courses.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-lg py-24 flex flex-col items-center justify-center">
                        <Empty description={<span className="text-gray-500 text-lg">Bạn chưa tạo khóa học nào.</span>} />
                        <Link href="/instructor/courses/create" className="mt-6">
                            <Button type="primary" size="large" className="!bg-[#A435F0] border-none font-bold px-8">
                                Tạo khóa học đầu tiên
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {courses.map((course) => (
                            <div
                                key={course.id}
                                className="group flex flex-col md:flex-row bg-white border border-gray-200 hover:border-[#A435F0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all"
                            >
                                {/* Ảnh bìa */}
                                <div className="w-full md:w-64 h-36 flex-shrink-0 bg-gray-100 relative">
                                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                                    {/* Overlay mờ mờ khi hover để kích thích click vào sửa */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Thông tin khóa học */}
                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#A435F0] transition-colors cursor-pointer">
                                                {course.title}
                                            </h2>
                                            {/* Nút 3 chấm cho Mobile */}
                                            <Dropdown menu={{ items: getActionMenu(course.id, course.status) }} trigger={['click']} placement="bottomRight">
                                                <Button type="text" icon={<MoreOutlined className="text-xl" />} className="md:hidden" />
                                            </Dropdown>
                                        </div>

                                        <div className="mt-2 flex items-center gap-2">
                                            {course.status === "Published" ? (
                                                <Tag color="success" className="font-medium m-0 border-none">Đã xuất bản</Tag>
                                            ) : (
                                                <Tag color="default" className="font-medium m-0 border-none bg-gray-100 text-gray-600">Bản nháp</Tag>
                                            )}
                                            <span className="text-xs text-gray-500 hidden sm:inline">Cập nhật lần cuối: {course.lastUpdated}</span>
                                        </div>
                                    </div>

                                    {/* Thống kê (Chỉ hiện rõ nếu đã xuất bản, làm mờ nếu là bản nháp) */}
                                    <div className={`mt-4 flex flex-wrap gap-x-8 gap-y-2 text-sm ${course.status === "Draft" ? "opacity-40" : ""}`}>
                                        <div className="flex items-center gap-1.5 text-gray-600 font-medium">
                                            <UsergroupAddOutlined className="text-lg text-blue-500" />
                                            {course.enrollments.toLocaleString('vi-VN')} học viên
                                        </div>
                                        <div className="flex items-center gap-1 text-gray-600 font-medium">
                                            <StarFilled className="text-lg text-[#b4690e]" />
                                            {course.rating > 0 ? course.rating : "Chưa có đánh giá"}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-600 font-bold ml-auto sm:ml-0">
                                            {course.price.toLocaleString('vi-VN')} ₫
                                        </div>
                                    </div>
                                </div>

                                {/* Cột Hành động (Chỉ hiện trên Desktop, Desktop sẽ giấu menu 3 chấm ở trên) */}
                                <div className="hidden md:flex flex-col justify-center items-stretch gap-3 p-5 bg-gray-50 border-l border-gray-100 min-w-[200px]">
                                    <Link href={`/instructor/courses/${course.id}/manage`} className="w-full">
                                        <Button type="primary" ghost className="w-full font-bold !text-[#A435F0] !border-[#A435F0] hover:!bg-purple-50">
                                            Chỉnh sửa / Quản lý
                                        </Button>
                                    </Link>
                                    <Dropdown menu={{ items: getActionMenu(course.id, course.status) }} trigger={['click']} placement="bottomRight">
                                        <Button className="w-full font-medium">
                                            Nhiều hơn <MoreOutlined />
                                        </Button>
                                    </Dropdown>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}