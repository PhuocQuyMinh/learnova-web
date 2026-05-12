"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Result, Button, Spin } from "antd";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function PaymentResultPage() {
    // Thêm dòng này vào đầu component
    const { clearCartLocal } = useCartStore();

    const searchParams = useSearchParams();
    const router = useRouter();
    const { token } = useAuthStore(); // Lấy token từ store

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [messageText, setMessageText] = useState("Đang xử lý kết quả giao dịch...");
    const hasCalledAPI = useRef(false);

    useEffect(() => {
        // 1. Nếu chưa có token (Zustand đang load), thì DỪNG LẠI, chưa làm gì cả.
        if (!token) {
            return;
        }

        // Lấy toàn bộ chuỗi query trên thanh địa chỉ (VD: vnp_Amount=...&vnp_ResponseCode=...)
        const queryString = searchParams.toString();

        if (!queryString) {
            setStatus("error");
            setMessageText("Không tìm thấy dữ liệu giao dịch hợp lệ!");
            return;
        }

        const processPayment = async () => {
            if (hasCalledAPI.current) return;
            hasCalledAPI.current = true;

            try {
                // Gửi toàn bộ tham số VNPay xuống cho backend xử lý hàm vnpayReturn
                // Lưu ý: Route backend thường dùng GET cho việc này
                const response = await fetch(`http://localhost:8000/api/store/vnpay-return?${queryString}`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}` // Bơm thẻ thông hành vào đây!
                    }
                });

                const data = await response.json();

                // VNPay mã 00 là thành công
                if (response.ok && data.data?.code === '00') {
                    setStatus("success");
                    setMessageText(data.message || "Thanh toán thành công! Khóa học đã được thêm vào Không gian học tập của bạn.");

                    // Gọi hàm dọn giỏ hàng local
                    clearCartLocal();
                } else {
                    setStatus("error");
                    setMessageText(data.message || "Thanh toán thất bại hoặc đã bị hủy.");
                }
            } catch (error) {
                console.error("Lỗi xử lý thanh toán:", error);
                setStatus("error");
                setMessageText("Lỗi kết nối đến máy chủ khi xác thực thanh toán.");
            }
        };

        processPayment();
    }, [searchParams, token]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md border border-gray-100 text-center">
                {status === "loading" && (
                    <div className="py-12">
                        <Spin size="large" />
                        <h3 className="mt-6 text-xl font-medium text-gray-700">{messageText}</h3>
                        <p className="text-gray-500 mt-2">Vui lòng không đóng trình duyệt lúc này.</p>
                    </div>
                )}

                {status === "success" && (
                    <Result
                        status="success"
                        title="Thanh toán thành công!"
                        subTitle={messageText}
                        extra={[
                            <Link href="/my-learning" key="learning">
                                <Button type="primary" size="large" className="!bg-learnova-purple border-none font-bold">
                                    Vào học ngay
                                </Button>
                            </Link>,
                            <Link href="/" key="home">
                                <Button size="large">Về trang chủ</Button>
                            </Link>
                        ]}
                    />
                )}

                {status === "error" && (
                    <Result
                        status="error"
                        title="Giao dịch không thành công"
                        subTitle={messageText}
                        extra={[
                            <Button size="large" key="cart" onClick={() => router.push('/cart')}>
                                Quay lại giỏ hàng
                            </Button>,
                            <Button size="large" key="home" onClick={() => router.push('/')}>
                                Về trang chủ
                            </Button>
                        ]}
                    />
                )}
            </div>
        </div>
    );
}