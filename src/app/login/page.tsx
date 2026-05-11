"use client";

import { useState } from "react";
import { Form, Input, Button, Typography, message, Divider } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import Link from "next/link";

const { Title, Text } = Typography;

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const loginAction = useAuthStore((state) => state.login);
    const router = useRouter();

    // Hàm xử lý submit form
    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: values.email,
                    password: values.password,
                }),
            });

            const data = await response.json();

            // Kiểm tra linh hoạt: response.ok (mã 200) hoặc có chữ success
            if (response.ok && data.status === "success") {
                message.success("Đăng nhập thành công!");

                // TRÍCH XUẤT AN TOÀN: 
                // Lấy token và user dù nó nằm ở ngoài cùng hay bọc trong object data
                const token = data.token || data.data?.token;
                const userData = data.user || data.data?.user;

                // Lưu vào Zustand (Middleware Persist sẽ tự động ghi vào localStorage)
                loginAction(token, userData);

                // Chuyển hướng về trang chủ
                router.push("/");
            } else {
                message.error(data.message || "Đăng nhập thất bại. Vui lòng thử lại!");
            }
        } catch (error) {
            console.error("Lỗi kết nối:", error);
            message.error("Lỗi kết nối đến máy chủ. Vui lòng kiểm tra lại mạng!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">

                {/* Header - Logo Leanova */}
                <div className="text-center mb-8">
                    <Title level={2} className="!mb-2" style={{ color: '#A435F0' }}>
                        <span className="font-extrabold tracking-tight">Leanova</span>
                    </Title>
                    <Text className="text-gray-500 text-base">
                        Chào mừng bạn quay trở lại!
                    </Text>
                </div>

                {/* Login Form */}
                <Form
                    name="login_form"
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" },
                        ]}
                    >
                        <Input
                            prefix={<MailOutlined className="text-gray-400" />}
                            placeholder="Email của bạn"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            placeholder="Mật khẩu"
                            className="rounded-lg"
                        />
                    </Form.Item>

                    <div className="flex justify-end mb-6 -mt-2">
                        <Link
                            href="/forgot-password"
                            className="text-sm font-medium hover:underline"
                            style={{ color: '#A435F0' }}
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>

                    <Form.Item className="mb-4">
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            loading={loading}
                            className="h-12 text-base font-semibold border-none hover:opacity-90"
                            style={{ backgroundColor: '#A435F0' }}
                        >
                            Đăng nhập
                        </Button>
                    </Form.Item>
                </Form>

                <Divider plain className="text-gray-400">Hoặc</Divider>

                {/* Chuyển sang trang tạo tài khoản */}
                <div className="text-center mt-6">
                    <Text className="text-gray-600">Chưa có tài khoản? </Text>
                    <Link
                        href="/register"
                        className="font-bold hover:underline"
                        style={{ color: '#A435F0' }}
                    >
                        Đăng ký ngay
                    </Link>
                </div>
            </div>
        </main>
    );
}