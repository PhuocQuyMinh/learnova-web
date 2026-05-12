"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Form, Input, Button, Checkbox, Upload, message,
    Typography, Card, Result, Skeleton
} from "antd";
import { UploadOutlined, FilePdfOutlined, CheckCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function ApplyInstructorPage() {
    const { user, token } = useAuthStore();
    const router = useRouter();
    const [form] = Form.useForm();

    const [terms, setTerms] = useState("");
    const [isLoadingTerms, setIsLoadingTerms] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [fileList, setFileList] = useState<any[]>([]);

    // 1. Fetch Điều khoản Giảng viên khi load trang
    useEffect(() => {
        if (!token) {
            router.push("/login?redirect=/apply-instructor");
            return;
        }

        // Nếu đã là Instructor rồi thì không cho nộp đơn nữa
        if (user?.role === "Instructor") {
            message.info("Bạn đã là Giảng viên rồi!");
            router.push("/instructor/dashboard");
            return;
        }

        const fetchTerms = async () => {
            try {
                const res = await fetch("http://localhost:8000/api/moderation/settings/instructor-terms");
                const data = await res.json();
                if (res.ok && data.status === "success") {
                    setTerms(data.data.terms);
                } else {
                    setTerms("<p>Vui lòng tuân thủ các quy định chung của hệ thống Leanova.</p>");
                }
            } catch (error) {
                setTerms("<p>Không thể tải điều khoản lúc này.</p>");
            } finally {
                setIsLoadingTerms(false);
            }
        };

        fetchTerms();
    }, [token, user, router]);

    // 2. Xử lý Nộp đơn
    const onFinish = async (values: any) => {
        if (fileList.length === 0) {
            return message.error("Vui lòng tải lên chứng chỉ, CV hoặc tài liệu chứng minh!");
        }

        setIsSubmitting(true);
        try {
            // Sử dụng FormData để hỗ trợ upload File
            const formData = new FormData();
            formData.append("bio", values.bio);
            formData.append("experience", values.experience || "");
            formData.append("portfolioUrl", values.portfolioUrl || "");
            formData.append("isTermsAccepted", values.isTermsAccepted ? "true" : "false");


            // Lấy file gốc từ Upload của Antd (ưu tiên originFileObj nếu có, nếu không thì lấy chính nó)
            const fileToUpload = fileList[0].originFileObj || fileList[0];
            formData.append("certificate", fileToUpload);

            const res = await fetch("http://localhost:8000/api/moderation/apply-instructor", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                    // KHÔNG set Content-Type ở đây, trình duyệt sẽ tự động set 'multipart/form-data' kèm boundary
                },
                body: formData
            });

            const data = await res.json();

            if (res.ok) {
                setIsSuccess(true);
            } else {
                message.error(data.message || "Bạn đã có đơn đang chờ duyệt rồi!");
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Props cho component Upload của Ant Design
    const uploadProps = {
        onRemove: () => {
            setFileList([]);
        },
        beforeUpload: (file: any) => {
            // Chặn tính năng auto-upload của Ant Design để gom vào FormData gửi 1 lượt
            setFileList([file]);
            return false;
        },
        fileList,
        maxCount: 1, // Chỉ cho đính kèm 1 file
        accept: ".pdf,.doc,.docx,.jpg,.png"
    };

    // NẾU NỘP ĐƠN THÀNH CÔNG -> HIỂN THỊ MÀN HÌNH THÀNH CÔNG
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <Card className="max-w-2xl w-full rounded-2xl shadow-sm border-gray-100 p-8 text-center">
                    <Result
                        icon={<CheckCircleOutlined className="text-6xl text-green-500" />}
                        title={<span className="text-2xl font-bold text-gray-800 mt-4">Nộp đơn thành công!</span>}
                        subTitle="Hồ sơ đăng ký Giảng viên của bạn đã được gửi đến Ban Kiểm Duyệt Leanova. Chúng tôi sẽ xem xét và phản hồi sớm nhất có thể."
                        extra={[
                            <Button
                                type="primary"
                                size="large"
                                key="home"
                                onClick={() => router.push('/')}
                                className="!bg-learnova-purple font-bold border-none"
                            >
                                Về trang chủ
                            </Button>
                        ]}
                    />
                </Card>
            </div>
        );
    }

    // MÀN HÌNH FORM ĐIỀN ĐƠN
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <Title level={2} className="!mb-2 text-gray-900 font-extrabold">Trở thành Giảng viên Leanova</Title>
                    <Paragraph className="text-gray-500 text-lg">Chia sẻ kiến thức của bạn và lan tỏa giá trị đến hàng ngàn học viên.</Paragraph>
                </div>

                <Card className="rounded-2xl shadow-sm border-gray-100 p-2 md:p-6">
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        requiredMark="optional"
                    >
                        {/* 1. THÔNG TIN CÁ NHÂN */}
                        <Title level={4} className="!mb-6 border-b border-gray-100 pb-2">Thông tin chuyên môn</Title>

                        <Form.Item
                            name="bio"
                            label={<span className="font-bold text-gray-700">Giới thiệu bản thân (Bio) <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng giới thiệu ngắn về bạn!' }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Hãy cho chúng tôi biết về chuyên môn và niềm đam mê giảng dạy của bạn..."
                                className="bg-gray-50 hover:bg-white focus:bg-white transition-colors"
                            />
                        </Form.Item>

                        <Form.Item
                            name="experience"
                            label={<span className="font-bold text-gray-700">Kinh nghiệm giảng dạy / làm việc</span>}
                        >
                            <Input
                                size="large"
                                placeholder="VD: 5 năm làm Frontend Developer tại công ty X..."
                                className="bg-gray-50 hover:bg-white focus:bg-white transition-colors"
                            />
                        </Form.Item>

                        <Form.Item
                            name="portfolioUrl"
                            label={<span className="font-bold text-gray-700">Liên kết Portfolio / LinkedIn</span>}
                            rules={[{ type: 'url', message: 'Vui lòng nhập một đường dẫn URL hợp lệ!' }]}
                        >
                            <Input
                                size="large"
                                placeholder="https://linkedin.com/in/your-profile"
                                className="bg-gray-50 hover:bg-white focus:bg-white transition-colors"
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-bold text-gray-700">Tài liệu chứng minh (CV, Bằng cấp, Chứng chỉ) <span className="text-red-500">*</span></span>}
                            extra="Hỗ trợ file định dạng PDF, DOCX, JPG, PNG. Kích thước tối đa 5MB."
                        >
                            <Upload {...uploadProps}>
                                <Button icon={<UploadOutlined />} size="large" className="font-medium text-learnova-purple border-learnova-purple bg-purple-50">
                                    Chọn file tải lên
                                </Button>
                            </Upload>
                        </Form.Item>

                        {/* 2. ĐIỀU KHOẢN SỬ DỤNG */}
                        <div className="mt-12 mb-8">
                            <Title level={4} className="!mb-4 border-b border-gray-100 pb-2">Điều khoản & Thỏa thuận</Title>

                            {/* ĐÃ TĂNG PADDING (p-8) VÀ CHIỀU CAO (h-72) */}
                            <div className="bg-gray-50 p-6 md:p-8 rounded-xl h-72 overflow-y-auto mb-6 border border-gray-200 shadow-inner">
                                {isLoadingTerms ? (
                                    <Skeleton active paragraph={{ rows: 8 }} />
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none text-gray-700 learnova-html-content leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: terms }}
                                    />
                                )}
                            </div>

                            <Form.Item
                                name="isTermsAccepted"
                                valuePropName="checked"
                                rules={[
                                    { validator: (_, value) => value ? Promise.resolve() : Promise.reject(new Error('Bạn phải đồng ý với điều khoản để tiếp tục!')) }
                                ]}
                            >
                                <Checkbox className="font-bold text-gray-800 text-base">
                                    Tôi đã đọc, hiểu và đồng ý với các điều khoản giảng dạy của Leanova.
                                </Checkbox>
                            </Form.Item>
                        </div>

                        {/* SUBMIT BUTTON */}
                        <Form.Item className="mb-0 text-right mt-8">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                loading={isSubmitting}
                                className="!bg-learnova-purple font-bold text-lg h-12 px-10 border-none shadow-md"
                            >
                                Nộp đơn đăng ký
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
}