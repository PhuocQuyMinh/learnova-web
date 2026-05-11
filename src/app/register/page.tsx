"use client";

import { useState } from "react";
import { Form, Input, Button, message, Result } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import Link from "next/link";

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // State để chuyển đổi giao diện khi thành công

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            // Gọi API Đăng ký (Đảm bảo URL khớp với router backend của bạn)
            const response = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName: values.fullName,
                    email: values.email,
                    password: values.password,
                    // Mặc định role là Student theo như backend
                }),
            });

            const data = await response.json();

            if (response.ok && data.status === "success") {
                // Nếu thành công, chuyển sang màn hình thông báo kiểm tra email
                setIsSuccess(true);
            } else {
                message.error(data.message || "Đăng ký thất bại!");
            }
        } catch (error) {
            console.error("Lỗi đăng ký:", error);
            message.error("Lỗi kết nối đến máy chủ!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100">

                {/* HIỂN THỊ NẾU ĐĂNG KÝ THÀNH CÔNG */}
                {isSuccess ? (
                    <Result
                        status="success"
                        title="Đăng ký tài khoản thành công!"
                        subTitle="Chúng tôi đã gửi một đường dẫn xác thực đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả mục Spam) và làm theo hướng dẫn để kích hoạt tài khoản."
                        extra={[
                            <Button type="primary" key="login" className="!bg-learnova-purple border-none font-bold" href="/login">
                                Đi đến trang Đăng nhập
                            </Button>,
                        ]}
                    />
                ) : (
                    /* HIỂN THỊ FORM NẾU CHƯA ĐĂNG KÝ */
                    <>
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-extrabold text-learnova-dark">Đăng ký Leanova</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Đã có tài khoản?{" "}
                                <Link href="/login" className="font-medium text-learnova-purple hover:text-learnova-purple-hover">
                                    Đăng nhập ngay
                                </Link>
                            </p>
                        </div>

                        <Form name="register" onFinish={onFinish} layout="vertical" size="large">
                            <Form.Item
                                name="fullName"
                                rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
                            >
                                <Input prefix={<UserOutlined className="text-gray-400" />} placeholder="Họ và tên" />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: "Vui lòng nhập email!" },
                                    { type: "email", message: "Email không hợp lệ!" }
                                ]}
                            >
                                <Input prefix={<MailOutlined className="text-gray-400" />} placeholder="Địa chỉ Email" />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: "Vui lòng nhập mật khẩu!" },
                                    { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Mật khẩu" />
                            </Form.Item>

                            <Form.Item
                                name="confirmPassword"
                                dependencies={['password']}
                                rules={[
                                    { required: true, message: "Vui lòng xác nhận mật khẩu!" },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            if (!value || getFieldValue('password') === value) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password prefix={<LockOutlined className="text-gray-400" />} placeholder="Xác nhận mật khẩu" />
                            </Form.Item>

                            <Form.Item className="mt-6 mb-0">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full !bg-learnova-purple hover:!bg-learnova-purple-hover border-none font-bold"
                                >
                                    Đăng ký tài khoản
                                </Button>
                            </Form.Item>
                        </Form>
                    </>
                )}
            </div>
        </div>
    );
}