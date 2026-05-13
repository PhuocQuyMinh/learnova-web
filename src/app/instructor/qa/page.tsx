"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Button, Card, Input, Typography, Tag, Skeleton, Avatar,
    message, Tooltip, Modal, Form, Empty
} from "antd";
import {
    DeleteOutlined,
    UserOutlined,
    BookOutlined,
    SendOutlined,
    ExclamationCircleOutlined,
    ClockCircleOutlined,
    CheckOutlined,
    MessageOutlined,
    CheckCircleOutlined
} from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

export default function InstructorQAPage() {
    const { token } = useAuthStore();
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [replyingId, setReplyingId] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingQuestion, setDeletingQuestion] = useState<any>(null);
    const [deleteForm] = Form.useForm();

    const fetchQuestions = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/qa/instructor/unresolved", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok) {
                setQuestions(result.data.questions);
            }
        } catch (error) {
            message.error("Lỗi kết nối đến máy chủ");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token) return;
        fetchQuestions();
    }, [token]);

    const handleSendReply = async (questionId: number) => {
        if (!replyContent.trim()) return message.warning("Vui lòng nhập nội dung!");
        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/questions/${questionId}/answers`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ content: replyContent })
            });
            if (res.ok) {
                message.success("Đã gửi phản hồi!");
                setReplyingId(null);
                setReplyContent("");
            }
        } catch (error) { message.error("Lỗi mạng!"); }
        finally { setIsSubmitting(false); }
    };

    const handleResolve = async (questionId: number) => {
        try {
            const res = await fetch(`http://localhost:8000/api/qa/questions/${questionId}/resolve`, {
                method: "PATCH",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                message.success("Đã hoàn tất câu hỏi!");
                setQuestions(prev => prev.filter(q => q.id !== questionId));
            }
        } catch (error) { message.error("Lỗi mạng!"); }
    };

    const handleRequestDelete = async (values: any) => {
        setIsSubmitting(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/questions/${deletingQuestion.id}/delete-request`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason: values.reason })
            });
            if (res.ok) {
                message.success("Đã gửi yêu cầu xóa tới Kiểm duyệt viên!");
                setIsDeleteModalOpen(false);
                deleteForm.resetFields();
                setQuestions(prev => prev.filter(q => q.id !== deletingQuestion.id));
            } else {
                const err = await res.json();
                message.error(err.message || "Lỗi khi gửi yêu cầu xóa");
            }
        } catch (error) { message.error("Lỗi mạng khi yêu cầu xóa"); }
        finally { setIsSubmitting(false); }
    };

    if (isLoading) return (
        <div className="p-10 max-w-5xl mx-auto space-y-6">
            <Skeleton active avatar paragraph={{ rows: 3 }} className="bg-white p-8 rounded-2xl" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fb] pb-20 font-sans">
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <Title level={3} className="!m-0 !text-gray-900 font-extrabold tracking-tight">Hỏi đáp & Thảo luận</Title>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                            <Text className="text-gray-500 font-medium">Bạn đang có <span className="text-purple-600 font-bold">{questions.length}</span> thắc mắc cần giải đáp</Text>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10">
                {questions.length > 0 ? (
                    <div className="space-y-6">
                        {questions.map((question) => (
                            <Card
                                key={question.id}
                                className="rounded-[20px] border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                                bodyStyle={{ padding: '24px' }}
                            >
                                {/* HEADER: THÔNG TIN HỌC VIÊN */}
                                <div className="flex flex-wrap gap-4 items-center mb-5">
                                    <Avatar size={50} icon={<UserOutlined />} className="bg-purple-100 text-purple-600" />
                                    <div className="flex flex-col gap-1">
                                        <div className="font-bold text-gray-900 text-lg leading-none">
                                            {question.author?.fullName || "Học viên Leanova"}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <Tag color="default" className="m-0 rounded-full bg-gray-100 text-gray-500 border-none px-3 py-0.5 text-xs font-medium">
                                                <ClockCircleOutlined className="mr-1" />
                                                {new Date(question.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                            </Tag>
                                            <Tag icon={<BookOutlined />} className="m-0 rounded-full bg-purple-50 text-purple-600 border-purple-100 px-3 py-0.5 text-xs font-medium max-w-[300px] truncate">
                                                BÀI: {question.lesson?.title}
                                            </Tag>
                                        </div>
                                    </div>
                                </div>

                                {/* NỘI DUNG CÂU HỎI */}
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-5">
                                    <h4 className="font-extrabold text-gray-900 text-[18px] mb-2">
                                        {question.title}
                                    </h4>
                                    <Paragraph className="text-gray-700 !m-0 whitespace-pre-wrap leading-relaxed text-[15px]">
                                        {question.content}
                                    </Paragraph>
                                </div>

                                {/* ACTIONS & NÚT BẤM */}
                                {replyingId !== question.id ? (
                                    <div className="flex flex-wrap items-center gap-3">
                                        <Button
                                            size="large"
                                            type="primary"
                                            icon={<MessageOutlined />}
                                            className="!bg-learnova-purple hover:!bg-purple-700 border-none rounded-xl font-bold shadow-sm px-6"
                                            onClick={() => { setReplyingId(question.id); setReplyContent(""); }}
                                        >
                                            Phản hồi ngay
                                        </Button>

                                        <Button
                                            size="large"
                                            icon={<CheckOutlined />}
                                            className="rounded-xl font-bold text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-500 hover:!text-white hover:!border-emerald-500 transition-colors px-6"
                                            onClick={() => handleResolve(question.id)}
                                        >
                                            Đã giải quyết
                                        </Button>

                                        {/* Đẩy nút Xóa về góc phải bằng margin-left auto */}
                                        <div className="ml-auto flex items-center">
                                            <Tooltip title="Câu hỏi spam, thô tục?">
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    className="font-medium hover:bg-red-50 rounded-lg px-4"
                                                    onClick={() => {
                                                        setDeletingQuestion(question);
                                                        setIsDeleteModalOpen(true);
                                                    }}
                                                >
                                                    Xóa
                                                </Button>
                                            </Tooltip>
                                        </div>
                                    </div>
                                ) : (
                                    /* KHUNG NHẬP TRẢ LỜI */
                                    <div className="bg-white border-2 border-purple-200 rounded-2xl p-2 shadow-sm focus-within:ring-4 focus-within:ring-purple-50 transition-all">
                                        <Input.TextArea
                                            rows={5}
                                            placeholder="Viết hướng dẫn hoặc câu trả lời của bạn..."
                                            className="border-none shadow-none focus:ring-0 text-[15px] py-3 px-4 bg-transparent"
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            autoFocus
                                        />
                                        <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border-t border-slate-100 mt-2">
                                            <span className="text-xs text-gray-400 pl-2 hidden sm:block italic">Nhấn nút để gửi</span>
                                            <div className="flex gap-2 w-full sm:w-auto justify-end">
                                                <Button size="large" className="rounded-xl font-medium border-gray-300 text-gray-600" onClick={() => setReplyingId(null)}>Hủy bỏ</Button>
                                                <Button size="large" type="primary" icon={<SendOutlined />} loading={isSubmitting} className="!bg-learnova-purple border-none rounded-xl font-bold px-8 shadow-sm" onClick={() => handleSendReply(question.id)}>Gửi phản hồi</Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Empty className="py-24 bg-white rounded-[24px] shadow-sm border border-gray-200" description={<Text className="text-gray-500 text-lg">Hộp thư câu hỏi đang trống!</Text>} />
                )}
            </div>

            {/* MODAL YÊU CẦU XÓA */}
            <Modal
                title={
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                        <div className="bg-red-50 p-2.5 rounded-xl border border-red-100">
                            <ExclamationCircleOutlined className="text-red-500 text-2xl" />
                        </div>
                        <span className="text-xl font-bold text-gray-800">Yêu cầu xóa câu hỏi</span>
                    </div>
                }
                open={isDeleteModalOpen}
                onCancel={() => {
                    setIsDeleteModalOpen(false);
                    deleteForm.resetFields();
                }}
                footer={null}
                centered
                className="rounded-3xl overflow-hidden"
                width={600}
            >
                <div className="pt-5">
                    <div className="bg-orange-50/80 text-orange-800 p-4 rounded-xl border border-orange-200 mb-6 text-sm leading-relaxed">
                        <strong>Lưu ý:</strong> Yêu cầu của bạn sẽ được gửi đến đội ngũ Kiểm duyệt viên (Moderator). Câu hỏi sẽ bị xóa nếu vi phạm tiêu chuẩn cộng đồng (spam, từ ngữ thô tục, không liên quan...).
                    </div>

                    <Form form={deleteForm} layout="vertical" onFinish={handleRequestDelete}>
                        <Form.Item
                            name="reason"
                            label={<span className="font-bold text-gray-700 text-base">Lý do yêu cầu xóa <span className="text-red-500">*</span></span>}
                            rules={[{ required: true, message: 'Vui lòng cung cấp lý do!' }]}
                        >
                            <Input.TextArea
                                rows={4}
                                placeholder="Ví dụ: Câu hỏi chứa từ ngữ phản cảm, spam quảng cáo..."
                                className="bg-gray-50 focus:bg-white rounded-xl text-base p-4 border-gray-200 hover:border-purple-300 focus:border-learnova-purple transition-colors"
                            />
                        </Form.Item>

                        <div className="flex justify-end gap-3 mt-8">
                            <Button size="large" onClick={() => setIsDeleteModalOpen(false)} className="rounded-xl font-medium px-6">
                                Hủy bỏ
                            </Button>
                            <Button size="large" type="primary" danger htmlType="submit" loading={isSubmitting} className="rounded-xl px-8 font-bold shadow-sm hover:shadow-md">
                                Gửi yêu cầu
                            </Button>
                        </div>
                    </Form>
                </div>
            </Modal>
        </div>
    );
}