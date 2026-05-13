"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useRouter } from "next/navigation";
import {
    Button, Table, Tag, Typography, Modal, Form, Input,
    InputNumber, Select, message, Tooltip, Empty, Skeleton
} from "antd";
import {
    PlusOutlined,
    EditOutlined,
    PictureOutlined,
    InfoCircleOutlined,
    WarningOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;
const { Option, OptGroup } = Select;

export default function InstructorCoursesPage() {
    const { token, user } = useAuthStore();
    const { categories, fetchCategories } = useCategoryStore();
    const router = useRouter();
    const [form] = Form.useForm();

    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal Tạo mới
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // 1. Fetch dữ liệu
    const fetchMyCourses = async () => {
        if (!token) return;
        try {
            const res = await fetch("http://localhost:8000/api/courses/my-courses", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setCourses(data.data.courses);
            }
        } catch (error) {
            message.error("Lỗi tải danh sách khóa học!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || user?.role !== "Instructor") {
            router.push("/");
            return;
        }
        fetchMyCourses();
        fetchCategories(); // Lấy danh mục để cho vào Form tạo mới
    }, [token, user, router]);

    // 2. Xử lý tạo khóa học mới
    const handleCreateCourse = async (values: any) => {
        setIsCreating(true);
        try {
            const res = await fetch("http://localhost:8000/api/courses", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(values)
            });
            const data = await res.json();

            if (res.ok) {
                message.success("Đã tạo khóa học nháp thành công!");
                setIsCreateModalOpen(false);
                form.resetFields();
                // Chuyển thẳng giảng viên vào trang chỉnh sửa chi tiết của khóa học vừa tạo
                router.push(`/instructor/courses/${data.data.course.id}/edit`);
            } else {
                message.error(data.message || "Có lỗi xảy ra!");
            }
        } catch (error) {
            message.error("Lỗi mạng!");
        } finally {
            setIsCreating(false);
        }
    };

    // Format tiền tệ
    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    // Render Trạng thái khóa học
    const renderStatus = (status: string, rejectMessage: string) => {
        if (status === 'Published') return <Tag color="green" className="font-bold border-none px-3 py-1">Đang bán (Published)</Tag>;
        if (status === 'Pending') return <Tag color="orange" className="font-bold border-none px-3 py-1">Đang chờ duyệt</Tag>;
        if (status === 'Rejected') {
            return (
                <Tooltip title={`Lý do từ chối: ${rejectMessage}`} color="red">
                    <Tag color="red" className="font-bold border-none px-3 py-1 cursor-help flex items-center w-max">
                        <WarningOutlined className="mr-1" /> Cần chỉnh sửa
                    </Tag>
                </Tooltip>
            );
        }
        return <Tag>{status}</Tag>;
    };

    // Cấu hình cột cho Bảng (Table)
    const columns = [
        {
            title: 'Khóa học',
            key: 'course',
            width: '45%',
            render: (record: any) => (
                <div className="flex gap-4 items-center">
                    {record.coverImage ? (
                        <img src={record.coverImage} alt="cover" className="w-32 h-20 object-cover rounded-md border border-gray-200" />
                    ) : (
                        <div className="w-32 h-20 bg-gray-100 rounded-md border border-gray-200 flex items-center justify-center text-gray-400">
                            <PictureOutlined className="text-2xl" />
                        </div>
                    )}
                    <div>
                        <h4 className="font-bold text-base text-gray-900 line-clamp-2 m-0 hover:text-learnova-purple transition-colors cursor-pointer"
                            onClick={() => router.push(`/instructor/courses/${record.id}/edit`)}>
                            {record.title}
                        </h4>
                        <div className="text-xs text-gray-500 mt-1">
                            Cập nhật: {new Date(record.updatedAt).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: '20%',
            render: (record: any) => renderStatus(record.status, record.rejectMessage)
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            width: '15%',
            render: (price: number) => <span className="font-bold text-gray-800">{price > 0 ? formatCurrency(price) : 'Miễn phí'}</span>
        },
        {
            title: 'Hành động',
            key: 'actions',
            width: '20%',
            align: 'right' as const,
            render: (record: any) => (
                <Button
                    type="primary"
                    ghost
                    icon={<EditOutlined />}
                    className="font-bold border-learnova-purple text-learnova-purple hover:!bg-learnova-purple hover:!text-white"
                    onClick={() => router.push(`/instructor/courses/${record.id}/edit`)}
                >
                    Biên tập nội dung
                </Button>
            )
        }
    ];

    if (isLoading) return <div className="p-10 max-w-7xl mx-auto"><Skeleton active paragraph={{ rows: 10 }} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <Title level={2} className="!m-0 text-gray-900 font-extrabold">Khóa học của tôi</Title>
                        <Text className="text-gray-500 text-base">Quản lý và cập nhật nội dung các khóa học bạn đang giảng dạy.</Text>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        className="!bg-learnova-purple font-bold border-none shadow-md h-12 px-6 rounded-lg"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Tạo khóa học mới
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {courses.length > 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <Table
                            dataSource={courses}
                            columns={columns}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            scroll={{ x: 800 }}
                        />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 flex flex-col items-center justify-center">
                        <Empty
                            description={<span className="text-gray-500 text-lg">Bạn chưa tạo khóa học nào.</span>}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                        <Button
                            type="primary"
                            size="large"
                            className="mt-6 !bg-learnova-purple font-bold border-none px-8 rounded-lg"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Tạo khóa học đầu tiên
                        </Button>
                    </div>
                )}
            </div>

            {/* MODAL TẠO KHÓA HỌC MỚI */}
            <Modal
                title={<div className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4">Bắt đầu tạo khóa học</div>}
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                <div className="pt-4">
                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 mb-6 flex gap-3 text-learnova-purple">
                        <InfoCircleOutlined className="text-xl mt-0.5" />
                        <span className="text-sm font-medium leading-relaxed">
                            Khóa học sau khi tạo sẽ ở trạng thái <strong>Nháp (Pending)</strong>. Bạn sẽ có thời gian để tải lên video, tài liệu và cấu trúc chương trình học ở màn hình tiếp theo trước khi gửi cho Admin duyệt.
                        </span>
                    </div>

                    <Form form={form} layout="vertical" onFinish={handleCreateCourse} requiredMark="optional">
                        <Form.Item
                            name="title"
                            label={<span className="font-bold text-gray-700">Tên khóa học <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học!' }]}
                        >
                            <Input size="large" placeholder="VD: Lập trình ReactJS Thực chiến từ A-Z" maxLength={100} showCount className="bg-gray-50 hover:bg-white focus:bg-white rounded-lg" />
                        </Form.Item>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Form.Item
                                name="categoryId"
                                label={<span className="font-bold text-gray-700">Danh mục <span className="text-red-500">*</span></span>}
                                rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                            >
                                <Select size="large" placeholder="Chọn lĩnh vực giảng dạy..." className="w-full">
                                    {/* Nhóm danh mục lồng nhau để tuân thủ luật "Chỉ chọn danh mục con" của backend */}
                                    {categories.map((cat: any) => (
                                        <OptGroup label={cat.name} key={cat.id}>
                                            {cat.children?.map((child: any) => (
                                                <Option value={child.id} key={child.id}>{child.name}</Option>
                                            ))}
                                        </OptGroup>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="price"
                                label={<span className="font-bold text-gray-700">Giá bán (VNĐ) <span className="text-red-500">*</span></span>}
                                rules={[{ required: true, message: 'Vui lòng nhập giá bán!' }]}
                                initialValue={0}
                            >
                                <InputNumber
                                    size="large"
                                    className="w-full bg-gray-50 hover:bg-white focus:bg-white rounded-lg"
                                    // Bổ sung kiểu (value: any) và dấu ? an toàn
                                    formatter={(value: any) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(value: any) => value?.replace(/\$\s?|(,*)/g, '')}
                                    min={0}
                                    step={10000}
                                />
                            </Form.Item>
                        </div>

                        <Form.Item
                            name="description"
                            label={<span className="font-bold text-gray-700">Mô tả ngắn gọn</span>}
                        >
                            <Input.TextArea rows={3} placeholder="Mô tả ngắn gọn về giá trị khóa học mang lại..." className="bg-gray-50 hover:bg-white focus:bg-white rounded-lg text-base" />
                        </Form.Item>

                        <div className="flex justify-end gap-3 mt-8 border-t border-gray-100 pt-5">
                            <Button size="large" onClick={() => setIsCreateModalOpen(false)} className="font-bold rounded-lg px-6">Hủy</Button>
                            <Button size="large" type="primary" htmlType="submit" loading={isCreating} className="!bg-learnova-purple font-bold border-none rounded-lg px-8">
                                Khởi tạo khóa học
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}