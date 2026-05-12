"use client";

import { useState } from "react";
import { Form, Input, Button, Upload, message, Result, Select, Alert } from "antd";
import {
    UploadOutlined,
    BankOutlined,
    IdcardOutlined,
    SafetyCertificateOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { TextArea } = Input;

export default function BecomeInstructorPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // Xử lý khi Submit Form
    const onFinish = async (values: any) => {
        setLoading(true);

        // Ở đây sau này bạn sẽ ghép API gửi dữ liệu lên Backend
        console.log("Dữ liệu gửi lên:", values);

        // Giả lập thời gian chờ gọi API (1.5 giây)
        setTimeout(() => {
            setLoading(false);
            setIsSubmitted(true);
            message.success("Đã gửi yêu cầu thành công!");
        }, 1500);
    };

    // Cấu hình cho nút Upload CV (Ngăn không cho tự động gọi API upload của Antd)
    const uploadProps = {
        beforeUpload: () => false, // Trả về false để bắt file lại ở Frontend
        maxCount: 1, // Chỉ cho phép tải lên 1 file CV/Portfolio
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {isSubmitted ? (
                    // ==========================================
                    // GIAO DIỆN KHI ĐÃ GỬI YÊU CẦU THÀNH CÔNG
                    // ==========================================
                    <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 mt-10">
                        <Result
                            status="success"
                            title="Đã gửi yêu cầu đăng ký Giảng viên!"
                            subTitle="Cảm ơn bạn đã quan tâm đến việc giảng dạy trên Leanova. Ban quản trị sẽ xem xét hồ sơ và phản hồi cho bạn qua Email trong vòng 3 - 5 ngày làm việc."
                            extra={[
                                <Link href="/" key="home">
                                    <Button size="large" className="font-bold border-gray-300">
                                        Về trang chủ
                                    </Button>
                                </Link>,
                                <Link href="/my-learning" key="learning">
                                    <Button type="primary" size="large" className="!bg-[#A435F0] border-none font-bold">
                                        Tiếp tục học tập
                                    </Button>
                                </Link>,
                            ]}
                        />
                    </div>
                ) : (
                    // ==========================================
                    // GIAO DIỆN FORM ĐIỀN THÔNG TIN
                    // ==========================================
                    <>
                        {/* Banner Tiêu đề */}
                        <div className="text-center mb-10">
                            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
                                Trở thành Giảng viên Leanova
                            </h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                                Chia sẻ kiến thức của bạn với hàng ngàn học viên trên toàn thế giới, xây dựng thương hiệu cá nhân và tạo ra nguồn thu nhập thụ động bền vững.
                            </p>
                        </div>

                        <div className="bg-white p-8 sm:p-10 rounded-lg shadow-sm border border-gray-200">
                            <Alert
                                message="Lưu ý"
                                description="Hồ sơ của bạn sẽ được đánh giá dựa trên chuyên môn và kinh nghiệm thực tế. Vui lòng cung cấp thông tin chính xác và đầy đủ nhất để đẩy nhanh quá trình xét duyệt."
                                type="info"
                                showIcon
                                className="mb-8 bg-blue-50 border-blue-200"
                            />

                            <Form
                                name="instructor-application"
                                layout="vertical"
                                size="large"
                                onFinish={onFinish}
                                requiredMark="optional" // Ẩn dấu sao đỏ mặc định của Antd, mình tự custom text
                            >
                                {/* 1. Lĩnh vực chuyên môn */}
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                                    <BankOutlined className="text-[#A435F0]" /> Chuyên môn của bạn
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                                    <Form.Item
                                        name="expertise"
                                        label={<span className="font-semibold text-gray-700">Lĩnh vực giảng dạy chính <span className="text-red-500">*</span></span>}
                                        rules={[{ required: true, message: "Vui lòng chọn lĩnh vực!" }]}
                                    >
                                        <Select placeholder="Chọn lĩnh vực bạn muốn giảng dạy">
                                            <Select.Option value="it">Công nghệ thông tin & Lập trình</Select.Option>
                                            <Select.Option value="business">Kinh doanh & Khởi nghiệp</Select.Option>
                                            <Select.Option value="design">Thiết kế đồ họa & UI/UX</Select.Option>
                                            <Select.Option value="marketing">Marketing & Truyền thông</Select.Option>
                                            <Select.Option value="language">Ngoại ngữ</Select.Option>
                                            <Select.Option value="other">Lĩnh vực khác</Select.Option>
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        name="yearsOfExperience"
                                        label={<span className="font-semibold text-gray-700">Số năm kinh nghiệm <span className="text-red-500">*</span></span>}
                                        rules={[{ required: true, message: "Vui lòng chọn số năm kinh nghiệm!" }]}
                                    >
                                        <Select placeholder="Kinh nghiệm làm việc/giảng dạy">
                                            <Select.Option value="0-1">Dưới 1 năm</Select.Option>
                                            <Select.Option value="1-3">1 - 3 năm</Select.Option>
                                            <Select.Option value="3-5">3 - 5 năm</Select.Option>
                                            <Select.Option value="5+">Trên 5 năm</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </div>

                                {/* 2. Thông tin giới thiệu */}
                                <h3 className="text-xl font-bold text-gray-800 mb-4 mt-6 flex items-center gap-2 border-b pb-2">
                                    <IdcardOutlined className="text-[#A435F0]" /> Thông tin giới thiệu
                                </h3>

                                <Form.Item
                                    name="headline"
                                    label={<span className="font-semibold text-gray-700">Chức danh / Định vị bản thân <span className="text-red-500">*</span></span>}
                                    rules={[{ required: true, message: "Vui lòng nhập chức danh!" }]}
                                >
                                    <Input placeholder="Ví dụ: Senior Software Engineer tại Google, Chuyên gia UX/UI..." />
                                </Form.Item>

                                <Form.Item
                                    name="bio"
                                    label={<span className="font-semibold text-gray-700">Giới thiệu bản thân & Kinh nghiệm <span className="text-red-500">*</span></span>}
                                    rules={[{ required: true, message: "Vui lòng nhập phần giới thiệu!" }]}
                                >
                                    <TextArea
                                        placeholder="Hãy kể ngắn gọn về hành trình sự nghiệp, những dự án nổi bật bạn đã làm và lý do bạn muốn giảng dạy..."
                                        rows={5}
                                    />
                                </Form.Item>

                                {/* 3. Hồ sơ đính kèm */}
                                <h3 className="text-xl font-bold text-gray-800 mb-4 mt-6 flex items-center gap-2 border-b pb-2">
                                    <SafetyCertificateOutlined className="text-[#A435F0]" /> Hồ sơ chứng minh
                                </h3>

                                <Form.Item
                                    name="portfolioUrl"
                                    label={<span className="font-semibold text-gray-700">Link Portfolio / LinkedIn / Website cá nhân</span>}
                                >
                                    <Input placeholder="https://www.linkedin.com/in/your-profile" />
                                </Form.Item>

                                <Form.Item
                                    name="cvFile"
                                    label={<span className="font-semibold text-gray-700">Tải lên CV (Tùy chọn)</span>}
                                    valuePropName="fileList"
                                    getValueFromEvent={(e) => {
                                        if (Array.isArray(e)) return e;
                                        return e?.fileList;
                                    }}
                                >
                                    <Upload {...uploadProps} accept=".pdf,.doc,.docx">
                                        <Button icon={<UploadOutlined />}>Chọn file CV (PDF, DOCX)</Button>
                                    </Upload>
                                    <div className="text-xs text-gray-400 mt-2">
                                        Dung lượng tối đa 5MB. Việc có CV sẽ giúp quá trình duyệt diễn ra nhanh hơn.
                                    </div>
                                </Form.Item>

                                {/* Nút Submit */}
                                <Form.Item className="mb-0 mt-10">
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={loading}
                                        className="w-full h-14 text-lg font-bold !bg-[#A435F0] hover:!bg-[#8e2ce0] border-none rounded-md transition-all shadow-md hover:shadow-lg"
                                    >
                                        Gửi yêu cầu xét duyệt
                                    </Button>
                                </Form.Item>
                            </Form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}