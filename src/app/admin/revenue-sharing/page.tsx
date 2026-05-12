"use client";

import { useState } from "react";
import {
    Card, InputNumber, Button, Table, Tag, Modal, Form, Select,
    Avatar, message, Divider, Typography, Alert, Space, Tooltip,
    Input
} from "antd";
import {
    PercentageOutlined,
    SaveOutlined,
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    CrownFilled,
    InfoCircleOutlined,
    SettingOutlined
} from "@ant-design/icons";

const { Text } = Typography;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_CUSTOM_RATES = [
    {
        id: "GV-001",
        instructor: { name: "Trịnh Ạt Min", email: "admin.trinh@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" },
        customRate: 90, // Nền tảng lấy 10%, GV lấy 90%
        reason: "Giảng viên Co-founder của nền tảng",
        updatedAt: "10/05/2026",
    },
    {
        id: "GV-089",
        instructor: { name: "KOL Nguyễn Văn A", email: "kol.nva@gmail.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KOL" },
        customRate: 85,
        reason: "Đối tác chiến lược Q3/2026",
        updatedAt: "01/05/2026",
    }
];

export default function AdminRevenueSharingPage() {
    // State quản lý tỉ lệ chung
    const [globalRate, setGlobalRate] = useState<number>(70); // Mặc định Giảng viên nhận 70%
    const [isSavingGlobal, setIsSavingGlobal] = useState(false);

    // State quản lý danh sách ngoại lệ
    const [customRates, setCustomRates] = useState(MOCK_CUSTOM_RATES);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState<any>(null);
    const [form] = Form.useForm();

    // Lưu cấu hình chung
    const handleSaveGlobal = () => {
        setIsSavingGlobal(true);
        setTimeout(() => {
            setIsSavingGlobal(false);
            message.success(`Đã lưu cấu hình chung: Giảng viên nhận ${globalRate}%, Nền tảng nhận ${100 - globalRate}%`);
        }, 1000);
    };

    // Mở Modal thêm/sửa ngoại lệ
    const handleOpenModal = (record: any = null) => {
        setEditingRecord(record);
        if (record) {
            form.setFieldsValue({
                instructorId: record.id,
                customRate: record.customRate,
                reason: record.reason
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // Lưu ngoại lệ
    const handleSaveCustomRate = (values: any) => {
        message.success("Đã cập nhật chính sách chia sẻ doanh thu cho giảng viên này.");
        setIsModalVisible(false);
        // Logic cập nhật state giả lập ở đây (bỏ qua để code ngắn gọn)
    };

    // Xóa ngoại lệ (Trở về mức mặc định)
    const handleDeleteCustom = (record: any) => {
        Modal.confirm({
            title: "Xóa chính sách ngoại lệ?",
            content: `Giảng viên "${record.instructor.name}" sẽ bị đưa về mức chia sẻ mặc định của hệ thống là ${globalRate}%.`,
            okText: "Xóa ngoại lệ",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                setCustomRates(customRates.filter(item => item.id !== record.id));
                message.success("Đã khôi phục mức chia sẻ mặc định cho giảng viên.");
            }
        });
    };

    const columns = [
        {
            title: 'Giảng viên',
            key: 'instructor',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-3">
                    <Avatar src={record.instructor.avatar} className="bg-gray-200" />
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">{record.instructor.name}</span>
                        <span className="text-xs text-gray-500">{record.instructor.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Tỉ lệ chia sẻ (Giảng viên nhận)',
            dataIndex: 'customRate',
            key: 'customRate',
            render: (rate: number) => (
                <Tag color="gold" className="font-extrabold text-sm px-3 py-1 border-none rounded-md flex items-center w-fit gap-1">
                    <CrownFilled /> {rate}%
                </Tag>
            ),
            align: 'center' as 'center',
        },
        {
            title: 'Nền tảng nhận',
            key: 'platformRate',
            render: (_: any, record: any) => (
                <span className="font-bold text-gray-500">{100 - record.customRate}%</span>
            ),
            align: 'center' as 'center',
        },
        {
            title: 'Ghi chú / Lý do',
            dataIndex: 'reason',
            key: 'reason',
            render: (text: string) => <span className="text-gray-600 italic">{text}</span>,
        },
        {
            title: 'Cập nhật lần cuối',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title="Chỉnh sửa">
                        <Button type="text" icon={<EditOutlined />} onClick={() => handleOpenModal(record)} className="text-blue-600 hover:bg-blue-50" />
                    </Tooltip>
                    <Tooltip title="Đưa về mức mặc định">
                        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleDeleteCustom(record)} className="hover:bg-red-50" />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Chia sẻ Doanh thu</h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Quản lý phần trăm hoa hồng nền tảng và giảng viên</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">

                {/* ========================================== */}
                {/* SECTION 1: CẤU HÌNH MẶC ĐỊNH (GLOBAL) */}
                {/* ========================================== */}
                <Card
                    title={
                        <span className="font-extrabold text-lg flex items-center gap-2">
                            <SettingOutlined className="text-[#A435F0]" /> Cấu hình Mặc định Hệ thống
                        </span>
                    }
                    className="rounded-xl shadow-sm border-gray-200"
                    bordered={false}
                >
                    <Alert
                        message="Chính sách chung"
                        description="Tỉ lệ này sẽ được tự động áp dụng cho tất cả các giao dịch mua khóa học trên nền tảng, ngoại trừ các giảng viên nằm trong danh sách ngoại lệ bên dưới."
                        type="info"
                        showIcon
                        className="mb-6 bg-blue-50 border-blue-100"
                    />

                    <div className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 p-6 rounded-xl border border-gray-200">

                        {/* Input cấu hình */}
                        <div className="flex-1 w-full">
                            <label className="block font-bold text-gray-800 mb-2">Phần trăm Giảng viên thực nhận (%)</label>
                            <div className="flex items-center gap-4">
                                <InputNumber
                                    min={1}
                                    max={99}
                                    value={globalRate}
                                    onChange={(val) => setGlobalRate(val || 70)}
                                    size="large"
                                    addonAfter={<PercentageOutlined />}
                                    className="w-48 font-bold text-lg"
                                />
                                <Button
                                    type="primary"
                                    size="large"
                                    icon={<SaveOutlined />}
                                    loading={isSavingGlobal}
                                    onClick={handleSaveGlobal}
                                    className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold px-8"
                                >
                                    Lưu cấu hình
                                </Button>
                            </div>
                        </div>

                        <Divider type="vertical" className="hidden md:block h-24" />

                        {/* Xem trước kết quả */}
                        <div className="flex-1 w-full bg-white p-4 rounded-lg shadow-inner border border-gray-100">
                            <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider text-center">Ví dụ với khóa học 1.000.000 ₫</p>
                            <div className="flex justify-around items-center">
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 mb-1">Giảng viên nhận ({globalRate}%)</div>
                                    <div className="text-2xl font-extrabold text-green-600">
                                        {(1000000 * (globalRate / 100)).toLocaleString('vi-VN')} ₫
                                    </div>
                                </div>
                                <div className="text-2xl text-gray-300">+</div>
                                <div className="text-center">
                                    <div className="text-sm text-gray-500 mb-1">Nền tảng thu ({100 - globalRate}%)</div>
                                    <div className="text-2xl font-extrabold text-[#A435F0]">
                                        {(1000000 * ((100 - globalRate) / 100)).toLocaleString('vi-VN')} ₫
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </Card>

                {/* ========================================== */}
                {/* SECTION 2: DANH SÁCH NGOẠI LỆ (VIP) */}
                {/* ========================================== */}
                <Card
                    title={
                        <div className="flex justify-between items-center w-full">
                            <span className="font-extrabold text-lg flex items-center gap-2">
                                <CrownFilled className="text-yellow-500" /> Danh sách Giảng viên Ngoại lệ
                            </span>
                            <Button
                                type="primary"
                                icon={<PlusOutlined />}
                                onClick={() => handleOpenModal()}
                                className="bg-gray-800 hover:!bg-gray-700 border-none font-bold"
                            >
                                Thêm ngoại lệ
                            </Button>
                        </div>
                    }
                    className="rounded-xl shadow-sm border-gray-200"
                    bordered={false}
                >
                    <Table
                        columns={columns}
                        dataSource={customRates}
                        rowKey="id"
                        pagination={false}
                        className="moderation-table"
                    />
                </Card>

            </div>

            {/* ========================================== */}
            {/* MODAL: THÊM / SỬA NGOẠI LỆ */}
            {/* ========================================== */}
            <Modal
                title={
                    <span className="font-extrabold text-lg text-gray-800">
                        {editingRecord ? "Chỉnh sửa Tỉ lệ Ngoại lệ" : "Thêm Giảng viên Ngoại lệ"}
                    </span>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSaveCustomRate}
                    className="mt-6"
                >
                    <Form.Item
                        name="instructorId"
                        label={<span className="font-semibold text-gray-700">Chọn Giảng viên</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn giảng viên!' }]}
                    >
                        <Select
                            showSearch
                            placeholder="Nhập tên hoặc email giảng viên..."
                            size="large"
                            disabled={!!editingRecord} // Nếu đang sửa thì không cho đổi người
                            options={[
                                { value: 'GV-001', label: 'Trịnh Ạt Min (admin.trinh@gmail.com)' },
                                { value: 'GV-002', label: 'Nguyễn B (nguyenb@gmail.com)' },
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="customRate"
                        label={
                            <span className="font-semibold text-gray-700 flex items-center gap-1">
                                Phần trăm Giảng viên nhận <Tooltip title="Phần còn lại sẽ tự động tính cho nền tảng"><InfoCircleOutlined /></Tooltip>
                            </span>
                        }
                        rules={[{ required: true, message: 'Vui lòng nhập tỉ lệ!' }]}
                    >
                        <InputNumber
                            min={1}
                            max={99}
                            size="large"
                            addonAfter={<PercentageOutlined />}
                            className="w-full font-bold"
                        />
                    </Form.Item>

                    <Form.Item
                        name="reason"
                        label={<span className="font-semibold text-gray-700">Ghi chú nội bộ / Lý do</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập lý do ưu đãi!' }]}
                    >
                        <Input.TextArea rows={3} placeholder="Ví dụ: Đối tác độc quyền, KOL cam kết mang lại 1000 học viên..." />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 pt-5">
                        <Button size="large" onClick={() => setIsModalVisible(false)}>Hủy</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold"
                        >
                            Lưu thiết lập
                        </Button>
                    </div>
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