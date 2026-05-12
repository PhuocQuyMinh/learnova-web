"use client";

import { useState } from "react";
import { Table, Tag, Button, Drawer, Space, Badge, Modal, Form, Input, Avatar, Alert, Divider, Typography } from "antd";
import {
    FlagOutlined,
    DeleteOutlined,
    StopOutlined,
    CheckOutlined,
    MessageOutlined,
    WarningOutlined,
    ExclamationCircleFilled
} from "@ant-design/icons";

const { TextArea } = Input;
const { Text } = Typography;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_REPORTS = [
    {
        id: "REP-901",
        type: "Review", // Báo cáo đánh giá
        courseTitle: "Lập trình Node.js & Express RESTful API",
        reportedContent: "Khóa học như hạch, dạy thì chậm. Ai muốn học nhanh qua web abc.xyz mua khóa của thầy Z bao xịn rẻ hơn 1 nửa!",
        reporter: { name: "Trịnh Ạt Min", role: "Giảng viên" },
        accused: {
            name: "Trần Trẻ Trâu",
            email: "tretrau9x@gmail.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Trau",
            warningCount: 2 // Đã từng bị cảnh cáo 2 lần
        },
        reason: "Quảng cáo nền tảng đối thủ và dùng từ ngữ thô tục.",
        reportedAt: "Hôm nay, 10:30",
        status: "Pending",
    },
    {
        id: "REP-905",
        type: "Q&A", // Báo cáo hỏi đáp
        courseTitle: "Master React.js & Next.js 14",
        lessonTitle: "Bài 10: State & Props",
        reportedContent: "Cho em vay 500k qua số tk này được không anh em ơi, đang kẹt quá 0123456789 VCB.",
        reporter: { name: "Nguyễn Văn A", role: "Giảng viên" },
        accused: {
            name: "Lê Văn Spam",
            email: "spam.boy@gmail.com",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Spam",
            warningCount: 0
        },
        reason: "Spam tin nhắn rác, không liên quan đến bài học.",
        reportedAt: "Hôm qua, 15:45",
        status: "Pending",
    }
];

