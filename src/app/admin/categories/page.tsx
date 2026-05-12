"use client";

import { useState } from "react";
import { Table, Tag, Button, Input, Space, Modal, Form, Tooltip, Switch, message } from "antd";
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    SearchOutlined,
    AppstoreOutlined,
    CodeOutlined,
    BgColorsOutlined,
    GlobalOutlined,
    LineChartOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_CATEGORIES = [
    {
        id: "CAT-01",
        name: "Công nghệ thông tin & Lập trình",
        slug: "it-lap-trinh",
        icon: <CodeOutlined />,
        description: "Các khóa học về Web, Mobile, AI, Data Science và DevOps.",
        courseCount: 125, // Số lượng khóa học đang thuộc danh mục này
        isActive: true,
    },
    {
        id: "CAT-02",
        name: "Thiết kế đồ họa & UI/UX",
        slug: "thiet-ke",
        icon: <BgColorsOutlined />,
        description: "Học sử dụng Photoshop, Illustrator, Figma và tư duy thiết kế.",
        courseCount: 42,
        isActive: true,
    },
    {
        id: "CAT-03",
        name: "Kinh doanh & Khởi nghiệp",
        slug: "kinh-doanh",
        icon: <LineChartOutlined />,
        description: "Kỹ năng quản trị, sale, tài chính và xây dựng doanh nghiệp.",
        courseCount: 8,
        isActive: true,
    },
    {
        id: "CAT-04",
        name: "Ngoại ngữ",
        slug: "ngoai-ngu",
        icon: <GlobalOutlined />,
        description: "Tiếng Anh, Tiếng Nhật, Tiếng Hàn giao tiếp và luyện thi.",
        courseCount: 0, // Danh mục trống, chưa có khóa học nào
        isActive: false, // Đang bị ẩn
    }
];

