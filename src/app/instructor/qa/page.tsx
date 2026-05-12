"use client";

import { useState } from "react";
import { Avatar, Button, Input, Tag, Badge, Empty, Divider, Tooltip } from "antd";
import {
    SearchOutlined,
    SendOutlined,
    CheckCircleOutlined,
    FilterOutlined,
    MoreOutlined,
    PlayCircleOutlined,
    BookOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { TextArea } = Input;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_QA_LIST = [
    {
        id: 1,
        student: { name: "Nguyễn Văn A", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=A" },
        courseTitle: "Lập trình Node.js & Express RESTful API",
        lessonTitle: "Bài 201: Express.js là gì?",
        title: "Lỗi 'Cannot find module express' khi chạy npm start",
        content: "Giảng viên cho em hỏi, em đã chạy npm install nhưng khi start lại báo lỗi thiếu module express. Cụ thể mã lỗi là Error: Cannot find module 'express'. Em dùng Node v18 ạ.",
        createdAt: "2 giờ trước",
        status: "Unread", // Chưa đọc / Chưa trả lời
        thread: [] // Chưa có trao đổi nào
    },
    {
        id: 2,
        student: { name: "Trần Thị B", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=B" },
        courseTitle: "Master React.js & Next.js 14",
        lessonTitle: "Bài 45: Server Components",
        title: "Sự khác nhau giữa 'use client' và 'use server'?",
        content: "Em vẫn hơi lú phần này. Khi nào thì mình bắt buộc phải dùng 'use client' ạ? Nếu em dùng thư viện Ant Design thì có cần bọc nó lại không?",
        createdAt: "5 giờ trước",
        status: "Replied", // Đã trả lời
        thread: [
            {
                id: 101,
                sender: "instructor",
                name: "Trịnh Ạt Min",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin",
                content: "Chào B, em cứ nhớ đơn giản: Bất cứ khi nào Component của em cần tương tác với người dùng (onClick, onChange) hoặc dùng React Hooks (useState, useEffect) thì BẮT BUỘC phải có 'use client' ở đầu file nhé. Thư viện Ant Design đa số là client component nên em cứ bọc lại cho an toàn.",
                time: "4 giờ trước"
            },
            {
                id: 102,
                sender: "student",
                name: "Trần Thị B",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=B",
                content: "Dạ vâng, em hiểu rồi ạ. Em cảm ơn thầy!",
                time: "10 phút trước"
            }
        ]
    },
    {
        id: 3,
        student: { name: "Lê Hoàng C", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=C" },
        courseTitle: "Lập trình Node.js & Express RESTful API",
        lessonTitle: "Bài 302: Tạo Model và Migration",
        title: "Lỗi kết nối MySQL với Sequelize",
        content: "Em bị lỗi Access denied for user 'root'@'localhost' (using password: NO). Em kiểm tra kĩ file .env rồi mà vẫn bị ạ.",
        createdAt: "1 ngày trước",
        status: "Resolved", // Đã giải quyết xong
        thread: []
    }
];

export default function InstructorQAPage() {
    const [activeTab, setActiveTab] = useState("unread");
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(1); // Mặc định chọn câu đầu tiên
    const [replyText, setReplyText] = useState("");

    const filteredQA = MOCK_QA_LIST.filter(qa => {
        if (activeTab === "unread") return qa.status === "Unread";
        if (activeTab === "all") return true;
        return true;
    });

    const selectedQA = MOCK_QA_LIST.find(qa => qa.id === selectedQuestionId);

    return (
        <div className="flex flex-col bg-gray-50" style={{ height: "calc(100vh - 0px)" }}>
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 flex-shrink-0 z-10 shadow-sm">
                <h1 className="text-xl font-extrabold text-gray-900 m-0">Hỏi đáp của Học viên (Q&A)</h1>
                <div className="flex items-center gap-3">
                    <Button icon={<FilterOutlined />}>Lọc theo khóa học</Button>
                </div>
            </div>

            {/* KHUNG LÀM VIỆC CHIA ĐÔI MÀN HÌNH */}
            <div className="flex flex-1 overflow-hidden">

                {/* ========================================== */}
                {/* CỘT TRÁI: DANH SÁCH CÂU HỎI (Rộng 380px) */}
                {/* ========================================== */}
                <div className="w-full md:w-[380px] bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

                    {/* Box Tìm kiếm & Tabs */}
                    <div className="p-4 border-b border-gray-200">
                        <Input
                            prefix={<SearchOutlined className="text-gray-400" />}
                            placeholder="Tìm kiếm câu hỏi, tên học viên..."
                            className="mb-4 bg-gray-50"
                        />
                        <div className="flex gap-2">
                            <Badge count={MOCK_QA_LIST.filter(q => q.status === "Unread").length} offset={[5, 0]} size="small" color="#f5222d">
                                <Button
                                    type={activeTab === "unread" ? "primary" : "default"}
                                    className={activeTab === "unread" ? "!bg-gray-800 border-none" : "bg-gray-50"}
                                    onClick={() => setActiveTab("unread")}
                                    shape="round"
                                >
                                    Chưa trả lời
                                </Button>
                            </Badge>
                            <Button
                                type={activeTab === "all" ? "primary" : "default"}
                                className={activeTab === "all" ? "!bg-gray-800 border-none" : "bg-gray-50"}
                                onClick={() => setActiveTab("all")}
                                shape="round"
                            >
                                Tất cả
                            </Button>
                        </div>
                    </div>

                    {/* List Scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredQA.length === 0 ? (
                            <div className="p-10 text-center text-gray-500">
                                Tuyệt vời! Bạn không có câu hỏi nào bị tồn đọng.
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredQA.map(qa => {
                                    const isActive = selectedQuestionId === qa.id;
                                    return (
                                        <div
                                            key={qa.id}
                                            onClick={() => setSelectedQuestionId(qa.id)}
                                            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors relative ${isActive ? "bg-purple-50 border-l-4 border-l-[#A435F0]" : "hover:bg-gray-50 border-l-4 border-l-transparent"
                                                }`}
                                        >
                                            {/* Chấm đỏ báo Unread */}
                                            {qa.status === "Unread" && !isActive && (
                                                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                                            )}

                                            <div className="flex gap-3">
                                                <Avatar src={qa.student.avatar} size={40} className="flex-shrink-0 bg-gray-200" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-bold text-gray-900 text-sm truncate pr-4">{qa.student.name}</span>
                                                        <span className="text-xs text-gray-400 whitespace-nowrap">{qa.createdAt}</span>
                                                    </div>
                                                    <h4 className={`text-sm m-0 line-clamp-1 mb-1 ${qa.status === "Unread" ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                                                        {qa.title}
                                                    </h4>
                                                    <p className="text-xs text-gray-500 line-clamp-1 m-0">{qa.courseTitle}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================== */}
                {/* CỘT PHẢI: CHI TIẾT & TRẢ LỜI CÂU HỎI */}
                {/* ========================================== */}
                <div className="flex-1 bg-[#f9fafb] flex flex-col min-w-0 hidden md:flex">
                    {!selectedQA ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Empty description={<span className="text-gray-400">Chọn một câu hỏi bên trái để bắt đầu hỗ trợ học viên</span>} />
                        </div>
                    ) : (
                        <>
                            {/* Header của Câu hỏi */}
                            <div className="bg-white px-8 py-6 border-b border-gray-200 flex-shrink-0 shadow-sm z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-bold text-gray-900 m-0 leading-tight pr-8">
                                        {selectedQA.title}
                                    </h2>
                                    <div className="flex gap-2">
                                        <Tooltip title="Đánh dấu là đã giải quyết">
                                            <Button icon={<CheckCircleOutlined />} className="text-green-600 border-green-200 hover:!border-green-500 hover:!text-green-700 bg-green-50" />
                                        </Tooltip>
                                        <Button icon={<MoreOutlined />} />
                                    </div>
                                </div>

                                {/* Context (Hỏi ở bài nào, khóa nào) */}
                                <div className="flex flex-wrap gap-2 text-xs font-medium">
                                    <Tag icon={<BookOutlined />} color="purple" className="border-none rounded-md px-2 py-1">
                                        {selectedQA.courseTitle}
                                    </Tag>
                                    <Tag icon={<PlayCircleOutlined />} className="bg-gray-100 text-gray-600 border-none rounded-md px-2 py-1">
                                        {selectedQA.lessonTitle}
                                    </Tag>
                                </div>
                            </div>

                            {/* Box Chat Scrollable */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-8">

                                    {/* Câu hỏi gốc của Học viên */}
                                    <div className="flex gap-4">
                                        <Avatar src={selectedQA.student.avatar} size={48} className="flex-shrink-0 shadow-sm" />
                                        <div className="flex-1 bg-white p-5 rounded-2xl rounded-tl-sm border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-end mb-2">
                                                <span className="font-bold text-gray-900">{selectedQA.student.name}</span>
                                                <span className="text-xs text-gray-400">{selectedQA.createdAt}</span>
                                            </div>
                                            <p className="text-gray-700 m-0 whitespace-pre-wrap leading-relaxed text-[15px]">
                                                {selectedQA.content}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Lịch sử trao đổi (Thread) */}
                                    {selectedQA.thread.map(msg => (
                                        <div key={msg.id} className={`flex gap-4 ${msg.sender === 'instructor' ? 'flex-row-reverse' : ''}`}>
                                            <Avatar src={msg.avatar} size={40} className="flex-shrink-0 shadow-sm" />
                                            <div className={`flex-1 p-4 rounded-2xl shadow-sm ${msg.sender === 'instructor'
                                                    ? 'bg-[#f4ebff] border border-purple-100 rounded-tr-sm ml-12'
                                                    : 'bg-white border border-gray-100 rounded-tl-sm mr-12'
                                                }`}>
                                                <div className={`flex justify-between items-end mb-1 ${msg.sender === 'instructor' ? 'flex-row-reverse' : ''}`}>
                                                    <span className="font-bold text-gray-900 text-sm">
                                                        {msg.sender === 'instructor' ? 'Bạn' : msg.name}
                                                    </span>
                                                    <span className="text-xs text-gray-400">{msg.time}</span>
                                                </div>
                                                <p className="text-gray-700 m-0 whitespace-pre-wrap text-[14px]">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Dòng báo Đã giải quyết nếu status = Resolved */}
                                    {selectedQA.status === "Resolved" && (
                                        <Divider className="text-green-600 text-sm border-green-200">
                                            <CheckCircleOutlined className="mr-1" /> Vấn đề này đã được giải quyết
                                        </Divider>
                                    )}
                                </div>
                            </div>

                            {/* Vùng Nhập liệu (Reply Box) */}
                            <div className="bg-white p-6 border-t border-gray-200 flex-shrink-0">
                                <div className="max-w-3xl mx-auto flex gap-4 items-start">
                                    <Avatar src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" size={40} className="flex-shrink-0 hidden sm:block" />
                                    <div className="flex-1 flex flex-col gap-3">
                                        <TextArea
                                            rows={3}
                                            placeholder="Viết câu trả lời của bạn để hỗ trợ học viên..."
                                            className="rounded-xl resize-none text-[15px] p-3 focus:border-[#A435F0] hover:border-[#A435F0]"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                        />
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-gray-400">Bạn có thể dán mã nguồn trực tiếp vào đây.</span>
                                            <Button
                                                type="primary"
                                                icon={<SendOutlined />}
                                                className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold px-6 rounded-lg"
                                                disabled={!replyText.trim()}
                                            >
                                                Gửi phản hồi
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}} />
        </div>
    );
}