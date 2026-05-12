"use client";

import { useState } from "react";
import { Table, Tag, Button, Drawer, Input, Space, Badge, Modal, Form, Avatar, Descriptions, Divider } from "antd";
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    SolutionOutlined,
    LinkOutlined,
    FilePdfOutlined,
    MailOutlined,
    BankOutlined,
    IdcardOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_APPLICATIONS = [
    {
        id: "APP-1042",
        user: {
            name: "Phạm Văn Code",
            email: "phamcode.dev@gmail.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Code"
        },
        expertise: "Công nghệ thông tin & Lập trình",
        experience: "3 - 5 năm",
        headline: "Senior Backend Developer tại TechCorp",
        bio: "Tôi có 5 năm kinh nghiệm làm việc với Node.js, Go và hệ thống Microservices. Tôi từng đào tạo nội bộ cho nhiều lứa Fresher tại công ty và mong muốn chia sẻ kiến thức này đến cộng đồng rộng lớn hơn qua Leanova.",
        portfolioUrl: "https://github.com/phamcode-dev",
        cvUrl: "#", // Link giả lập tải file
        appliedAt: "12/05/2026 09:15",
        status: "Pending",
    },
    {
        id: "APP-1045",
        user: {
            name: "Nguyễn Thị Marketing",
            email: "nguyen.mkt@yahoo.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mkt"
        },
        expertise: "Marketing & Truyền thông",
        experience: "Dưới 1 năm",
        headline: "Digital Marketing Freelancer",
        bio: "Mình mới làm marketing được 6 tháng nhưng có nhiều case study chạy ads giá rẻ. Mình muốn mở khóa học dạy chạy quảng cáo Facebook.",
        portfolioUrl: "",
        cvUrl: null,
        appliedAt: "11/05/2026 14:20",
        status: "Under Review",
    },
    {
        id: "APP-1048",
        user: {
            name: "Lê Design",
            email: "le.uiux@outlook.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Design"
        },
        expertise: "Thiết kế đồ họa & UI/UX",
        experience: "Trên 5 năm",
        headline: "Product Designer | 10k+ Followers on Behance",
        bio: "Đam mê thiết kế trải nghiệm người dùng. Đã từng làm việc với các startup kỳ lân tại Việt Nam. Mong muốn truyền đạt tư duy thiết kế thực chiến, không lý thuyết suông.",
        portfolioUrl: "https://behance.net/le-design",
        cvUrl: "#",
        appliedAt: "10/05/2026 16:00",
        status: "Pending",
    }
];

