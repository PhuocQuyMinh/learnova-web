"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Result, Button, Spin } from "antd";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Lấy token từ URL (ví dụ: ?token=abcxyz123)
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Đang xác minh tài khoản của bạn...");

    // Dùng ref để ngăn chặn React Strict Mode gọi API 2 lần
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Không tìm thấy mã xác thực. Vui lòng kiểm tra lại đường dẫn trong email!");
            return;
        }

        const verifyAccount = async () => {
            if (hasFetched.current) return;
            hasFetched.current = true;

            try {
                // Gọi API Xác thực (Đảm bảo URL khớp với router backend của bạn)
                const response = await fetch(`http://localhost:8000/api/auth/verify-email?token=${encodeURIComponent(token)}`, {
                    method: "GET", // Hoặc GET tùy thuộc vào cách bạn viết Router bên backend
                    headers: { "Content-Type": "application/json" },
                });

                const data = await response.json();

                if (response.ok && data.status === "success") {
                    setStatus("success");
                    setMessage(data.message || "Tài khoản của bạn đã được xác thực thành công!");
                } else {
                    setStatus("error");
                    setMessage(data.message || "Mã xác thực không hợp lệ hoặc đã hết hạn!");
                }
            } catch (error) {
                console.error("Lỗi verify email:", error);
                setStatus("error");
                setMessage("Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.");
            }
        };

        verifyAccount();
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">

                {status === "loading" && (
                    <div className="py-10">
                        <Spin size="large" />
                        <h3 className="mt-4 text-lg font-medium text-gray-700">{message}</h3>
                    </div>
                )}

                {status === "success" && (
                    <Result
                        status="success"
                        title="Xác thực thành công!"
                        subTitle={message}
                        extra={[
                            <Button
                                type="primary"
                                key="login"
                                size="large"
                                className="!bg-learnova-purple border-none font-bold"
                                onClick={() => router.push('/login')}
                            >
                                Đăng nhập ngay
                            </Button>
                        ]}
                    />
                )}

                {status === "error" && (
                    <Result
                        status="error"
                        title="Xác thực thất bại"
                        subTitle={message}
                        extra={[
                            <Button
                                key="back"
                                size="large"
                                onClick={() => router.push('/')}
                            >
                                Về trang chủ
                            </Button>,
                            <Button
                                type="primary"
                                key="register"
                                size="large"
                                className="!bg-learnova-purple border-none font-bold"
                                onClick={() => router.push('/register')}
                            >
                                Đăng ký lại
                            </Button>
                        ]}
                    />
                )}
            </div>
        </div>
    );
}