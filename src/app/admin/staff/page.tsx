"use client";

import { useState } from "react";
import {
    Table, Tag, Button, Input, Space, Modal, Form, Select,
    Avatar, message, Tooltip, Badge, Switch
} from "antd";
import {
    SearchOutlined,
    UserAddOutlined,
    EditOutlined,
    LockOutlined,
    UnlockOutlined,
    DeleteOutlined,
    SafetyCertificateOutlined,
    IeOutlined,
    KeyOutlined
} from "@ant-design/icons";

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_STAFF = [
    {
        id: "STF-001",
        name: "Trịnh Ạt Min",
        email: "admin.founder@learnova.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
        role: "Super Admin",
        status: "Active",
        lastLogin: "Vừa xong",
    },
    {
        id: "STF-024",
        name: "Lê Duyệt Bài",
        email: "duyetbai.le@learnova.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Duyet",
        role: "Course Moderator",
        status: "Active",
        lastLogin: "2 giờ trước",
    },
    {
        id: "STF-035",
        name: "Nguyễn Kế Toán",
        email: "ketoan.ng@learnova.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=KeToan",
        role: "Finance Manager",
        status: "Active",
        lastLogin: "Hôm qua, 15:30",
    },
    {
        id: "STF-042",
        name: "Trần Bảo Vệ",
        email: "baove.tr@learnova.com",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=BaoVe",
        role: "Community Moderator",
        status: "Locked", // Bị khóa tài khoản
        lastLogin: "10/04/2026",
    }
];

