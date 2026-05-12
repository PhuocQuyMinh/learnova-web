"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Row, Col, Skeleton } from "antd";
import {
    MailOutlined,
    PhoneOutlined,
    EnvironmentOutlined,
    FacebookFilled,
    ClockCircleOutlined,
} from "@ant-design/icons";
import { useSettingStore } from "@/store/useSettingStore";
import { usePathname } from "next/navigation";

export default function Footer() {
    const { contactInfo, isLoading, fetchSettings } = useSettingStore();
    const pathname = usePathname();

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Kiểm tra xem đường dẫn hiện tại có bắt đầu bằng chữ "/learning" hay không
    // (Vì URL của trang học đang là /learning/[courseId])
    if (pathname.startsWith("/learning")) {
        return null; // Trả về null nghĩa là giấu hẳn Footer đi
    }

    // Ẩn Footer ở trang login/register
    const hideFooterRoutes = ["/login", "/register", "/forgot-password"];
    if (hideFooterRoutes.includes(pathname)) return null;


    return (
        <footer className="bg-learnova-dark text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-6">
                <Row gutter={[48, 32]}>
                    {/* CỘT 1: LOGO & ABOUT US */}
                    <Col xs={24} lg={12}>
                        <div className="mb-6">
                            <Link href="/">
                                <h2 className="text-3xl font-extrabold text-white m-0 tracking-tighter">
                                    Leanova<span className="text-learnova-purple">.</span>
                                </h2>
                            </Link>
                        </div>

                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 4 }} />
                        ) : (
                            <div
                                className="footer-about-us text-gray-400 text-sm leading-relaxed prose prose-invert max-w-none"
                                dangerouslySetInnerHTML={{ __html: contactInfo?.aboutUs || "" }}
                            />
                        )}
                    </Col>

                    {/* CỘT 2: THÔNG TIN LIÊN HỆ */}
                    <Col xs={24} md={12} lg={6}>
                        <h3 className="text-white font-bold text-lg mb-6">Liên hệ với chúng tôi</h3>
                        {isLoading ? (
                            <Skeleton active paragraph={{ rows: 3 }} />
                        ) : (
                            <ul className="space-y-4 p-0 list-none text-gray-400 text-sm">
                                <li className="flex items-start gap-3">
                                    <MailOutlined className="text-learnova-purple mt-1" />
                                    <span>{contactInfo?.email}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <PhoneOutlined className="text-learnova-purple mt-1" />
                                    <span>{contactInfo?.phone}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <EnvironmentOutlined className="text-learnova-purple mt-1" />
                                    <span>{contactInfo?.address}</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <ClockCircleOutlined className="text-learnova-purple mt-1" />
                                    <span>{contactInfo?.workingHours}</span>
                                </li>
                            </ul>
                        )}
                    </Col>

                    {/* CỘT 3: KẾT NỐI & PHÁP LÝ */}
                    <Col xs={24} md={12} lg={6}>
                        <h3 className="text-white font-bold text-lg mb-6">Mạng xã hội</h3>
                        <div className="flex gap-4 mb-8">
                            <a
                                href={contactInfo?.facebook}
                                target="_blank"
                                rel="noreferrer"
                                /* Đã thêm dấu ! và mã Hex trực tiếp */
                                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl !text-[#A435F0] hover:!bg-[#A435F0] hover:!text-white transition-all"
                            >
                                <FacebookFilled />
                            </a>
                        </div>

                        <h3 className="text-white font-bold text-lg mb-4">Pháp lý</h3>
                        <ul className="space-y-2 p-0 list-none text-sm">
                            <li>
                                <Link
                                    href="/terms"
                                    /* Đã thêm dấu ! và mã Hex trực tiếp */
                                    className="!text-[#A435F0] hover:!text-[#8e2ce0] transition-colors font-medium block py-1"
                                >
                                    Điều khoản sử dụng
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/privacy"
                                    /* Đã thêm dấu ! và mã Hex trực tiếp */
                                    className="!text-[#A435F0] hover:!text-[#8e2ce0] transition-colors font-medium block py-1"
                                >
                                    Chính sách bảo mật
                                </Link>
                            </li>
                        </ul>
                    </Col>
                </Row>

                <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs">
                    <p>© 2026 Leanova, Inc. Tất cả quyền được bảo lưu.</p>
                    <div className="flex gap-6">
                        <span>Ngôn ngữ: Tiếng Việt</span>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .footer-about-us h3 {
                    color: #ffffff;
                    font-size: 1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                    margin-top: 1.5rem;
                }
                .footer-about-us p {
                    margin-bottom: 0.75rem;
                }
                .footer-about-us strong {
                    color: var(--color-learnova-purple);
                }
            `}</style>
        </footer>
    );
}