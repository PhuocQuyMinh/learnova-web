"use client";

import { useState } from "react";
import { Collapse, Checkbox, Tabs, Progress, Avatar, Button, Input, Form, Divider } from "antd";
import {
    PlayCircleFilled,
    LeftOutlined,
    FileTextOutlined,
    CheckCircleFilled,
    TrophyOutlined,
    SearchOutlined,
    MessageOutlined,
    CheckCircleTwoTone
} from "@ant-design/icons";
import Link from "next/link";

// DỮ LIỆU TĨNH: NỘI DUNG KHÓA HỌC
const MOCK_COURSE_DATA = {
    id: 101,
    title: "Lập trình Node.js & Express RESTful API từ cơ bản đến nâng cao",
    progressPercent: 30,
    sections: [
        {
            id: 1,
            title: "Chương 1: Khởi động dự án",
            lessons: [
                { id: 101, title: "Giới thiệu khóa học", duration: "05:20", type: "video", isCompleted: true },
                { id: 102, title: "Cài đặt môi trường Node.js", duration: "12:15", type: "video", isCompleted: true },
            ],
        },
        {
            id: 2,
            title: "Chương 2: Xây dựng RESTful API với Express",
            lessons: [
                { id: 201, title: "Express.js là gì?", duration: "15:30", type: "video", isCompleted: false },
                { id: 202, title: "Định tuyến (Routing) cơ bản", duration: "20:45", type: "video", isCompleted: false },
            ],
        }
    ],
};