export default function AdminStaffManagementPage() {
    const [staffList, setStaffList] = useState(MOCK_STAFF);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStaff, setEditingStaff] = useState<any>(null);
    const [form] = Form.useForm();

    // ==========================================
    // XỬ LÝ ACTIONS (CRUD)
    // ==========================================

    // 1. Mở form Thêm/Sửa
    const handleOpenModal = (staff: any = null) => {
        setEditingStaff(staff);
        if (staff) {
            form.setFieldsValue(staff);
        } else {
            form.resetFields();
            form.setFieldsValue({ status: "Active", role: "Course Moderator" }); // Default values
        }
        setIsModalVisible(true);
    };

    // 2. Submit form Thêm/Sửa
    const handleSubmit = (values: any) => {
        if (editingStaff) {
            message.success(`Đã cập nhật thông tin nhân sự: ${values.name}`);
            setStaffList(staffList.map(s => s.id === editingStaff.id ? { ...s, ...values } : s));
        } else {
            message.success(`Đã tạo tài khoản nội bộ mới. Mật khẩu đã được gửi vào email: ${values.email}`);
            const newStaff = {
                id: `STF-0${staffList.length + 10}`,
                avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.name}`,
                lastLogin: "Chưa đăng nhập",
                ...values
            };
            setStaffList([newStaff, ...staffList]);
        }
        setIsModalVisible(false);
    };

    // 3. Khóa / Mở khóa tài khoản (Soft Delete)
    const toggleAccountStatus = (record: any) => {
        const isLocking = record.status === "Active";

        Modal.confirm({
            title: isLocking ? "Khóa tài khoản nhân sự?" : "Mở khóa tài khoản?",
            icon: isLocking ? <LockOutlined className="text-red-500" /> : <UnlockOutlined className="text-green-500" />,
            content: isLocking
                ? `Tài khoản "${record.email}" sẽ bị đăng xuất ngay lập tức và không thể truy cập vào hệ thống Admin.`
                : `Tài khoản "${record.email}" sẽ được khôi phục quyền truy cập vào hệ thống.`,
            okText: isLocking ? "Khóa tài khoản" : "Mở khóa",
            okButtonProps: { danger: isLocking, type: "primary" },
            cancelText: "Hủy",
            onOk: () => {
                setStaffList(staffList.map(s => s.id === record.id ? { ...s, status: isLocking ? "Locked" : "Active" } : s));
                message.success(`Đã ${isLocking ? "khóa" : "mở khóa"} tài khoản thành công.`);
            }
        });
    };

    // 4. Reset Mật khẩu
    const handleResetPassword = (email: string) => {
        Modal.confirm({
            title: "Cấp lại mật khẩu?",
            content: `Hệ thống sẽ tạo một mật khẩu ngẫu nhiên mới và gửi trực tiếp vào hòm thư: ${email}`,
            okText: "Gửi Email Reset",
            cancelText: "Hủy",
            onOk: () => message.success("Đã gửi email khôi phục mật khẩu.")
        });
    };

    // ==========================================
    // CẤU HÌNH CỘT CHO BẢNG
    // ==========================================
    const columns = [
        {
            title: 'Mã NV',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500">{text}</span>,
        },
        {
            title: 'Nhân sự',
            key: 'user',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-3">
                    <Badge dot status={record.status === 'Active' ? 'success' : 'default'} offset={[-5, 35]}>
                        <Avatar src={record.avatar} size="large" className={`border ${record.status === 'Locked' ? 'grayscale opacity-50' : 'border-gray-200'}`} />
                    </Badge>
                    <div className="flex flex-col">
                        <span className={`font-bold ${record.status === 'Locked' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                            {record.name}
                        </span>
                        <span className="text-xs text-gray-500">{record.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Vai trò (Role)',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => {
                let color = "default";
                let icon = null;
                if (role === "Super Admin") { color = "purple"; icon = <IeOutlined />; }
                if (role === "Finance Manager") { color = "gold"; }
                if (role === "Course Moderator") { color = "blue"; }
                if (role === "Community Moderator") { color = "cyan"; }

                return (
                    <Tag color={color} className="font-bold border-none px-2 py-1 rounded-md" icon={icon}>
                        {role}
                    </Tag>
                );
            },
        },
        {
            title: 'Đăng nhập lần cuối',
            dataIndex: 'lastLogin',
            key: 'lastLogin',
            render: (text: string) => <span className="text-xs text-gray-500 font-medium">{text}</span>,
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => (
                <Tag color={status === 'Active' ? 'success' : 'error'} className="border-none font-medium">
                    {status === 'Active' ? 'Đang hoạt động' : 'Bị khóa'}
                </Tag>
            ),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa thông tin">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                            className="text-blue-600 hover:bg-blue-50"
                            disabled={record.role === "Super Admin"} // Ngăn không cho sửa Super Admin dễ dàng
                        />
                    </Tooltip>
                    <Tooltip title="Reset mật khẩu">
                        <Button
                            type="text"
                            icon={<KeyOutlined />}
                            onClick={() => handleResetPassword(record.email)}
                            className="text-orange-500 hover:bg-orange-50"
                        />
                    </Tooltip>
                    {record.status === "Active" ? (
                        <Tooltip title="Khóa tài khoản (Chặn truy cập)">
                            <Button
                                type="text"
                                danger
                                icon={<LockOutlined />}
                                onClick={() => toggleAccountStatus(record)}
                                className="hover:bg-red-50"
                                disabled={record.role === "Super Admin"} // Super Admin tự khóa mình là sập web
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="Mở khóa tài khoản">
                            <Button
                                type="text"
                                icon={<UnlockOutlined />}
                                onClick={() => toggleAccountStatus(record)}
                                className="text-green-600 hover:bg-green-50"
                            />
                        </Tooltip>
                    )}
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
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
                            <SafetyCertificateOutlined className="text-[#A435F0]" /> Quản lý Nhân sự (Nội bộ)
                        </h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Quản lý phân quyền và truy cập của đội ngũ BQT</p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<UserAddOutlined />}
                        onClick={() => handleOpenModal()}
                        className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold shadow-md"
                    >
                        Thêm Nhân sự mới
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* BỘ LỌC */}
                <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <Input
                        placeholder="Tìm kiếm tên, email nhân sự..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="w-full sm:max-w-md"
                        size="large"
                    />
                    <Select defaultValue="all" size="large" className="w-full sm:w-48">
                        <Select.Option value="all">Tất cả vai trò</Select.Option>
                        <Select.Option value="admin">Super Admin</Select.Option>
                        <Select.Option value="course">Course Moderator</Select.Option>
                        <Select.Option value="community">Community Moderator</Select.Option>
                        <Select.Option value="finance">Finance Manager</Select.Option>
                    </Select>
                </div>

                {/* BẢNG NHÂN SỰ */}
                <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={staffList}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="staff-table"
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL: THÊM / SỬA NHÂN SỰ */}
            {/* ========================================== */}
            <Modal
                title={
                    <span className="font-extrabold text-lg text-gray-800">
                        {editingStaff ? "Chỉnh sửa Tài khoản Nhân sự" : "Cấp tài khoản Nội bộ mới"}
                    </span>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={500}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-6"
                >
                    <Form.Item
                        name="name"
                        label={<span className="font-semibold text-gray-700">Họ và Tên</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Ví dụ: Trần Văn C" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={<span className="font-semibold text-gray-700">Email doanh nghiệp (@learnova.com)</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không đúng định dạng!' }
                        ]}
                    >
                        <Input placeholder="tranvanc@learnova.com" size="large" disabled={!!editingStaff} />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label={<span className="font-semibold text-gray-700">Phân quyền (Role)</span>}
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        <Select size="large">
                            <Select.Option value="Course Moderator">Course Moderator (Duyệt khóa học)</Select.Option>
                            <Select.Option value="Community Moderator">Community Moderator (Duyệt Q&A, Review)</Select.Option>
                            <Select.Option value="Finance Manager">Finance Manager (Quản lý tài chính)</Select.Option>
                            {/* Cố tình giấu Super Admin, chỉ DB mới set được quyền này để bảo mật */}
                            <Select.Option value="Super Admin" disabled>Super Admin (Chỉ định bởi HT)</Select.Option>
                        </Select>
                    </Form.Item>

                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 mb-6">
                        <p className="text-sm text-blue-800 m-0">
                            <KeyOutlined className="mr-2" />
                            {editingStaff
                                ? "Để thay đổi mật khẩu, vui lòng sử dụng chức năng Reset Mật khẩu bên ngoài bảng."
                                : "Hệ thống sẽ tự động tạo mật khẩu mạnh và gửi email thư mời đến nhân sự này."}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <Button size="large" onClick={() => setIsModalVisible(false)}>Hủy bỏ</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold"
                        >
                            {editingStaff ? "Lưu thông tin" : "Tạo tài khoản"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
        .staff-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 700 !important;
        }
      `}} />
        </div>
    );
}