export default function AdminInstructorModerationPage() {
    const [applications, setApplications] = useState(MOCK_APPLICATIONS);
    const [selectedApp, setSelectedApp] = useState<any>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    const handleReview = (app: any) => {
        setSelectedApp(app);
        setDrawerVisible(true);
    };

    const handleApprove = () => {
        Modal.confirm({
            title: "Xác nhận nâng cấp tài khoản?",
            icon: <CheckCircleOutlined className="text-green-500" />,
            content: `Hệ thống sẽ cấp quyền Giảng viên cho tài khoản "${selectedApp.user.email}". Họ sẽ có thể tạo và xuất bản khóa học ngay lập tức.`,
            okText: "Phê duyệt ngay",
            cancelText: "Hủy",
            onOk: () => {
                setApplications(applications.filter(a => a.id !== selectedApp.id));
                setDrawerVisible(false);
                // Ở đây sẽ gọi API cập nhật role = 'instructor'
            }
        });
    };

    const handleRejectSubmit = () => {
        console.log("Lý do từ chối:", rejectReason);
        setRejectModalVisible(false);
        setDrawerVisible(false);
        setRejectReason("");
        // Cập nhật state xóa khỏi danh sách chờ
        setApplications(applications.filter(a => a.id !== selectedApp.id));
    };

    const columns = [
        {
            title: 'Mã HS',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500">{text}</span>,
        },
        {
            title: 'Ứng viên',
            key: 'user',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-3">
                    <Avatar src={record.user.avatar} className="bg-gray-200" />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{record.user.name}</span>
                        <span className="text-xs text-gray-500">{record.user.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Lĩnh vực',
            dataIndex: 'expertise',
            key: 'expertise',
            render: (text: string) => <Tag className="border-gray-200 text-gray-700 bg-gray-50">{text}</Tag>,
        },
        {
            title: 'Kinh nghiệm',
            dataIndex: 'experience',
            key: 'experience',
            render: (text: string) => <span className="font-medium text-gray-600">{text}</span>,
        },
        {
            title: 'Ngày nộp',
            dataIndex: 'appliedAt',
            key: 'appliedAt',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => (
                <Badge
                    status={status === 'Pending' ? 'warning' : 'processing'}
                    text={status === 'Pending' ? 'Chờ duyệt' : 'Đang xem'}
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
                    icon={<SolutionOutlined />}
                    className="bg-gray-800 hover:!bg-gray-700 border-none font-bold"
                    onClick={() => handleReview(record)}
                >
                    Xem hồ sơ
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Xét duyệt Giảng viên</h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Quản lý các yêu cầu trở thành đối tác giảng dạy</p>
                    </div>
                    <div className="flex gap-4 text-right">
                        <div>
                            <div className="text-sm text-gray-500">Hồ sơ chờ duyệt</div>
                            <div className="text-xl font-bold text-orange-500">{applications.length} hồ sơ</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <Table
                        columns={columns}
                        dataSource={applications}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="moderation-table"
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* DRAWER: CHI TIẾT HỒ SƠ ỨNG VIÊN */}
            {/* ========================================== */}
            <Drawer
                title={
                    <div className="flex justify-between items-center w-full pr-8">
                        <span className="font-extrabold text-lg">Hồ sơ Ứng viên</span>
                        <Tag color="blue" className="m-0 border-none px-3 py-1 font-bold">{selectedApp?.id}</Tag>
                    </div>
                }
                placement="right"
                width={650}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                extra={<Button onClick={() => setDrawerVisible(false)}>Đóng</Button>}
                footer={
                    <div className="flex justify-between items-center p-4">
                        <span className="text-xs text-gray-500">Hãy đảm bảo ứng viên đáp ứng đủ tiêu chuẩn chất lượng.</span>
                        <Space>
                            <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => setRejectModalVisible(true)}
                                className="font-bold"
                            >
                                Từ chối
                            </Button>
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={handleApprove}
                                className="!bg-[#52c41a] hover:!bg-[#389e0d] border-none font-bold"
                            >
                                Phê duyệt Giảng viên
                            </Button>
                        </Space>
                    </div>
                }
            >
                {selectedApp && (
                    <div className="flex flex-col gap-6">

                        {/* Header Profile */}
                        <div className="flex items-start gap-5 bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <Avatar src={selectedApp.user.avatar} size={80} className="border-2 border-white shadow-sm" />
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold text-gray-900 m-0 mb-1">{selectedApp.user.name}</h2>
                                <div className="text-[#A435F0] font-medium mb-3 flex items-center gap-2">
                                    <IdcardOutlined /> {selectedApp.headline}
                                </div>
                                <div className="flex flex-col gap-1 text-sm text-gray-600">
                                    <span className="flex items-center gap-2"><MailOutlined /> {selectedApp.user.email}</span>
                                    <span className="flex items-center gap-2"><BankOutlined /> {selectedApp.expertise} • {selectedApp.experience} kinh nghiệm</span>
                                </div>
                            </div>
                        </div>

                        {/* Giới thiệu chi tiết */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Giới thiệu bản thân & Kinh nghiệm</h3>
                            <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg border border-gray-200 text-[15px]">
                                {selectedApp.bio}
                            </p>
                        </div>

                        <Divider className="m-0" />

                        {/* Tài liệu xác thực (CV / Portfolio) */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-4">Hồ sơ đính kèm</h3>

                            <Descriptions column={1} bordered size="small" className="bg-white">
                                <Descriptions.Item label={<span className="font-medium">Link Portfolio / LinkedIn</span>}>
                                    {selectedApp.portfolioUrl ? (
                                        <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                            <LinkOutlined /> {selectedApp.portfolioUrl}
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 italic">Không cung cấp</span>
                                    )}
                                </Descriptions.Item>

                                <Descriptions.Item label={<span className="font-medium">CV đính kèm</span>}>
                                    {selectedApp.cvUrl ? (
                                        <Button type="link" icon={<FilePdfOutlined />} className="p-0 text-red-500 font-medium">
                                            Xem_CV_Ung_Vien.pdf
                                        </Button>
                                    ) : (
                                        <span className="text-gray-400 italic">Không đính kèm file</span>
                                    )}
                                </Descriptions.Item>
                            </Descriptions>
                        </div>

                    </div>
                )}
            </Drawer>

            {/* ========================================== */}
            {/* MODAL: TỪ CHỐI HỒ SƠ */}
            {/* ========================================== */}
            <Modal
                title={<span className="text-red-500 font-bold">Từ chối hồ sơ Giảng viên</span>}
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
                        Từ chối hồ sơ
                    </Button>,
                ]}
            >
                <p className="text-gray-600 mb-4">
                    Hệ thống sẽ gửi email thông báo từ chối đến ứng viên. Vui lòng cho họ biết lý do để họ có thể cải thiện trong tương lai.
                </p>
                <Form layout="vertical">
                    <Form.Item required>
                        <TextArea
                            rows={4}
                            placeholder="Ví dụ: Cảm ơn bạn đã quan tâm. Hiện tại Leanova yêu cầu tối thiểu 1 năm kinh nghiệm thực tế cho lĩnh vực Marketing..."
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