export default function AdminInteractionModerationPage() {
    const [reports, setReports] = useState(MOCK_REPORTS);
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [banModalVisible, setBanModalVisible] = useState(false);
    const [banReason, setBanReason] = useState("");

    // Mở Drawer chi tiết
    const handleReview = (report: any) => {
        setSelectedReport(report);
        setDrawerVisible(true);
    };

    // 1. Bỏ qua báo cáo (Học viên không sai)
    const handleDismissReport = () => {
        Modal.confirm({
            title: "Bỏ qua báo cáo này?",
            content: "Nội dung này sẽ được giữ lại trên hệ thống. Giảng viên sẽ nhận được thông báo rằng báo cáo của họ bị từ chối.",
            onOk: () => {
                setReports(reports.filter(r => r.id !== selectedReport.id));
                setDrawerVisible(false);
            }
        });
    };

    // 2. Xóa nội dung & Cảnh cáo
    const handleDeleteContent = () => {
        Modal.confirm({
            title: "Xóa nội dung vi phạm",
            icon: <DeleteOutlined className="text-orange-500" />,
            content: `Bình luận này sẽ bị xóa vĩnh viễn. Hệ thống sẽ tự động gửi 1 email cảnh cáo đến tài khoản của "${selectedReport.accused.name}".`,
            okText: "Xóa & Cảnh cáo",
            okButtonProps: { danger: true },
            onOk: () => {
                setReports(reports.filter(r => r.id !== selectedReport.id));
                setDrawerVisible(false);
            }
        });
    };

    // 3. Khóa tài khoản vĩnh viễn
    const handleBanAccountSubmit = () => {
        console.log(`Đã khóa tài khoản ${selectedReport.accused.email} với lý do:`, banReason);
        setBanModalVisible(false);
        setDrawerVisible(false);
        setBanReason("");
        setReports(reports.filter(r => r.id !== selectedReport.id));

        Modal.success({
            title: "Đã khóa tài khoản",
            content: `Tài khoản ${selectedReport.accused.email} đã bị khóa vĩnh viễn. Tất cả bình luận của người này sẽ bị ẩn.`,
        });
    };

    const columns = [
        {
            title: 'Mã BC',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500">{text}</span>,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={type === 'Review' ? 'purple' : 'blue'} className="border-none font-bold">
                    {type === 'Review' ? 'Đánh giá' : 'Hỏi đáp'}
                </Tag>
            ),
        },
        {
            title: 'Người bị báo cáo',
            key: 'accused',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-2">
                    <Avatar src={record.accused.avatar} size="small" />
                    <span className={`font-medium ${record.accused.warningCount > 0 ? 'text-red-600' : 'text-gray-700'}`}>
                        {record.accused.name}
                        {record.accused.warningCount > 0 && (
                            <WarningOutlined className="ml-1 text-red-500" title={`Đã bị cảnh cáo ${record.accused.warningCount} lần`} />
                        )}
                    </span>
                </div>
            ),
        },
        {
            title: 'Lý do báo cáo',
            dataIndex: 'reason',
            key: 'reason',
            render: (text: string) => <span className="text-gray-600 line-clamp-1 max-w-[200px]">{text}</span>,
        },
        {
            title: 'Ngày báo cáo',
            dataIndex: 'reportedAt',
            key: 'reportedAt',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    danger
                    icon={<FlagOutlined />}
                    className="font-bold"
                    onClick={() => handleReview(record)}
                >
                    Xử lý
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
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Kiểm duyệt Tương tác</h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Xử lý các báo cáo vi phạm tiêu chuẩn cộng đồng</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Báo cáo chờ xử lý</div>
                            <div className="text-xl font-bold text-red-500">{reports.length} vi phạm</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <Table
                        columns={columns}
                        dataSource={reports}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="moderation-table"
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* DRAWER: CHI TIẾT BÁO CÁO */}
            {/* ========================================== */}
            <Drawer
                title={
                    <div className="flex justify-between items-center w-full pr-8">
                        <span className="font-extrabold text-lg text-red-600 flex items-center gap-2">
                            <ExclamationCircleFilled /> Chi tiết Báo cáo
                        </span>
                        <Tag color="red" className="m-0 border-none px-3 py-1 font-bold">{selectedReport?.id}</Tag>
                    </div>
                }
                placement="right"
                width={650}
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                extra={<Button onClick={() => setDrawerVisible(false)}>Đóng</Button>}
                footer={
                    <div className="flex justify-between items-center p-2 bg-gray-50">
                        <Button onClick={handleDismissReport} icon={<CheckOutlined />}>Bỏ qua (Không sai)</Button>
                        <Space>
                            <Button danger icon={<DeleteOutlined />} onClick={handleDeleteContent} className="border-red-200 hover:bg-red-50">
                                Xóa nội dung
                            </Button>
                            <Button type="primary" danger icon={<StopOutlined />} onClick={() => setBanModalVisible(true)} className="font-bold">
                                Khóa tài khoản
                            </Button>
                        </Space>
                    </div>
                }
            >
                {selectedReport && (
                    <div className="flex flex-col gap-6">

                        {/* 1. Lời khai của Người báo cáo (Giảng viên) */}
                        <div className="bg-red-50 p-5 rounded-lg border border-red-100">
                            <h3 className="font-bold text-red-800 flex items-center gap-2 mb-2">
                                <FlagOutlined /> Thông tin báo cáo
                            </h3>
                            <p className="text-red-900 mb-1">
                                <span className="font-semibold">Người báo cáo:</span> {selectedReport.reporter.name} ({selectedReport.reporter.role})
                            </p>
                            <p className="text-red-900 m-0">
                                <span className="font-semibold">Lý do:</span> {selectedReport.reason}
                            </p>
                        </div>

                        {/* 2. Nội dung bị tố cáo (Bằng chứng) */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <MessageOutlined /> Nội dung bị tố cáo
                            </h3>
                            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm relative">
                                <div className="absolute top-0 right-0 mt-3 mr-4">
                                    <Tag color={selectedReport.type === 'Review' ? 'purple' : 'blue'} className="border-none m-0">
                                        {selectedReport.type === 'Review' ? 'Trong Đánh giá' : 'Trong Hỏi đáp'}
                                    </Tag>
                                </div>

                                <p className="text-xs text-gray-500 font-medium mb-1">Từ khóa học:</p>
                                <p className="font-bold text-gray-800 mb-3">{selectedReport.courseTitle}</p>

                                {selectedReport.lessonTitle && (
                                    <>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Tại bài học:</p>
                                        <p className="font-bold text-gray-800 mb-3">{selectedReport.lessonTitle}</p>
                                    </>
                                )}

                                <Divider className="my-3" />

                                <p className="text-gray-500 text-xs font-medium mb-2">Nội dung người dùng viết:</p>
                                <div className="bg-gray-100 p-4 rounded-md border-l-4 border-l-red-500 text-gray-800 font-medium text-[15px] italic">
                                    "{selectedReport.reportedContent}"
                                </div>
                            </div>
                        </div>

                        {/* 3. Tiền sử của Học viên (Profile người bị tố) */}
                        <div>
                            <h3 className="font-bold text-gray-900 mb-3">Thông tin người bị tố cáo</h3>
                            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-gray-200">
                                <Avatar src={selectedReport.accused.avatar} size={64} className="bg-gray-100" />
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 m-0 text-lg">{selectedReport.accused.name}</h4>
                                    <p className="text-sm text-gray-500 mb-2">{selectedReport.accused.email}</p>

                                    {selectedReport.accused.warningCount > 0 ? (
                                        <Alert
                                            message={`Đã bị cảnh cáo ${selectedReport.accused.warningCount} lần trước đây!`}
                                            type="error"
                                            showIcon
                                            className="py-1 px-3 text-xs"
                                        />
                                    ) : (
                                        <Alert
                                            message="Tài khoản chưa có vi phạm nào trước đây."
                                            type="success"
                                            showIcon
                                            className="py-1 px-3 text-xs"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </Drawer>

            {/* ========================================== */}
            {/* MODAL: KHÓA TÀI KHOẢN */}
            {/* ========================================== */}
            <Modal
                title={
                    <span className="text-red-600 font-bold flex items-center gap-2 text-lg">
                        <StopOutlined /> Xác nhận Khóa tài khoản
                    </span>
                }
                open={banModalVisible}
                onCancel={() => setBanModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setBanModalVisible(false)}>Hủy</Button>,
                    <Button
                        key="submit"
                        danger
                        type="primary"
                        onClick={handleBanAccountSubmit}
                        disabled={!banReason.trim()}
                        className="font-bold"
                    >
                        Khóa vĩnh viễn
                    </Button>,
                ]}
            >
                <div className="bg-red-50 p-4 rounded-lg mb-4 border border-red-100 text-red-800">
                    <p className="m-0 font-medium">
                        Hành động này sẽ cấm <b>{selectedReport?.accused.email}</b> đăng nhập vào Leanova vĩnh viễn. Toàn bộ khóa học đã mua sẽ bị khóa.
                    </p>
                </div>
                <p className="text-gray-700 mb-2 font-medium">Lý do khóa (Sẽ được gửi qua email cho học viên):</p>
                <Form layout="vertical">
                    <Form.Item required>
                        <TextArea
                            rows={4}
                            placeholder="Ví dụ: Vi phạm nghiêm trọng tiêu chuẩn cộng đồng, quảng cáo nền tảng trái phép nhiều lần..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="focus:border-red-400 hover:border-red-400"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
        .moderation-table .ant-table-thead > tr > th {
          background-color: #fef2f2 !important; /* Màu nền đỏ cực nhạt cho Header bảng báo cáo */
          color: #991b1b !important;
          font-weight: 700 !important;
          border-bottom: 1px solid #fee2e2;
        }
      `}} />
        </div>
    );
}