export default function AdminCategoryManagementPage() {
    const [categories, setCategories] = useState(MOCK_CATEGORIES);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [form] = Form.useForm();

    // Mở Modal Thêm mới hoặc Chỉnh sửa
    const handleOpenModal = (category: any = null) => {
        setEditingCategory(category);
        if (category) {
            form.setFieldsValue(category);
        } else {
            form.resetFields();
            form.setFieldsValue({ isActive: true }); // Mặc định là Active khi tạo mới
        }
        setIsModalVisible(true);
    };

    // Xử lý Submit Form
    const handleSubmit = (values: any) => {
        if (editingCategory) {
            message.success(`Đã cập nhật danh mục: ${values.name}`);
            // Giả lập cập nhật UI
            setCategories(categories.map(c => c.id === editingCategory.id ? { ...c, ...values } : c));
        } else {
            message.success(`Đã tạo danh mục mới: ${values.name}`);
            // Giả lập thêm mới
            const newCat = {
                id: `CAT-0${categories.length + 1}`,
                icon: <AppstoreOutlined />,
                courseCount: 0,
                ...values
            };
            setCategories([newCat, ...categories]);
        }
        setIsModalVisible(false);
    };

    // Xử lý Xóa danh mục
    const handleDelete = (record: any) => {
        if (record.courseCount > 0) {
            Modal.error({
                title: "Không thể xóa danh mục này!",
                content: `Danh mục "${record.name}" đang chứa ${record.courseCount} khóa học. Bạn chỉ có thể Tắt trạng thái (Ẩn) của danh mục này thay vì xóa nó để tránh lỗi dữ liệu.`,
            });
            return;
        }

        Modal.confirm({
            title: "Xác nhận xóa danh mục",
            content: `Bạn có chắc chắn muốn xóa danh mục "${record.name}" không? Hành động này không thể hoàn tác.`,
            okText: "Xóa vĩnh viễn",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => {
                setCategories(categories.filter(c => c.id !== record.id));
                message.success("Đã xóa danh mục thành công.");
            }
        });
    };

    // Thay đổi trạng thái Ẩn/Hiện nhanh
    const toggleStatus = (id: string, checked: boolean) => {
        setCategories(categories.map(c => c.id === id ? { ...c, isActive: checked } : c));
        message.success(`Đã ${checked ? 'hiển thị' : 'ẩn'} danh mục trên trang chủ.`);
    };

    const columns = [
        {
            title: 'Mã DM',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500">{text}</span>,
            width: '10%',
        },
        {
            title: 'Tên danh mục',
            key: 'name',
            render: (_: any, record: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-[#A435F0] flex items-center justify-center text-lg border border-purple-100">
                        {record.icon}
                    </div>
                    <div>
                        <div className="font-bold text-gray-800 text-[15px]">{record.name}</div>
                        <div className="text-xs text-gray-500 font-mono">/{record.slug}</div>
                    </div>
                </div>
            ),
            width: '35%',
        },
        {
            title: 'Số khóa học',
            dataIndex: 'courseCount',
            key: 'courseCount',
            render: (count: number) => (
                <Tag color={count > 0 ? "blue" : "default"} className="font-bold px-3 py-1 border-none rounded-full">
                    {count} khóa học
                </Tag>
            ),
            width: '15%',
        },
        {
            title: 'Hiển thị',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean, record: any) => (
                <Tooltip title={isActive ? "Đang hiển thị trên trang chủ" : "Đang bị ẩn"}>
                    <Switch
                        checked={isActive}
                        onChange={(checked) => toggleStatus(record.id, checked)}
                        className={isActive ? "bg-[#52c41a]" : "bg-gray-300"}
                    />
                </Tooltip>
            ),
            width: '15%',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Tooltip title="Chỉnh sửa">
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenModal(record)}
                            className="text-blue-600 hover:bg-blue-50"
                        />
                    </Tooltip>
                    <Tooltip title={record.courseCount > 0 ? "Không thể xóa vì đang có khóa học" : "Xóa danh mục"}>
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleDelete(record)}
                            className={record.courseCount > 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-red-50"}
                        />
                    </Tooltip>
                </Space>
            ),
            width: '15%',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0">Quản lý Danh mục</h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Sắp xếp và phân loại các khóa học trên hệ thống</p>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => handleOpenModal()}
                        className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold shadow-md"
                    >
                        Thêm danh mục mới
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* THANH TÌM KIẾM */}
                <div className="bg-white p-4 rounded-t-xl border border-gray-100 border-b-0 flex justify-between items-center">
                    <Input
                        placeholder="Tìm kiếm tên danh mục hoặc slug..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        className="max-w-md"
                        size="large"
                    />
                </div>

                {/* BẢNG DANH MỤC */}
                <div className="bg-white rounded-b-xl border border-gray-100 shadow-sm overflow-hidden">
                    <Table
                        columns={columns}
                        dataSource={categories}
                        rowKey="id"
                        pagination={{ pageSize: 10 }}
                        className="category-table"
                    />
                </div>
            </div>

            {/* ========================================== */}
            {/* MODAL: THÊM / SỬA DANH MỤC */}
            {/* ========================================== */}
            <Modal
                title={
                    <span className="font-extrabold text-lg text-gray-800">
                        {editingCategory ? "Chỉnh sửa Danh mục" : "Tạo Danh mục mới"}
                    </span>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null} // Ẩn footer mặc định để dùng footer của Form
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    className="mt-6"
                >
                    <Form.Item
                        name="name"
                        label={<span className="font-semibold text-gray-700">Tên danh mục</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tên danh mục!' }]}
                    >
                        <Input placeholder="Ví dụ: Lập trình Mobile" size="large" />
                    </Form.Item>

                    <Form.Item
                        name="slug"
                        label={<span className="font-semibold text-gray-700">Đường dẫn tĩnh (Slug)</span>}
                        rules={[
                            { required: true, message: 'Vui lòng nhập đường dẫn tĩnh!' },
                            { pattern: /^[a-z0-9-]+$/, message: 'Slug chỉ được chứa chữ cái thường, số và dấu gạch ngang!' }
                        ]}
                    >
                        <Input placeholder="vi-du-lap-trinh-mobile" size="large" addonBefore="learnova.com/courses/" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label={<span className="font-semibold text-gray-700">Mô tả ngắn</span>}
                    >
                        <TextArea rows={3} placeholder="Danh mục này nói về..." className="focus:border-[#A435F0] hover:border-[#A435F0]" />
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label={<span className="font-semibold text-gray-700">Trạng thái hiển thị</span>}
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="Đang hiện" unCheckedChildren="Đang ẩn" className="bg-gray-300 [&.ant-switch-checked]:bg-[#52c41a]" />
                    </Form.Item>

                    <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 pt-5">
                        <Button size="large" onClick={() => setIsModalVisible(false)}>Hủy bỏ</Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold"
                        >
                            {editingCategory ? "Lưu thay đổi" : "Tạo danh mục"}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <style dangerouslySetInnerHTML={{
                __html: `
        .category-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 700 !important;
        }
      `}} />
        </div>
    );
}