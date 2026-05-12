"use client";

import { useState } from "react";
import { Avatar, Button, Select, Rate, Input, Tag, Divider, Tooltip, Empty } from "antd";
import {
    SearchOutlined,
    MessageOutlined,
    FlagOutlined,
    CheckCircleFilled,
    SendOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { TextArea } = Input;

// ==========================================
// DỮ LIỆU TĨNH (Mock Data)
// ==========================================
const MOCK_REVIEWS = [
    {
        id: 1,
        student: { name: "Trần Thế Anh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TheAnh" },
        courseTitle: "Lập trình Node.js & Express RESTful API",
        rating: 5,
        content: "Khóa học cực kỳ chất lượng. Giảng viên giải thích phần Sequelize ORM rất dễ hiểu, không bị buồn ngủ như các khóa khác. Đã áp dụng được ngay vào project thực tế ở công ty!",
        createdAt: "Hôm qua",
        instructorReply: null, // Chưa phản hồi
    },
    {
        id: 2,
        student: { name: "Lê Thị Bích", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bich" },
        courseTitle: "Master React.js & Next.js 14",
        rating: 2,
        content: "Nội dung khá hay nhưng âm thanh ở chương 3 bị rè quá, nghe đau hết cả tai. Mong giảng viên thu âm lại phần này.",
        createdAt: "3 ngày trước",
        instructorReply: {
            content: "Chào Bích, mình rất xin lỗi vì trải nghiệm không tốt này. Mình đã kiểm tra lại và đang tiến hành thu âm lại toàn bộ Chương 3 với mic chống ồn mới. Video sẽ được cập nhật trong tuần tới nhé. Cảm ơn bạn đã góp ý!",
            repliedAt: "2 ngày trước"
        },
    },
    {
        id: 3,
        student: { name: "Hoàng Minh", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Minh" },
        courseTitle: "Lập trình Node.js & Express RESTful API",
        rating: 4,
        content: "Khóa học tốt, nhưng giá như có thêm phần hướng dẫn deploy lên AWS hoặc VPS thì sẽ trọn vẹn 5 sao.",
        createdAt: "1 tuần trước",
        instructorReply: null,
    }
];

export default function InstructorReviewsPage() {
    const [filterRating, setFilterRating] = useState("all");
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState("");

    // Hàm mô phỏng việc gửi phản hồi
    const handleSendReply = (reviewId: number) => {
        // Ở đây sau này sẽ gọi API
        console.log(`Gửi phản hồi cho review ${reviewId}:`, replyText);
        setReplyingTo(null);
        setReplyText("");
    };

    // Lọc đánh giá theo số sao
    const filteredReviews = MOCK_REVIEWS.filter(review => {
        if (filterRating === "all") return true;
        return review.rating === parseInt(filterRating);
    });

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col pb-12">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <h1 className="text-2xl font-extrabold text-gray-900 m-0">Đánh giá của Học viên</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

                {/* BỘ LỌC (FILTERS) */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex w-full sm:w-auto gap-4">
                        <Select defaultValue="all" className="w-full sm:w-48" size="large">
                            <Select.Option value="all">Tất cả khóa học</Select.Option>
                            <Select.Option value="101">Node.js & Express</Select.Option>
                            <Select.Option value="102">React.js & Next.js</Select.Option>
                        </Select>

                        <Select
                            value={filterRating}
                            onChange={setFilterRating}
                            className="w-full sm:w-40"
                            size="large"
                        >
                            <Select.Option value="all">Tất cả số sao</Select.Option>
                            <Select.Option value="5">5 Sao (Tuyệt vời)</Select.Option>
                            <Select.Option value="4">4 Sao (Tốt)</Select.Option>
                            <Select.Option value="3">3 Sao (Khá)</Select.Option>
                            <Select.Option value="2">2 Sao (Tệ)</Select.Option>
                            <Select.Option value="1">1 Sao (Rất tệ)</Select.Option>
                        </Select>
                    </div>

                    <Input
                        placeholder="Tìm kiếm trong đánh giá..."
                        prefix={<SearchOutlined className="text-gray-400" />}
                        size="large"
                        className="w-full sm:max-w-xs"
                    />
                </div>

                {/* DANH SÁCH ĐÁNH GIÁ */}
                {filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-16 flex justify-center items-center">
                        <Empty description={<span className="text-gray-500">Không tìm thấy đánh giá nào phù hợp với bộ lọc.</span>} />
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {filteredReviews.map((review) => (
                            <div key={review.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 transition-all hover:shadow-md">

                                {/* Thông tin người dùng & Số sao */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-4">
                                        <Avatar src={review.student.avatar} size={48} className="bg-gray-100 border border-gray-200" />
                                        <div>
                                            <h3 className="font-bold text-gray-900 m-0">{review.student.name}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Rate disabled defaultValue={review.rating} className="text-sm text-[#b4690e]" />
                                                <span className="text-xs text-gray-400">• {review.createdAt}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Tag className="bg-gray-50 text-gray-600 border-gray-200 m-0 hidden sm:block">
                                        {review.courseTitle}
                                    </Tag>
                                </div>

                                {/* Nội dung đánh giá */}
                                <p className="text-gray-700 text-[15px] leading-relaxed mb-4">
                                    {review.content}
                                </p>

                                {/* Nút Hành động */}
                                {!review.instructorReply && replyingTo !== review.id && (
                                    <div className="flex gap-4 mt-4">
                                        <Button
                                            type="text"
                                            icon={<MessageOutlined />}
                                            className="font-medium text-[#A435F0] hover:bg-purple-50"
                                            onClick={() => {
                                                setReplyingTo(review.id);
                                                setReplyText("");
                                            }}
                                        >
                                            Phản hồi
                                        </Button>
                                        <Tooltip title="Báo cáo đánh giá rác, chửi bậy">
                                            <Button type="text" icon={<FlagOutlined />} className="text-gray-400 hover:text-red-500" />
                                        </Tooltip>
                                    </div>
                                )}

                                {/* Khung nhập phản hồi (Hiện lên khi bấm "Phản hồi") */}
                                {replyingTo === review.id && (
                                    <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200 animate-fade-in">
                                        <p className="text-sm font-bold text-gray-800 mb-2">Phản hồi của bạn (Công khai)</p>
                                        <TextArea
                                            rows={3}
                                            placeholder="Viết lời cảm ơn hoặc giải đáp thắc mắc của học viên..."
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            className="mb-3 focus:border-[#A435F0] hover:border-[#A435F0]"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <Button onClick={() => setReplyingTo(null)}>Hủy</Button>
                                            <Button
                                                type="primary"
                                                icon={<SendOutlined />}
                                                className="!bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold"
                                                disabled={!replyText.trim()}
                                                onClick={() => handleSendReply(review.id)}
                                            >
                                                Đăng phản hồi
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {/* Nội dung phản hồi của giảng viên (Nếu đã phản hồi) */}
                                {review.instructorReply && (
                                    <div className="mt-4 bg-[#f4ebff] p-5 rounded-lg border border-purple-100">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="font-bold text-[#A435F0] flex items-center gap-1">
                                                <CheckCircleFilled /> Phản hồi của bạn
                                            </span>
                                            <span className="text-xs text-purple-400">{review.instructorReply.repliedAt}</span>
                                        </div>
                                        <p className="text-gray-800 m-0 text-[14px]">
                                            {review.instructorReply.content}
                                        </p>
                                        <div className="mt-3">
                                            <Button type="link" size="small" className="text-[#A435F0] p-0 font-medium h-auto">Chỉnh sửa</Button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .animate-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
        </div>
    );
}