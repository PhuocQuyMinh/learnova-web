"use client";

import { useState } from "react";
import { Button, Table, Tag, DatePicker, Select, Tooltip } from "antd";
import {
    WalletOutlined,
    DollarOutlined,
    HistoryOutlined,
    ArrowUpOutlined,
    QuestionCircleOutlined,
    DownloadOutlined,
    BarChartOutlined
} from "@ant-design/icons";
import Link from "next/link";

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_METRICS = {
    totalRevenue: 125500000,   // Tổng doanh thu từ trước đến nay
    availableBalance: 15400000,// Số dư có thể rút
    pendingBalance: 3200000,   // Đang chờ đối soát (Pending)
};

const MOCK_CHART_DATA = [
    { month: "Thg 1", amount: 12000000, height: "40%" },
    { month: "Thg 2", amount: 15500000, height: "55%" },
    { month: "Thg 3", amount: 9800000, height: "30%" },
    { month: "Thg 4", amount: 22000000, height: "80%" },
    { month: "Thg 5", amount: 28500000, height: "100%" }, // Tháng cao nhất
    { month: "Thg 6", amount: 18400000, height: "65%" },
];

const MOCK_TRANSACTIONS = [
    {
        key: "1",
        orderId: "VNP12030755",
        courseName: "Lập trình Node.js & Express RESTful API",
        buyer: "Nguyễn Văn A",
        purchasePrice: 2496000,
        commissionRate: 0.7, // 70%
        earned: 1747200,
        date: "12/05/2026 14:30",
        status: "Completed",
    },
    {
        key: "2",
        orderId: "VNP12030890",
        courseName: "Master React.js & Next.js 14",
        buyer: "Trần Thị B",
        purchasePrice: 1850000,
        commissionRate: 0.7,
        earned: 1295000,
        date: "11/05/2026 09:15",
        status: "Pending", // Đang chờ đối soát 30 ngày theo luật Udemy
    },
    {
        key: "3",
        orderId: "VNP12030112",
        courseName: "Lập trình Node.js & Express RESTful API",
        buyer: "Lê Hoàng C",
        purchasePrice: 2496000,
        commissionRate: 0.7,
        earned: 1747200,
        date: "10/05/2026 20:45",
        status: "Completed",
    },
];

