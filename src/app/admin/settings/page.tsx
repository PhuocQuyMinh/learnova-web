"use client";

import { useState } from "react";
import {
    Form, Input, Button, Tabs, Upload, Card, message,
    Divider, Space, Switch
} from "antd";
import {
    SaveOutlined,
    UploadOutlined,
    GlobalOutlined,
    PhoneOutlined,
    MailOutlined,
    FacebookOutlined,
    YoutubeOutlined,
    LinkedinOutlined,
    SettingOutlined,
    InfoCircleOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_SETTINGS = {
    // Tab 1: Cấu hình chung
    platformName: "Leanova",
    tagline: "Học tập mỗi ngày để mở rộng cánh cửa tương lai",
    logoUrl: "https://placehold.co/200x60/1c1d1f/FFFFFF?text=Leanova+Logo",
    faviconUrl: "https://placehold.co/32x32/A435F0/FFFFFF?text=L",
    maintenanceMode: false,

    // Tab 2: Thông tin liên hệ
    contactEmail: "support@learnova.com",
    contactPhone: "1900 1234",
    address: "Tòa nhà Tech, 123 Đường Công Nghệ, Quận 1, TP. HCM",
    workingHours: "Thứ 2 - Thứ 6 (08:00 - 17:30)",

    // Tab 3: Mạng xã hội & Khác
    facebookUrl: "https://facebook.com/learnova",
    youtubeUrl: "https://youtube.com/learnova",
    linkedinUrl: "https://linkedin.com/company/learnova",

    // Tab 4: SEO & Meta
    metaTitle: "Leanova - Nền tảng học trực tuyến hàng đầu",
    metaDescription: "Khám phá hàng ngàn khóa học từ lập trình, thiết kế đến kinh doanh cùng đội ngũ giảng viên chất lượng cao trên Leanova.",
    metaKeywords: "học trực tuyến, khóa học online, lập trình, thiết kế, learnova"
};

export default function AdminSystemSettingsPage() {
    const [form] = Form.useForm();
    const [isSaving, setIsSaving] = useState(false);

    // Xử lý khi ấn nút Lưu
    const handleSaveSettings = async () => {
        try {
            const values = await form.validateFields();
            setIsSaving(true);

            // Giả lập gọi API
            setTimeout(() => {
                console.log("Dữ liệu cấu hình lưu xuống DB:", values);
                message.success("Đã lưu cấu hình hệ thống thành công!");
                setIsSaving(false);
            }, 1000);
        } catch (error) {
            message.error("Vui lòng kiểm tra lại các trường thông tin bị lỗi!");
        }
    };

    // Cấu hình Upload (Ngăn Antd tự gọi API)
    const uploadProps = {
        beforeUpload: () => false,
        maxCount: 1,
    };

    // ==========================================
    // NỘI DUNG CÁC TABS
    // ==========================================

    // Tab 1: Cấu hình chung
    const GeneralSettings = () => (
        <div className="max-w-3xl animate-fade-in pt-4">
            <Form.Item name="platformName" label={<span className="font-bold">Tên nền tảng</span>} rules={[{ required: true }]}>
                <Input size="large" />
            </Form.Item>
            <Form.Item name="tagline" label={<span className="font-bold">Slogan / Tagline</span>}>
                <Input size="large" />
            </Form.Item>

            <Divider />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                    <p className="font-bold mb-2">Logo hệ thống</p>
                    <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300 mb-3 h-32">
                        <img src={MOCK_SETTINGS.logoUrl} alt="Logo" className="max-h-full object-contain" />
                    </div>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Tải Logo mới lên</Button>
                    </Upload>
                    <p className="text-xs text-gray-400 mt-2">Kích thước khuyến nghị: 200x60px (PNG trong suốt)</p>
                </div>

                <div>
                    <p className="font-bold mb-2">Favicon (Icon trình duyệt)</p>
                    <div className="bg-gray-100 p-4 rounded-lg flex flex-col items-center justify-center border border-dashed border-gray-300 mb-3 h-32">
                        <img src={MOCK_SETTINGS.faviconUrl} alt="Favicon" className="w-10 h-10 object-cover rounded-md" />
                    </div>
                    <Upload {...uploadProps}>
                        <Button icon={<UploadOutlined />}>Tải Favicon mới lên</Button>
                    </Upload>
                    <p className="text-xs text-gray-400 mt-2">Kích thước: 32x32px (PNG hoặc ICO)</p>
                </div>
            </div>

            <Divider />

            <Form.Item
                name="maintenanceMode"
                valuePropName="checked"
                className="bg-orange-50 p-4 rounded-lg border border-orange-100"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-bold text-orange-800">Chế độ Bảo trì (Maintenance Mode)</div>
                        <div className="text-sm text-orange-600">Bật tính năng này sẽ chặn học viên truy cập vào website (chỉ Admin được vào).</div>
                    </div>
                    <Switch className="bg-gray-300 [&.ant-switch-checked]:bg-orange-500" />
                </div>
            </Form.Item>
        </div>
    );

    // Tab 2: Liên hệ
    const ContactSettings = () => (
        <div className="max-w-3xl animate-fade-in pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
                <Form.Item name="contactEmail" label={<span className="font-bold">Email hỗ trợ</span>} rules={[{ type: 'email' }]}>
                    <Input size="large" prefix={<MailOutlined className="text-gray-400" />} />
                </Form.Item>
                <Form.Item name="contactPhone" label={<span className="font-bold">Hotline</span>}>
                    <Input size="large" prefix={<PhoneOutlined className="text-gray-400" />} />
                </Form.Item>
            </div>
            <Form.Item name="workingHours" label={<span className="font-bold">Giờ làm việc</span>}>
                <Input size="large" placeholder="VD: Thứ 2 - Thứ 6 (08:00 - 17:30)" />
            </Form.Item>
            <Form.Item name="address" label={<span className="font-bold">Địa chỉ văn phòng</span>}>
                <TextArea rows={3} className="focus:border-[#A435F0] hover:border-[#A435F0]" />
            </Form.Item>
        </div>
    );

    // Tab 3: Mạng xã hội
    const SocialSettings = () => (
        <div className="max-w-3xl animate-fade-in pt-4">
            <p className="text-gray-500 mb-6">Các đường link này sẽ hiển thị ở Footer của trang web.</p>
            <Form.Item name="facebookUrl" label={<span className="font-bold">Facebook Page</span>}>
                <Input size="large" prefix={<FacebookOutlined className="text-blue-600" />} placeholder="https://facebook.com/..." />
            </Form.Item>
            <Form.Item name="youtubeUrl" label={<span className="font-bold">YouTube Channel</span>}>
                <Input size="large" prefix={<YoutubeOutlined className="text-red-600" />} placeholder="https://youtube.com/..." />
            </Form.Item>
            <Form.Item name="linkedinUrl" label={<span className="font-bold">LinkedIn Profile</span>}>
                <Input size="large" prefix={<LinkedinOutlined className="text-blue-700" />} placeholder="https://linkedin.com/..." />
            </Form.Item>
        </div>
    );

    // Tab 4: SEO
    const SEOSettings = () => (
        <div className="max-w-3xl animate-fade-in pt-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-6 flex items-start gap-3 border border-blue-100">
                <InfoCircleOutlined className="text-blue-500 mt-1" />
                <p className="text-sm text-blue-800 m-0">Cấu hình SEO giúp website của bạn hiển thị tốt hơn trên Google Search. Các thẻ này sẽ được gắn vào thẻ <code>&lt;head&gt;</code> của trang chủ.</p>
            </div>
            <Form.Item name="metaTitle" label={<span className="font-bold">Meta Title (Tiêu đề trang web)</span>}>
                <Input size="large" showCount maxLength={60} />
            </Form.Item>
            <Form.Item name="metaDescription" label={<span className="font-bold">Meta Description (Mô tả tìm kiếm)</span>}>
                <TextArea rows={3} showCount maxLength={160} className="focus:border-[#A435F0] hover:border-[#A435F0]" />
            </Form.Item>
            <Form.Item name="metaKeywords" label={<span className="font-bold">Meta Keywords (Từ khóa)</span>}>
                <Input size="large" placeholder="Cách nhau bằng dấu phẩy. VD: học online, khóa học..." />
            </Form.Item>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER STICKY CÓ NÚT LƯU */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
                            <SettingOutlined /> Cấu hình Hệ thống
                        </h1>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<SaveOutlined />}
                        loading={isSaving}
                        onClick={handleSaveSettings}
                        className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold px-8 shadow-md"
                    >
                        Lưu thay đổi
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Card className="rounded-xl shadow-sm border-gray-200" bordered={false}>
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={MOCK_SETTINGS}
                    >
                        <Tabs
                            defaultActiveKey="1"
                            size="large"
                            className="custom-settings-tabs"
                            items={[
                                { key: "1", label: <span className="font-bold px-2">Cấu hình chung</span>, children: <GeneralSettings /> },
                                { key: "2", label: <span className="font-bold px-2">Liên hệ</span>, children: <ContactSettings /> },
                                { key: "3", label: <span className="font-bold px-2">Mạng xã hội</span>, children: <SocialSettings /> },
                                { key: "4", label: <span className="font-bold px-2">SEO & Metadata</span>, children: <SEOSettings /> },
                            ]}
                        />
                    </Form>
                </Card>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-settings-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #A435F0 !important;
        }
        .custom-settings-tabs .ant-tabs-ink-bar {
          background: #A435F0 !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
}