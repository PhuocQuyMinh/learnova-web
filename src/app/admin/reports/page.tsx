"use client";

import { useState } from "react";
import {
    Card, Button, DatePicker, Select, Radio, Checkbox,
    Table, Tag, message, Divider, Space, Tooltip, Progress
} from "antd";
import {
    DownloadOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    HistoryOutlined,
    BarChartOutlined,
    FilterOutlined,
    SyncOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";

const { RangePicker } = DatePicker;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_EXPORT_HISTORY = [
    {
        id: "REP-2026-05-12-001",
        name: "Báo cáo Doanh thu & Hoa hồng Tháng 4/2026",
        type: "Revenue & Commission",
        format: "Excel",
        requestedBy: "Trịnh Ạt Min",
        requestedAt: "12/05/2026 08:30",
        status: "Ready", // Đã xử lý xong, sẵn sàng tải
        size: "2.4 MB",
    },
    {
        id: "REP-2026-05-10-042",
        name: "Báo cáo Đối soát Ngân hàng VNPay Quý 1",
        type: "Payment Gateway Reconciliation",
        format: "CSV",
        requestedBy: "Nguyễn Kế Toán",
        requestedAt: "10/05/2026 15:45",
        status: "Ready",
        size: "15.8 MB",
    }
];

export default function AdminFinancialReportPage() {
    const [history, setHistory] = useState(MOCK_EXPORT_HISTORY);
    const [isExporting, setIsExporting] = useState(false);
    const [reportFormat, setReportFormat] = useState("excel");

    // Xử lý tạo báo cáo (Giả lập chạy ngầm)
    const handleCreateReport = () => {
        setIsExporting(true);

        // 1. Thêm một dòng "Đang xử lý" vào bảng lịch sử ngay lập tức
        const newReportId = `REP-2026-05-12-099`;
        const newReport = {
            id: newReportId,
            name: "Báo cáo Tùy chỉnh (Đang tạo...)",
            type: "Custom Report",
            format: reportFormat === "excel" ? "Excel" : "PDF",
            requestedBy: "Trịnh Ạt Min",
            requestedAt: "Vừa xong",
            status: "Processing", // Trạng thái đang chạy ngầm
            size: "--",
        };

        setHistory([newReport, ...history]);
        message.info("Hệ thống đang tổng hợp dữ liệu. Vui lòng không đóng trình duyệt lúc này...");

        // 2. Giả lập thời gian server xử lý file nặng (3 giây)
        setTimeout(() => {
            setIsExporting(false);
            message.success("Báo cáo đã được tạo thành công! Bạn có thể tải xuống ngay.");

            // Cập nhật trạng thái thành Ready
            setHistory(prev => prev.map(item =>
                item.id === newReportId
                    ? { ...item, name: "Báo cáo Tùy chỉnh (Hoàn tất)", status: "Ready", size: "1.2 MB" }
                    : item
            ));
        }, 3000);
    };

    const historyColumns = [
        {
            title: 'Mã Báo cáo',
            dataIndex: 'id',
            key: 'id',
            render: (text: string) => <span className="font-mono text-gray-500 text-xs">{text}</span>,
        },
        {
            title: 'Tên báo cáo',
            key: 'name',
            render: (_: any, record: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{record.name}</span>
                    <span className="text-xs text-gray-500">{record.type}</span>
                </div>
            ),
        },
        {
            title: 'Định dạng',
            dataIndex: 'format',
            key: 'format',
            render: (format: string) => (
                <Tag
                    icon={format === 'Excel' || format === 'CSV' ? <FileExcelOutlined /> : <FilePdfOutlined />}
                    color={format === 'Excel' || format === 'CSV' ? 'green' : 'red'}
                    className="font-bold border-none"
                >
                    {format}
                </Tag>
            ),
        },
        {
            title: 'Thời gian yêu cầu',
            dataIndex: 'requestedAt',
            key: 'requestedAt',
            render: (text: string, record: any) => (
                <div className="flex flex-col">
                    <span className="text-sm text-gray-700">{text}</span>
                    <span className="text-xs text-gray-400">bởi {record.requestedBy}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => {
                if (status === 'Processing') {
                    return (
                        <div className="flex items-center gap-2 text-blue-500 font-medium text-sm">
                            <SyncOutlined spin /> Đang trích xuất...
                        </div>
                    );
                }
                return <Tag color="success" icon={<CheckCircleOutlined />} className="border-none font-medium">Sẵn sàng ({status})</Tag>;
            },
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_: any, record: any) => (
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    disabled={record.status === 'Processing'}
                    className={record.status === 'Processing' ? '' : '!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold'}
                >
                    {record.status === 'Processing' ? 'Đang tạo...' : `Tải xuống (${record.size})`}
                </Button>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 m-0 flex items-center gap-2">
                            <BarChartOutlined className="text-[#A435F0]" /> Xuất Báo cáo Tài chính
                        </h1>
                        <p className="text-sm text-gray-500 m-0 mt-1">Trích xuất dữ liệu doanh thu, đối soát và thuế để phục vụ Kế toán</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">

                {/* ========================================== */}
                {/* CỘT TRÁI: FORM CẤU HÌNH XUẤT BÁO CÁO (Chiếm 1/3) */}
                {/* ========================================== */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                    <Card
                        title={<span className="font-extrabold text-gray-800 flex items-center gap-2"><FilterOutlined /> Cấu hình Dữ liệu</span>}
                        className="rounded-xl shadow-sm border-gray-200 h-full"
                        bordered={false}
                    >
                        <div className="flex flex-col gap-6">

                            {/* 1. Loại báo cáo */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Loại báo cáo</label>
                                <Select defaultValue="revenue" size="large" className="w-full">
                                    <Select.Option value="revenue">Tổng hợp Doanh thu & Hoa hồng</Select.Option>
                                    <Select.Option value="reconciliation">Đối soát Cổng thanh toán (VNPay)</Select.Option>
                                    <Select.Option value="refunds">Báo cáo Hoàn tiền (Refunds)</Select.Option>
                                    <Select.Option value="instructor">Bảng kê chi trả Giảng viên</Select.Option>
                                </Select>
                            </div>

                            {/* 2. Kỳ báo cáo */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Kỳ báo cáo (Thời gian)</label>
                                <Radio.Group defaultValue="thisMonth" className="w-full flex flex-col gap-3 mb-3">
                                    <Radio value="thisMonth">Tháng này</Radio>
                                    <Radio value="lastMonth">Tháng trước</Radio>
                                    <Radio value="custom">Tùy chỉnh khoảng thời gian</Radio>
                                </Radio.Group>
                                <RangePicker format="DD/MM/YYYY" className="w-full" size="large" />
                            </div>

                            {/* 3. Trường dữ liệu bổ sung */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Dữ liệu đi kèm</label>
                                <Checkbox.Group className="flex flex-col gap-2">
                                    <Checkbox value="buyerInfo" defaultChecked>Thông tin Học viên (Tên, Email)</Checkbox>
                                    <Checkbox value="instructorInfo" defaultChecked>Thông tin Giảng viên sở hữu</Checkbox>
                                    <Checkbox value="tax">Chi tiết Thuế (VAT/PIT)</Checkbox>
                                    <Checkbox value="promo">Mã giảm giá đã sử dụng</Checkbox>
                                </Checkbox.Group>
                            </div>

                            <Divider className="my-2" />

                            {/* 4. Định dạng file */}
                            <div>
                                <label className="block font-bold text-gray-700 mb-2">Định dạng File</label>
                                <Radio.Group
                                    value={reportFormat}
                                    onChange={(e) => setReportFormat(e.target.value)}
                                    className="w-full grid grid-cols-2 gap-4"
                                >
                                    <Radio.Button value="excel" className="text-center h-12 leading-[46px] rounded-lg">
                                        <FileExcelOutlined className="text-green-600 mr-1" /> Excel (.xlsx)
                                    </Radio.Button>
                                    <Radio.Button value="pdf" className="text-center h-12 leading-[46px] rounded-lg">
                                        <FilePdfOutlined className="text-red-600 mr-1" /> PDF
                                    </Radio.Button>
                                </Radio.Group>
                            </div>

                            {/* 5. Nút Submit */}
                            <Button
                                type="primary"
                                size="large"
                                icon={isExporting ? <SyncOutlined spin /> : <BarChartOutlined />}
                                onClick={handleCreateReport}
                                loading={isExporting}
                                className="w-full h-14 text-lg font-bold !bg-[#A435F0] hover:!bg-[#8e2ce0] border-none rounded-md shadow-md mt-2"
                            >
                                {isExporting ? "Đang trích xuất dữ liệu..." : "Tạo Báo cáo"}
                            </Button>
                            <p className="text-xs text-gray-400 text-center m-0">Quá trình này có thể mất vài phút tùy thuộc vào lượng dữ liệu.</p>
                        </div>
                    </Card>
                </div>

                {/* ========================================== */}
                {/* CỘT PHẢI: LỊCH SỬ XUẤT BÁO CÁO (Chiếm 2/3) */}
                {/* ========================================== */}
                <div className="w-full lg:w-2/3">
                    <Card
                        title={<span className="font-extrabold text-gray-800 flex items-center gap-2"><HistoryOutlined /> Lịch sử Xuất Báo cáo</span>}
                        className="rounded-xl shadow-sm border-gray-200 h-full"
                        bordered={false}
                    >
                        {isExporting && (
                            <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100 flex items-center justify-between">
                                <div>
                                    <div className="font-bold text-purple-900 mb-1">Hệ thống đang chạy ngầm 1 tiến trình trích xuất...</div>
                                    <div className="text-xs text-purple-700">Bạn có thể rời khỏi trang này, file sẽ tự động lưu vào Lịch sử khi hoàn tất.</div>
                                </div>
                                <Progress type="circle" percent={68} size={40} strokeColor="#A435F0" />
                            </div>
                        )}

                        <Table
                            columns={historyColumns}
                            dataSource={history}
                            rowKey="id"
                            pagination={{ pageSize: 8 }}
                            className="export-history-table"
                        />
                    </Card>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .export-history-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 700 !important;
        }
      `}} />
        </div>
    );
}