export default function InstructorRevenuePage() {
    const [timeRange, setTimeRange] = useState("6months");

    // Cấu hình cột cho Bảng lịch sử giao dịch (Ant Design Table)
    const columns = [
        {
            title: 'Mã ĐH',
            dataIndex: 'orderId',
            key: 'orderId',
            render: (text: string) => <span className="font-medium text-gray-600">{text}</span>,
        },
        {
            title: 'Khóa học',
            dataIndex: 'courseName',
            key: 'courseName',
            render: (text: string) => <span className="font-bold text-gray-800 line-clamp-1">{text}</span>,
        },
        {
            title: 'Học viên',
            dataIndex: 'buyer',
            key: 'buyer',
        },
        {
            title: 'Giá bán',
            dataIndex: 'purchasePrice',
            key: 'purchasePrice',
            render: (val: number) => `${val.toLocaleString('vi-VN')} ₫`,
        },
        {
            title: 'Tỉ lệ chia',
            dataIndex: 'commissionRate',
            key: 'commissionRate',
            render: (val: number) => `${val * 100}%`,
            align: 'center' as 'center',
        },
        {
            title: 'Thực nhận',
            dataIndex: 'earned',
            key: 'earned',
            render: (val: number) => <span className="font-bold text-[#A435F0]">{val.toLocaleString('vi-VN')} ₫</span>,
        },
        {
            title: 'Ngày giao dịch',
            dataIndex: 'date',
            key: 'date',
        },
        {
            title: 'Trạng thái',
            key: 'status',
            dataIndex: 'status',
            render: (status: string) => (
                <Tag color={status === 'Completed' ? 'success' : 'processing'} className="m-0 font-medium border-none">
                    {status === 'Completed' ? 'Đã đối soát' : 'Chờ xử lý'}
                </Tag>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER TÀI CHÍNH */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <h1 className="text-2xl font-extrabold text-gray-900 m-0">Báo cáo doanh thu</h1>
                    <Button
                        type="primary"
                        size="large"
                        icon={<WalletOutlined />}
                        className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold shadow-md"
                    >
                        Rút tiền ngay
                    </Button>
                </div>
            </div>

            <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ROW 1: CÁC THẺ THỐNG KÊ (METRICS CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Thẻ 1: Tổng doanh thu */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <DollarOutlined className="text-8xl text-[#A435F0]" />
                        </div>
                        <div>
                            <p className="text-gray-500 font-medium mb-1">Tổng doanh thu toàn thời gian</p>
                            <h2 className="text-3xl font-extrabold text-gray-900 m-0">
                                {MOCK_METRICS.totalRevenue.toLocaleString('vi-VN')} ₫
                            </h2>
                        </div>
                        <div className="mt-4 text-sm font-medium text-green-600 flex items-center gap-1">
                            <ArrowUpOutlined /> Tăng 15% so với tháng trước
                        </div>
                    </div>

                    {/* Thẻ 2: Số dư khả dụng */}
                    <div className="bg-gradient-to-br from-[#A435F0] to-[#8e2ce0] p-6 rounded-xl shadow-md text-white flex flex-col justify-between">
                        <div>
                            <p className="text-purple-100 font-medium mb-1">Số dư khả dụng (Có thể rút)</p>
                            <h2 className="text-3xl font-extrabold m-0 text-white">
                                {MOCK_METRICS.availableBalance.toLocaleString('vi-VN')} ₫
                            </h2>
                        </div>
                        <div className="mt-4">
                            <Button ghost className="border-white text-white hover:!bg-white hover:!text-[#A435F0] font-bold border-2">
                                Thiết lập tài khoản ngân hàng
                            </Button>
                        </div>
                    </div>

                    {/* Thẻ 3: Đang chờ đối soát */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <p className="text-gray-500 font-medium mb-1 flex items-center gap-1">
                                Đang chờ xử lý
                                <Tooltip title="Theo chính sách hoàn tiền 30 ngày, doanh thu sẽ bị giữ lại 1 tháng trước khi có thể rút.">
                                    <QuestionCircleOutlined className="cursor-help" />
                                </Tooltip>
                            </p>
                            <h2 className="text-3xl font-extrabold text-gray-800 m-0">
                                {MOCK_METRICS.pendingBalance.toLocaleString('vi-VN')} ₫
                            </h2>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Sẽ khả dụng vào chu kỳ thanh toán tiếp theo.
                        </div>
                    </div>
                </div>

                {/* ROW 2: BIỂU ĐỒ DOANH THU & BỘ LỌC */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                        <h3 className="text-lg font-bold text-gray-900 m-0 flex items-center gap-2">
                            <BarChartOutlined className="text-[#A435F0]" /> Biểu đồ tăng trưởng
                        </h3>
                        <div className="flex gap-3">
                            <Select defaultValue="6months" style={{ width: 150 }} onChange={setTimeRange}>
                                <Select.Option value="3months">3 tháng gần nhất</Select.Option>
                                <Select.Option value="6months">6 tháng gần nhất</Select.Option>
                                <Select.Option value="year">Năm nay</Select.Option>
                            </Select>
                            <Button icon={<DownloadOutlined />}>Xuất báo cáo</Button>
                        </div>
                    </div>

                    {/* Biểu đồ giả lập bằng CSS Grid (Không cần cài thêm thư viện Chart) */}
                    <div className="h-64 flex items-end justify-between gap-2 sm:gap-6 pt-4 border-b border-gray-200">
                        {MOCK_CHART_DATA.map((data, index) => (
                            <div key={index} className="flex flex-col items-center flex-1 group">
                                <Tooltip title={`${data.amount.toLocaleString('vi-VN')} ₫`}>
                                    <div className="w-full max-w-[60px] bg-purple-100 group-hover:bg-purple-200 rounded-t-md relative flex items-end justify-center transition-all duration-300" style={{ height: '240px' }}>
                                        <div
                                            className="w-full bg-[#A435F0] rounded-t-md transition-all duration-700 ease-out shadow-sm group-hover:shadow-md"
                                            style={{ height: data.height }}
                                        ></div>
                                    </div>
                                </Tooltip>
                                <span className="mt-3 text-sm font-medium text-gray-500">{data.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ROW 3: BẢNG LỊCH SỬ GIAO DỊCH */}
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900 m-0 flex items-center gap-2">
                            <HistoryOutlined className="text-[#A435F0]" /> Lịch sử giao dịch chi tiết
                        </h3>
                        <DatePicker.RangePicker format="DD/MM/YYYY" className="hidden sm:flex" />
                    </div>

                    <div className="overflow-x-auto">
                        <Table
                            columns={columns}
                            dataSource={MOCK_TRANSACTIONS}
                            pagination={{ pageSize: 5 }}
                            className="custom-instructor-table"
                        />
                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-instructor-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          color: #4b5563 !important;
          font-weight: 700 !important;
        }
      `}} />
        </div>
    );
}