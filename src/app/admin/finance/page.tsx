"use client";

import { useState } from "react";
import {
    Table, Tag, Button, Input, Space, Modal, Form, Tabs,
    DatePicker, Select, Avatar, Upload, Divider, message
} from "antd";
import {
    SearchOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    BankOutlined,
    DollarOutlined,
    UploadOutlined,
    WalletOutlined,
    FileTextOutlined
} from "@ant-design/icons";

const { TextArea } = Input;
const { RangePicker } = DatePicker;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_TRANSACTIONS = [
    {
        id: "VNP12030755",
        buyer: { name: "Nguyễn Văn Học", email: "hoc.nv@gmail.com" },
        course: "Lập trình Node.js & Express RESTful API",
        amount: 2496000,
        method: "VNPay",
        date: "12/05/2026 14:30",
        status: "Success", // Thành công
    },
    {
        id: "VNP12030890",
        buyer: { name: "Trần Thị Lười", email: "luoi.tt@gmail.com" },
        course: "Master React.js & Next.js 14",
        amount: 1850000,
        method: "VNPay",
        date: "11/05/2026 09:15",
        status: "Failed", // Thất bại / Hủy thanh toán
    },
];

const MOCK_WITHDRAWALS = [
    {
        id: "WD-1002",
        instructor: { name: "Trịnh Ạt Min", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" },
        amount: 15400000,
        bankInfo: "Vietcombank - 0123456789 - TRINH AT MIN",
        requestDate: "10/05/2026 08:00",
        status: "Pending", // Đang chờ duyệt
    },
    {
        id: "WD-0998",
        instructor: { name: "KOL Nguyễn Văn A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KOL" },
        amount: 25000000,
        bankInfo: "Techcombank - 9876543210 - NGUYEN VAN A",
        requestDate: "05/05/2026 10:20",
        status: "Completed", // Đã thanh toán
        receiptUrl: "#", // Link ảnh biên lai
    }
];

export default function AdminFinancePage() {
    const [activeTab, setActiveTab] = useState("transactions");

    // State cho Rút tiền
    const [withdrawals, setWithdrawals] = useState(MOCK_WITHDRAWALS);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    // ==========================================
    // XỬ LÝ LỆNH RÚT TIỀN
    // ==========================================
    const handleApproveSubmit = () => {
        message.success(`Đã đánh dấu thanh toán thành công cho lệnh rút ${selectedRequest?.id}`);
        setWithdrawals(withdrawals.map(w => w.id === selectedRequest.id ? { ...w, status: "Completed" } : w));
        setApproveModalVisible(false);
    };

    const handleRejectSubmit = () => {
        message.success(`Đã từ chối lệnh rút tiền. Hệ thống sẽ hoàn lại số dư cho Giảng viên.`);
        setWithdrawals(withdrawals.map(w => w.id === selectedRequest.id ? { ...w, status: "Rejected" } : w));
        setRejectModalVisible(false);
        setRejectReason("");
    };

    // ==========================================
    // CẤU HÌNH CỘT CHO BẢNG GIAO DỊCH (TIỀN VÀO)
    // ==========================================
    const transactionColumns = [
        {
            title: 'Mã GD',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500 font-medium">{text}</span>,
        },
        {
            title: 'Học viên',
            key: 'buyer',
            render: (_: any, record: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{record.buyer.name}</span>
                    <span className="text-xs text-gray-500">{record.buyer.email}</span>
                </div>
            ),
        },
        {
            title: 'Khóa học',
            dataIndex: 'course',
            key: 'course',
            render: (text: string) => <span className="text-gray-700 line-clamp-1 max-w-[200px]" title={text}>{text}</span>,
        },
        {
            title: 'Số tiền',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => <span className="font-bold text-[#A435F0]">{val.toLocaleString('vi-VN')} ₫</span>,
        },
        {
            title: 'Phương thức',
            dataIndex: 'method',
            key: 'method',
            render: (text: string) => <Tag color="blue" className="border-none font-bold">{text}</Tag>,
        },
        {
            title: 'Thời gian',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => {
                if (status === 'Success') return <Tag color="success" icon={<CheckCircleOutlined />} className="border-none font-medium">Thành công</Tag>;
                return <Tag color="error" icon={<CloseCircleOutlined />} className="border-none font-medium">Thất bại</Tag>;
            },
        },
    ];

    // ==========================================
    // CẤU HÌNH CỘT CHO BẢNG RÚT TIỀN (TIỀN RA)
    // ==========================================
    const withdrawalColumns = [
        {
            title: 'Mã lệnh',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500 font-medium">{text}</span>,
        },
        {
            title: 'Giảng viên',
            key: 'instructor',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-2">
                    <Avatar src={record.instructor.avatar} size="small" />
                    <span className="font-bold text-gray-800">{record.instructor.name}</span>
                </div>
            ),
        },
        {
            title: 'Số tiền rút',
            dataIndex: 'amount',
            key: 'amount',
            render: (val: number) => <span className="font-extrabold text-orange-500 text-[15px]">{val.toLocaleString('vi-VN')} ₫</span>,
        },
        {
            title: 'Tài khoản nhận',
            dataIndex: 'bankInfo',
            key: 'bankInfo',
            render: (text: string) => (
                <div className="bg-gray-50 p-2 rounded border border-gray-200 text-xs font-mono text-gray-700">
                    <BankOutlined className="mr-1" /> {text}
                </div>
            ),
        },
        {
            title: 'Ngày yêu cầu',
            dataIndex: 'requestDate',
            key: 'requestDate',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => {
                if (status === 'Pending') return <Tag color="warning" className="border-none font-medium">Chờ chuyển khoản</Tag>;
                if (status === 'Completed') return <Tag color="success" className="border-none font-medium">Đã thanh toán</Tag>;
                return <Tag color="error" className="border-none font-medium">Đã từ chối</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => {
                if (record.status !== 'Pending') {
                    return record.receiptUrl ? (
                        <Button type="link" icon={<FileTextOutlined />} size="small">Xem biên lai</Button>
                    ) : <span className="text-gray-400 text-xs italic">Đã đóng</span>;
                }
                return (
                    <Space>
                        <Button
                            type="primary"
                            size="small"
                            className="bg-[#52c41a] hover:!bg-[#389e0d] border-none font-bold"
                            onClick={() => { setSelectedRequest(record); setApproveModalVisible(true); }}
                        >
                            Thanh toán
                        </Button>
                        <Button
                            danger
                            size="small"
                            onClick={() => { setSelectedRequest(record); setRejectModalVisible(true); }}
                        >
                            Từ chối
                        </Button>
                    </Space>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER TÀI CHÍNH */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
                            <WalletOutlined /> Quản lý Tài chính
                        </h1>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    size="large"
                    className="finance-tabs bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
                    items={[
                        {
                            key: "transactions",
                            label: <span className="font-bold px-4 flex items-center gap-2"><DollarOutlined /> Lịch sử Giao dịch</span>,
                            children: (
                                <div className="pt-4 animate-fade-in">
                                    {/* BỘ LỌC GIAO DỊCH */}
                                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                        <div className="flex flex-wrap gap-4">
                                            <Input placeholder="Tìm Mã GD, Email..." prefix={<SearchOutlined className="text-gray-400" />} className="w-64" />
                                            <RangePicker format="DD/MM/YYYY" placeholder={['Từ ngày', 'Đến ngày']} />
                                            <Select defaultValue="all" className="w-40">
                                                <Select.Option value="all">Tất cả trạng thái</Select.Option>
                                                <Select.Option value="success">Thành công</Select.Option>
                                                <Select.Option value="failed">Thất bại</Select.Option>
                                            </Select>
                                        </div>
                                        <Button type="primary" className="!bg-gray-800 border-none font-bold">Xuất Excel</Button>
                                    </div>

                                    <Table
                                        columns={transactionColumns}
                                        dataSource={MOCK_TRANSACTIONS}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                        className="finance-table"
                                    />
                                </div>
                            )
                        },
                        {
                            key: "withdrawals",
                            label: <span className="font-bold px-4 flex items-center gap-2"><BankOutlined /> Lệnh Rút tiền</span>,
                            children: (
                                <div className="pt-4 animate-fade-in">
                                    <div className="flex justify-between items-center mb-6">
                                        <p className="text-gray-500 m-0">Admin cần chuyển khoản thủ công bằng Internet Banking, sau đó tải biên lai lên hệ thống.</p>
                                        <Select defaultValue="pending" className="w-48" size="large">
                                            <Select.Option value="pending">Chờ xử lý (1)</Select.Option>
                                            <Select.Option value="all">Tất cả lệnh rút</Select.Option>
                                        </Select>
                                    </div>

                                    <Table
                                        columns={withdrawalColumns}
                                        dataSource={withdrawals}
                                        rowKey="id"
                                        pagination={{ pageSize: 10 }}
                                        className="finance-table"
                                    />
                                </div>
                            )
                        }
                    ]}
                />
            </div>

            {/* ========================================== */}
            {/* MODAL: XÁC NHẬN ĐÃ CHUYỂN KHOẢN */}
            {/* ========================================== */}
            <Modal
                title={<span className="font-bold text-green-600 text-lg">Xác nhận Đã thanh toán</span>}
                open={approveModalVisible}
                onCancel={() => setApproveModalVisible(false)}
                footer={[
                    <Button key="back" onClick={() => setApproveModalVisible(false)}>Hủy</Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleApproveSubmit}
                        className="!bg-[#52c41a] hover:!bg-[#389e0d] border-none font-bold"
                    >
                        Xác nhận Đã chuyển khoản
                    </Button>,
                ]}
            >
                <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-100">
                    <p className="m-0 text-green-800">
                        Vui lòng thực hiện chuyển khoản số tiền <b className="text-lg">{selectedRequest?.amount.toLocaleString('vi-VN')} ₫</b> vào tài khoản dưới đây trước khi bấm xác nhận.
                    </p>
                </div>

                <div className="bg-gray-100 p-4 rounded-lg font-mono text-center text-lg font-bold text-gray-800 mb-6 tracking-wide border border-gray-200 shadow-inner">
                    {selectedRequest?.bankInfo}
                </div>

                <Form layout="vertical">
                    <Form.Item label={<span className="font-semibold text-gray-700">Tải lên biên lai chuyển tiền (Bắt buộc)</span>} required>
                        <Upload beforeUpload={() => false} maxCount={1} accept="image/*">
                            <Button icon={<UploadOutlined />} size="large" className="w-full">Chọn ảnh biên lai từ máy tính</Button>
                        </Upload>
                        <div className="text-xs text-gray-400 mt-2">Ảnh này sẽ được lưu lại để đối soát tài chính sau này.</div>
                    </Form.Item>
                </Form>
            </Modal>

            {/* ========================================== */}
            {/* MODAL: TỪ CHỐI LỆNH RÚT */}
            {/* ========================================== */}
            <Modal
                title={<span className="text-red-500 font-bold text-lg">Từ chối lệnh rút tiền</span>}
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
                        className="font-bold"
                    >
                        Từ chối lệnh này
                    </Button>,
                ]}
            >
                <p className="text-gray-600 mb-4">
                    Số dư sẽ được hoàn lại vào ví của Giảng viên. Vui lòng nhập lý do từ chối (Ví dụ: Sai thông tin ngân hàng, Tài khoản bị khóa...).
                </p>
                <Form layout="vertical">
                    <Form.Item required>
                        <TextArea
                            rows={4}
                            placeholder="Nhập lý do từ chối để Giảng viên biết cách khắc phục..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="focus:border-red-400 hover:border-red-400"
                        />
                    </Form.Item>
                </Form>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
        .finance-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #A435F0 !important;
        }
        .finance-tabs .ant-tabs-ink-bar {
          background: #A435F0 !important;
        }
        .finance-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 700 !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
}