// DỮ LIỆU TĨNH: DANH SÁCH CÂU HỎI Q&A
const MOCK_QA_LIST = [
    {
        id: 1,
        user: { name: "Nguyễn Văn A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=A" },
        title: "Lỗi 'Cannot find module express' khi chạy npm start",
        content: "Giảng viên cho em hỏi, em đã chạy npm install nhưng khi start lại báo lỗi thiếu module express. Cụ thể mã lỗi là Error: Cannot find module 'express'. Em dùng Node v18 ạ.",
        createdAt: "2 giờ trước",
        replies: 3,
        isInstructorReplied: true, // Đánh dấu nếu GV đã trả lời
    },
    {
        id: 2,
        user: { name: "Trần B", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=B" },
        title: "Cách cấu hình Nodemon trong package.json",
        content: "Ở phút 10:25, phần script cấu hình nodemon em làm theo nhưng bị văng lỗi. Có cần cài global (npm i -g nodemon) không ạ?",
        createdAt: "1 ngày trước",
        replies: 1,
        isInstructorReplied: false,
    }
];

export default function LearningSpacePage() {
    const course = MOCK_COURSE_DATA;
    const qaList = MOCK_QA_LIST;

    const [activeLessonId, setActiveLessonId] = useState(201);

    // State quản lý việc hiển thị Form đặt câu hỏi
    const [isAsking, setIsAsking] = useState(false);

    const getLessonIcon = (type: string, isCompleted: boolean) => {
        if (isCompleted) return <CheckCircleFilled className="text-green-500 mt-1" />;
        switch (type) {
            case "video": return <PlayCircleFilled className="text-gray-400 mt-1" />;
            case "article": return <FileTextOutlined className="text-gray-400 mt-1" />;
            case "quiz": return <TrophyOutlined className="text-gray-400 mt-1" />;
            default: return <PlayCircleFilled className="text-gray-400 mt-1" />;
        }
    };

    return (
        <div className="h-screen flex flex-col bg-white overflow-hidden">
            {/* HEADER */}
            <header className="h-14 bg-[#1c1d1f] text-white flex items-center justify-between px-4 flex-shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/my-learning" className="hover:text-gray-300 transition-colors flex items-center gap-2">
                        <LeftOutlined /> <span className="hidden sm:inline">Quay lại Tổng quan</span>
                    </Link>
                    <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>
                    <h1 className="text-sm sm:text-base font-bold m-0 line-clamp-1">{course.title}</h1>
                </div>
                <div className="flex items-center gap-3">
                    <Progress percent={course.progressPercent} showInfo={false} strokeColor="#A435F0" trailColor="#3e4143" className="w-24 sm:w-32 m-0" size="small" />
                    <span className="text-xs font-bold">{course.progressPercent}%</span>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">

                {/* CỘT TRÁI: NỘI DUNG CHÍNH */}
                <main className="flex-1 overflow-y-auto bg-white flex flex-col custom-scrollbar">
                    {/* Vùng phát Video */}
                    <div className="w-full bg-black aspect-video flex items-center justify-center relative flex-shrink-0">
                        <img src="https://placehold.co/1280x720/1c1d1f/FFFFFF?text=Video+Player" alt="Video Player Placeholder" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <PlayCircleFilled className="text-white text-6xl opacity-80" />
                        </div>
                    </div>

                    {/* CÁC TAB NỘI DUNG DƯỚI VIDEO */}
                    <div className="max-w-4xl px-6 py-8 mx-auto w-full">
                        <Tabs
                            defaultActiveKey="qa" // Đặt mặc định mở tab QA để bạn dễ test
                            size="large"
                            items={[
                                {
                                    key: "overview",
                                    label: <span className="font-bold text-base">Tổng quan bài học</span>,
                                    children: (
                                        <div className="pt-4 text-gray-700 leading-relaxed">
                                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Express.js là gì?</h2>
                                            <p className="mb-4">Trong bài học này, chúng ta sẽ tìm hiểu về Express.js...</p>
                                        </div>
                                    )
                                },
                                {
                                    key: "qa",
                                    label: <span className="font-bold text-base">Hỏi đáp (Q&A)</span>,
                                    children: (
                                        <div className="pt-4">
                                            {isAsking ? (
                                                // ==========================================
                                                // MÀN HÌNH VIẾT CÂU HỎI MỚI
                                                // ==========================================
                                                <div className="animate-fade-in">
                                                    <div className="flex items-center gap-2 text-[#A435F0] mb-6 cursor-pointer font-medium hover:text-purple-900 transition-colors" onClick={() => setIsAsking(false)}>
                                                        <LeftOutlined /> Quay lại danh sách câu hỏi
                                                    </div>
                                                    <Form layout="vertical">
                                                        <Form.Item label={<span className="font-bold text-gray-800">Tiêu đề câu hỏi</span>} required>
                                                            <Input placeholder="Ví dụ: Lỗi khi cài đặt express, biến môi trường bị undefined..." size="large" />
                                                        </Form.Item>
                                                        <Form.Item label={<span className="font-bold text-gray-800">Chi tiết vấn đề (Mã nguồn, hình ảnh lỗi...)</span>} required>
                                                            <Input.TextArea placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải. Copy mã lỗi dán vào đây để giảng viên dễ hỗ trợ..." rows={6} size="large" />
                                                        </Form.Item>
                                                        <Form.Item className="mb-0 text-right">
                                                            <Button size="large" className="mr-3 font-bold" onClick={() => setIsAsking(false)}>Hủy</Button>
                                                            <Button type="primary" size="large" className="!bg-[#A435F0] border-none font-bold">Đăng câu hỏi</Button>
                                                        </Form.Item>
                                                    </Form>
                                                </div>
                                            ) : (
                                                // ==========================================
                                                // MÀN HÌNH DANH SÁCH CÂU HỎI
                                                // ==========================================
                                                <div className="animate-fade-in">
                                                    <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8">
                                                        <Input
                                                            size="large"
                                                            placeholder="Tìm kiếm câu hỏi trong bài học này..."
                                                            prefix={<SearchOutlined className="text-gray-400" />}
                                                            className="max-w-md rounded-md hover:!border-[#A435F0] focus:!border-[#A435F0]"
                                                        />
                                                        <Button
                                                            type="primary"
                                                            size="large"
                                                            className="!bg-[#A435F0] border-none font-bold w-full sm:w-auto"
                                                            onClick={() => setIsAsking(true)}
                                                        >
                                                            Đặt câu hỏi mới
                                                        </Button>
                                                    </div>

                                                    <div className="flex flex-col gap-6">
                                                        {qaList.map((qa) => (
                                                            <div key={qa.id} className="flex gap-4 pb-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 p-3 -mx-3 rounded-lg transition-colors cursor-pointer group">
                                                                <Avatar src={qa.user.avatar} size={48} className="flex-shrink-0" />
                                                                <div className="flex-1">
                                                                    <h4 className="text-base font-bold text-gray-900 group-hover:text-[#A435F0] transition-colors">{qa.title}</h4>
                                                                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">{qa.content}</p>

                                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs text-gray-500">
                                                                        <span className="font-bold text-[#A435F0]">{qa.user.name}</span>
                                                                        <span>•</span>
                                                                        <span>{qa.createdAt}</span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-1 font-medium text-gray-700">
                                                                            <MessageOutlined /> {qa.replies} câu trả lời
                                                                        </span>

                                                                        {/* Huy hiệu Giảng viên đã trả lời */}
                                                                        {qa.isInstructorReplied && (
                                                                            <>
                                                                                <span>•</span>
                                                                                <span className="text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                                                                                    <CheckCircleTwoTone twoToneColor="#1890ff" /> Giảng viên đã trả lời
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="text-center mt-8">
                                                        <Button className="font-bold border-gray-300 hover:!text-[#A435F0] hover:!border-[#A435F0]">Tải thêm câu hỏi</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                },
                                { key: "notes", label: <span className="font-bold text-base">Ghi chú</span>, children: <p className="pt-4 text-gray-500">Tính năng Ghi chú cá nhân sẽ được tích hợp sau.</p> },
                            ]}
                        />
                    </div>
                </main>

                {/* CỘT PHẢI: DANH SÁCH BÀI HỌC (Giữ nguyên) */}
                <aside className="w-full lg:w-[380px] bg-white border-l border-gray-200 flex flex-col flex-shrink-0 lg:h-full">
                    <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                        <h2 className="text-base font-bold text-gray-900 m-0">Nội dung khóa học</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <Collapse ghost defaultActiveKey={[1, 2]} expandIconPosition="end" className="learning-collapse">
                            {course.sections.map((section) => (
                                <Collapse.Panel key={section.id} header={<div className="font-bold text-gray-800">{section.title}</div>} className="border-b border-gray-200 !rounded-none">
                                    <div className="flex flex-col">
                                        {section.lessons.map((lesson) => {
                                            const isActive = activeLessonId === lesson.id;
                                            return (
                                                <div key={lesson.id} onClick={() => setActiveLessonId(lesson.id)} className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${isActive ? "bg-purple-50 hover:bg-purple-100" : "hover:bg-gray-100"}`}>
                                                    <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                                                        <Checkbox checked={lesson.isCompleted} className="custom-purple-checkbox" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`text-sm m-0 leading-tight ${isActive ? "font-bold text-gray-900" : "text-gray-700"}`}>{lesson.title}</h4>
                                                        <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                                                            {getLessonIcon(lesson.type, lesson.isCompleted)}
                                                            <span>{lesson.duration}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Collapse.Panel>
                            ))}
                        </Collapse>
                    </div>
                </aside>

            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
        
        .custom-purple-checkbox .ant-checkbox-checked .ant-checkbox-inner {
          background-color: #A435F0; border-color: #A435F0;
        }
        .learning-collapse .ant-collapse-item .ant-collapse-header {
          padding: 16px !important; background-color: #f7f9fa;
        }
        .learning-collapse .ant-collapse-item .ant-collapse-content-box {
          padding: 0 !important;
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
}