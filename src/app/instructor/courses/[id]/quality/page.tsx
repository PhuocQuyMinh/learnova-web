"use client";

import { useState } from "react";
import { Progress, Rate, Table, Select, Button, Tooltip, Empty, Divider, Tag } from "antd";
import {
    LineChartOutlined,
    StarFilled,
    UserOutlined,
    CarryOutOutlined,
    WarningOutlined,
    InfoCircleOutlined,
    DownloadOutlined
} from "@ant-design/icons";

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_QUALITY_STATS = {
    averageRating: 4.8,
    totalReviews: 1250,
    completionRate: 64, // 64% học viên hoàn thành khóa học
    activeStudents: 450, // Học viên học trong 7 ngày qua
    ratingDistribution: [
        { star: 5, count: 850, percent: 68 },
        { star: 4, count: 300, percent: 24 },
        { star: 3, count: 80, percent: 6 },
        { star: 2, count: 15, percent: 1.2 },
        { star: 1, count: 5, percent: 0.8 },
    ],
    lessonPerformance: [
        { key: '1', name: '101: Giới thiệu khóa học', views: 5000, completion: 98, avgTime: '05:10', dropRate: 2 },
        { key: '2', name: '102: Cài đặt môi trường', views: 4800, completion: 85, avgTime: '15:20', dropRate: 15 },
        { key: '3', name: '201: Express.js cơ bản', views: 4200, completion: 70, avgTime: '22:45', dropRate: 30 },
        { key: '4', name: '302: Sequelize & Database', views: 3500, completion: 55, avgTime: '35:10', dropRate: 45 },
    ]
};

export default function CourseQualityPage() {
    const stats = MOCK_QUALITY_STATS;

    const columns = [
        {
            title: 'Bài học',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => <span className="font-bold text-gray-800">{text}</span>,
        },
        {
            title: 'Lượt xem',
            dataIndex: 'views',
            key: 'views',
            render: (val: number) => val.toLocaleString(),
            sorter: (a: any, b: any) => a.views - b.views,
        },
        {
            title: 'Tỷ lệ hoàn thành',
            dataIndex: 'completion',
            key: 'completion',
            render: (val: number) => (
                <div className="flex items-center gap-2">
                    <Progress percent={val} size="small" strokeColor={val < 60 ? "#ff4d4f" : "#52c41a"} />
                </div>
            ),
        },
        {
            title: 'Tỷ lệ bỏ ngang',
            dataIndex: 'dropRate',
            key: 'dropRate',
            render: (val: number) => (
                <span className={`font-bold ${val > 25 ? 'text-red-500' : 'text-gray-600'}`}>
                    {val}% {val > 25 && <Tooltip title="Tỷ lệ bỏ cuộc cao, hãy kiểm tra lại độ khó bài này!"><WarningOutlined /></Tooltip>}
                </span>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-extrabold text-gray-900 m-0">Phân tích chất lượng khóa học</h1>
                        <p className="text-xs text-gray-500 m-0">Dữ liệu được cập nhật đến: Hôm nay, 06:00 AM</p>
                    </div>
                    <Button icon={<DownloadOutlined />} className="font-bold">Xuất dữ liệu CSV</Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* ROW 1: CHỈ SỐ CHÍNH (OVERVIEW CARDS) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Đánh giá trung bình</p>
                        <div className="flex items-end gap-2">
                            <h2 className="text-3xl font-extrabold m-0">{stats.averageRating}</h2>
                            <Rate disabled defaultValue={stats.averageRating} allowHalf className="text-sm mb-1.5 text-[#b4690e]" />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Từ {stats.totalReviews.toLocaleString()} học viên</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Tỷ lệ hoàn thành</p>
                        <h2 className="text-3xl font-extrabold m-0 text-green-600">{stats.completionRate}%</h2>
                        <Progress percent={stats.completionRate} showInfo={false} strokeColor="#52c41a" className="mt-2 m-0" />
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <p className="text-gray-500 text-sm mb-1">Học viên tích cực</p>
                        <h2 className="text-3xl font-extrabold m-0 text-blue-600">{stats.activeStudents}</h2>
                        <p className="text-xs text-gray-400 mt-2">Đang học trong 7 ngày qua</p>
                    </div>

                    <div className="bg-[#1c1d1f] p-6 rounded-xl shadow-sm text-white">
                        <p className="text-gray-400 text-sm mb-1">Chỉ số gắn kết (NPS)</p>
                        <h2 className="text-3xl font-extrabold m-0">72</h2>
                        <Tag color="success" className="mt-2 border-none">Rất tốt</Tag>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* CỘT TRÁI: CHI TIẾT ĐÁNH GIÁ (RATINGS) */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <StarFilled className="text-yellow-500" /> Phân bổ đánh giá
                            </h3>
                            <div className="flex flex-col gap-4">
                                {stats.ratingDistribution.map((item) => (
                                    <div key={item.star} className="flex items-center gap-4">
                                        <div className="w-12 text-sm font-bold text-gray-600 flex items-center gap-1">
                                            {item.star} <StarFilled className="text-xs text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <Progress
                                                percent={item.percent}
                                                showInfo={false}
                                                strokeColor="#A435F0"
                                                trailColor="#f3f4f6"
                                            />
                                        </div>
                                        <div className="w-12 text-right text-xs text-gray-400">
                                            {item.percent}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Divider />
                            <div className="text-center">
                                <Button type="link" className="font-bold text-[#A435F0]">Xem tất cả nhận xét</Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                            <h4 className="text-blue-800 font-bold mb-2 flex items-center gap-2">
                                <InfoCircleOutlined /> Lời khuyên từ Leanova
                            </h4>
                            <p className="text-sm text-blue-700 leading-relaxed m-0">
                                Khóa học của bạn có tỷ lệ bỏ rơi tăng cao ở <b>Chương 3</b>. Hãy cân nhắc chia nhỏ các video dài trên 20 phút hoặc thêm bài tập thực hành xen kẽ để giữ chân học viên.
                            </p>
                        </div>
                    </div>

                    {/* CỘT PHẢI: HIỆU SUẤT TỪNG BÀI HỌC (TABLE) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-full">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold m-0 flex items-center gap-2">
                                    <LineChartOutlined className="text-purple-600" /> Hiệu suất theo bài học
                                </h3>
                                <Select defaultValue="all" size="small" className="w-40">
                                    <Select.Option value="all">Tất cả chương</Select.Option>
                                    <Select.Option value="c1">Chương 1</Select.Option>
                                </Select>
                            </div>
                            <Table
                                dataSource={stats.lessonPerformance}
                                columns={columns}
                                pagination={false}
                                className="quality-table"
                            />
                        </div>
                    </div>

                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .quality-table .ant-table-thead > tr > th {
          background-color: #f9fafb !important;
          font-weight: 700 !important;
          font-size: 13px !important;
        }
        .quality-table .ant-table-tbody > tr > td {
          font-size: 14px !important;
          padding: 16px 8px !important;
        }
      `}} />
        </div>
    );
}