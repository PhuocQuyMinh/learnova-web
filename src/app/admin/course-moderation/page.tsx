"use client";

import { useState } from "react";
import { Table, Tag, Button, Drawer, Input, Space, Badge, Modal, Form, Divider, Avatar } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    EyeOutlined,
    PlayCircleOutlined,
    ClockCircleOutlined,
    BookOutlined,
    UserOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_PENDING_COURSES = [
    {
        id: "CRS-8812",
        title: "Làm chủ AI & ChatGPT trong công việc hàng ngày",
        instructor: { name: "Trần Trí Tuệ", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tue" },
        category: "Trí tuệ nhân tạo",
        submittedAt: "12/05/2026 08:30",
        status: "Pending", // Đang chờ duyệt
        details: {
            price: 1500000,
            totalDuration: "05:20:00",
            totalLessons: 32,
            description: "Khóa học hướng dẫn chi tiết cách ứng dụng AI để tự động hóa công việc văn phòng, viết email, tạo slide thuyết trình chỉ trong 5 phút.",
            promoVideo: "https://placehold.co/1280x720/1c1d1f/FFFFFF?text=Promo+Video",
        }
    },
    {
        id: "CRS-8815",
        title: "Tiếng Anh giao tiếp chuyên ngành IT",
        instructor: { name: "Sarah Trần", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
        category: "Ngoại ngữ",
        submittedAt: "11/05/2026 15:45",
        status: "Under Review", // Đang xem xét (Có admin khác đang mở xem)
        details: {
            price: 990000,
            totalDuration: "12:45:00",
            totalLessons: 60,
            description: "Học từ vựng, mẫu câu và cách phỏng vấn với các công ty công nghệ nước ngoài. Thực hành trực tiếp qua các tình huống giả định.",
            promoVideo: "https://placehold.co/1280x720/1c1d1f/FFFFFF?text=Promo+Video",
        }
    },
    {
        id: "CRS-8820",
        title: "Bí kíp khởi nghiệp F&B với số vốn 50 triệu",
        instructor: { name: "Lê Cà Phê", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cafe" },
        category: "Kinh doanh",
        submittedAt: "10/05/2026 09:10",
        status: "Pending",
        details: {
            price: 2500000,
            totalDuration: "08:15:00",
            totalLessons: 45,
            description: "Từ cách chọn mặt bằng, setup menu đến marketing 0 đồng cho quán cafe, trà sữa của bạn.",
            promoVideo: "https://placehold.co/1280x720/1c1d1f/FFFFFF?text=Promo+Video",
        }
    }
];

export default function AdminCourseModerationPage() {
    const [courses, setCourses] = useState(MOCK_PENDING_COURSES);
    const [selectedCourse, setSelectedCourse] = useState<any>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    // Hàm mở Drawer để xem chi tiết
    const handleReview = (course: any) => {
        setSelectedCourse(course);
        setDrawerVisible(true);
    };

    // Hàm mô phỏng Phê duyệt
    const handleApprove = () => {
        Modal.success({
            title: "Đã phê duyệt khóa học!",
            content: `Khóa học "${selectedCourse.title}" đã được xuất bản công khai lên hệ thống Leanova.`,
            onOk: () => {
                setCourses(courses.filter(c => c.id !== selectedCourse.id));
                setDrawerVisible(false);
            }
        });
    };

    // Hàm mô phỏng Yêu cầu chỉnh sửa (Từ chối tạm thời)
    const handleRejectSubmit = () => {
        // Ở đây sau này sẽ gọi API gửi email cho giảng viên
        console.log("Lý do từ chối:", rejectReason);
        setRejectModalVisible(false);
        setDrawerVisible(false);
        setRejectReason("");
        Modal.info({
            title: "Đã gửi yêu cầu chỉnh sửa",
            content: "Hệ thống đã gửi thông báo đến Giảng viên để họ cập nhật lại nội dung.",
        });
    };

    const columns = [
        {
            title: 'Mã KH',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500">{text}</span>,
        },
        {
            title: 'Tên khóa học',
            dataIndex: 'title',
            key: 'title',
            render: (text: string) => <span className="font-bold text-gray-800 line-clamp-1">{text}</span>,
            width: '30%',
        },
        {
            title: 'Giảng viên',
            dataIndex: 'instructor',
            key: 'instructor',
            render: (instructor: any) => (
                <div className="flex items-center gap-2">
                    <Avatar src={instructor.avatar} size="small" />
                    <span className="font-medium text-gray-700">{instructor.name}</span>
                </div>
            ),
        },
        {
            title: 'Danh mục',
            dataIndex: 'category',
            key: 'category',
            render: (text: string) => <Tag className="border-gray-200 text-gray-600 bg-gray-50">{text}</Tag>,
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'submittedAt',
            key: 'submittedAt',
            sorter: (a: any, b: any) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime(),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => (
                <Badge
                    status={status === 'Pending' ? 'warning' : 'processing'}
                    text={status === 'Pending' ? 'Chờ duyệt' : 'Đang xem xét'}
                    className="font-medium"
                />
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    className="bg-gray-800 hover:!bg-gray-700 border-none font-bold"
                    onClick={() => handleReview(record)}
                >
                    Kiểm tra
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER QUẢN TRỊ VIÊN */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Kiểm duyệt khóa học</h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Đảm bảo chất lượng nội dung trước khi xuất bản</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Đang chờ duyệt</div>
                            <div className="text-xl font-bold text-orange-500">{courses.length} khóa học</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* BẢNG DANH SÁCH */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <Table
                        columns={columns}
                        dataSource={courses}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="moderation-table"
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* DRAWER: KHUNG KIỂM DUYỆT CHI TIẾT BÊN PHẢI */}
            {/* ========================================== */}
            <Drawer
                title={
                    <div className="flex justify-between items-center w-full pr-8">
                        <span className="font-extrabold text-lg">Chi tiết xét duyệt</span>
                        <Tag color="orange" className="m-0 border-none px-3 py-1 font-bold">Mã: {selectedCourse?.id}</Tag>
                    </div>
                }
                placement="right"
                width={700}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                extra={
                    <Space>
                        <Button onClick={() => setDrawerVisible(false)}>Đóng</Button>
                    </Space>
                }
                footer={
                    <div className="flex justify-between items-center p-2">
                        <span className="text-xs text-gray-400">Hãy kiểm tra kỹ video giới thiệu và âm thanh.</span>
                        <Space>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => setRejectModalVisible(true)}
                                className="font-bold"
                            >
                                Yêu cầu chỉnh sửa
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleApprove}
                                className="!bg-[#52c41a] hover:!bg-[#389e0d] border-none font-bold"
                            >
                                Phê duyệt & Xuất bản
                            </Button>
                        </Space>
                    </div>
                }
            >
                {selectedCourse && (
                    <div className="flex flex-col gap-6">

                        {/* 1. Thông tin chung */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedCourse.title}</h2>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                <span className="flex items-center gap-1"><UserOutlined /> {selectedCourse.instructor.name}</span>
                                <span className="flex items-center gap-1"><BookOutlined /> {selectedCourse.category}</span>
                            </div>
                            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-100 text-[15px] leading-relaxed">
                                {selectedCourse.details.description}
                            </p>
                        </div>

                        {/* 2. Cấu trúc khóa học */}
                        <div className="flex gap-4">
                            <div className="flex-1 bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center gap-3">
                                <PlayCircleOutlined className="text-2xl text-[#A435F0]" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Tổng số bài học</div>
                                    <div className="text-xl font-bold text-gray-900">{selectedCourse.details.totalLessons} bài</div>
                                </div>
                            </div>
                            <div className="flex-1 bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-center gap-3">
                                <ClockCircleOutlined className="text-2xl text-blue-500" />
                                <div>
                                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Thời lượng</div>
                                    <div className="text-xl font-bold text-gray-900">{selectedCourse.details.totalDuration}</div>
                                </div>
                            </div>
                        </div>

                        <Divider className="m-0" />

                        {/* 3. Video xem trước (Promo Video) */}
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                                <EyeOutlined className="text-[#A435F0]" /> Video giới thiệu (Promo Video)
                            </h3>
                            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden relative shadow-inner">
                                <img src={selectedCourse.details.promoVideo} alt="Promo" className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-all">
                                    <PlayCircleOutlined className="text-white text-6xl shadow-md" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 text-center">Admin có thể click vào để xem trước nội dung và chất lượng âm thanh, hình ảnh.</p>
                        </div>

                        <Divider className="m-0" />

                        {/* 4. Giá bán đề xuất */}
                        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <span className="font-bold text-gray-700">Giá bán do Giảng viên đề xuất:</span>
                            <span className="text-2xl font-extrabold text-[#A435F0]">
                                {selectedCourse.details.price.toLocaleString('vi-VN')} ₫
                            </span>
                        </div>

                    </div>
                )}
            </Drawer>

            {/* ========================================== */}
            {/* MODAL: NHẬP LÝ DO TỪ CHỐI / YÊU CẦU SỬA */}
            {/* ========================================== */}
            <Modal
                title={<span className="text-red-500 font-bold">Yêu cầu chỉnh sửa khóa học</span>}
                open={rejectModalVisible}
                onCancel={() => setRejectModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setRejectModalVisible(false)}>Hủy</Button>,
                    <Button
                        key="submit"
                        danger
                        type="primary"
                        onClick={handleRejectSubmit}
                        disabled={!rejectReason.trim()}
                    >
                        Gửi yêu cầu cho Giảng viên
                    </Button>,
                ]}
            >
                <p className="text-gray-600 mb-4">
                    Hãy chỉ rõ những điểm chưa đạt yêu cầu (ví dụ: Video bài 3 bị rè, thiếu tài liệu thực hành, sai thông tin giới thiệu...) để giảng viên biết cách khắc phục.
                </p>
                <Form layout="vertical">
                    <Form.Item required>
                        <TextArea
                            rows={5}
                            placeholder="Nhập nội dung phản hồi chi tiết tại đây..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="focus:border-red-400 hover:border-red-400"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
        .moderation-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 700 !important;
        }
      `}} />
        </div>
    );
}