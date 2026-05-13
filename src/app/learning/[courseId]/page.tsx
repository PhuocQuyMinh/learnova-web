"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Collapse, Skeleton, Button, Tabs, message, Progress, Space, Typography,
    Input, Avatar, Tag, Divider, Empty, Card
} from "antd";
import {
    PlayCircleOutlined,
    LeftOutlined,
    CheckCircleFilled,
    CheckCircleOutlined,
    FilePdfOutlined,
    QuestionCircleOutlined,
    FileTextOutlined,
    MessageOutlined,
    CheckOutlined,
    SendOutlined,
    UserOutlined,
    ClockCircleOutlined,
    BookOutlined,
    EditOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

export default function EnrolledLearningPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { token, user } = useAuthStore();

    const [courseData, setCourseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [overallProgress, setOverallProgress] = useState(0);

    // ==========================================
    // STATE Q&A
    // ==========================================
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoadingQA, setIsLoadingQA] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [isAsking, setIsAsking] = useState(false);
    const [newQuestionTitle, setNewQuestionTitle] = useState("");
    const [newQuestionContent, setNewQuestionContent] = useState("");
    const [replyContent, setReplyContent] = useState("");
    const [isSubmittingQA, setIsSubmittingQA] = useState(false);

    const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
    const [editQuestionTitle, setEditQuestionTitle] = useState("");
    const [editQuestionContent, setEditQuestionContent] = useState("");

    const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
    const [editAnswerContent, setEditAnswerContent] = useState("");

    // ==========================================
    // STATE QUIZ
    // ==========================================
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [quizResult, setQuizResult] = useState<any>(null);
    const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

    // HELPER
    const getInitials = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(" ");
        if (words.length > 1) return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        return words[0][0].toUpperCase();
    };

    // FETCH COURSE
    useEffect(() => {
        if (!token) return; // Fix lỗi F5

        const fetchLearningData = async () => {
            try {
                const res = await fetch(`http://localhost:8000/api/store/courses/${courseId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok) {
                    setCourseData(data.data);
                    setOverallProgress(data.data.overallProgressPercent);
                    if (data.data.focusLessonId) {
                        setActiveLessonId(data.data.focusLessonId);
                    } else if (data.data.sections?.[0]?.lessons?.[0]) {
                        setActiveLessonId(data.data.sections[0].lessons[0].id);
                    }
                } else {
                    message.error(data.message || "Không thể tải khóa học");
                    router.push("/my-learning");
                }
            } catch (error) {
                message.error("Lỗi kết nối máy chủ");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLearningData();
    }, [courseId, token, router]);

    // FETCH Q&A KHI CHUYỂN BÀI HỌC
    useEffect(() => {
        const fetchQuestions = async () => {
            if (!activeLessonId || !token) return;
            setIsLoadingQA(true);
            try {
                const res = await fetch(`http://localhost:8000/api/qa/lessons/${activeLessonId}/questions`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();
                if (res.ok) {
                    setQuestions(data.data.questions);
                    if (selectedQuestion) {
                        const updatedQ = data.data.questions.find((q: any) => q.id === selectedQuestion.id);
                        if (updatedQ) setSelectedQuestion(updatedQ);
                    }
                }
            } catch (error) {
                console.error("Lỗi tải câu hỏi:", error);
            } finally {
                setIsLoadingQA(false);
            }
        };

        setSelectedQuestion(null);
        setIsAsking(false);
        setEditingQuestionId(null);
        setEditingAnswerId(null);
        setQuizResult(null); // Reset kết quả quiz khi đổi bài
        setUserAnswers({});
        fetchQuestions();
    }, [activeLessonId, token]);

    const refetchQA = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/qa/lessons/${activeLessonId}/questions`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setQuestions(data.data.questions);
                if (selectedQuestion) {
                    const updatedQ = data.data.questions.find((q: any) => q.id === selectedQuestion.id);
                    if (updatedQ) setSelectedQuestion(updatedQ);
                }
            }
        } catch (error) { }
    };

    // Q&A ACTIONS
    const handleAskQuestion = async () => {
        if (!newQuestionTitle.trim() || !newQuestionContent.trim()) return message.warning("Vui lòng nhập đủ Tiêu đề và Nội dung!");
        setIsSubmittingQA(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/lessons/${activeLessonId}/questions`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ title: newQuestionTitle, content: newQuestionContent })
            });
            if (res.ok) {
                message.success("Đã gửi câu hỏi thành công!");
                setNewQuestionTitle("");
                setNewQuestionContent("");
                setIsAsking(false);
                await refetchQA();
            } else message.error((await res.json()).message);
        } catch (e) { message.error("Lỗi mạng!"); } finally { setIsSubmittingQA(false); }
    };

    const handleUpdateQuestion = async () => {
        if (!editQuestionTitle.trim() || !editQuestionContent.trim()) return message.warning("Không được để trống!");
        setIsSubmittingQA(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/questions/${editingQuestionId}`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ title: editQuestionTitle, content: editQuestionContent })
            });
            if (res.ok) {
                message.success("Đã cập nhật câu hỏi!");
                setEditingQuestionId(null);
                await refetchQA();
            } else message.error((await res.json()).message);
        } catch (e) { message.error("Lỗi mạng!"); } finally { setIsSubmittingQA(false); }
    };

    const handleReplyQuestion = async () => {
        if (!replyContent.trim() || !selectedQuestion) return;
        setIsSubmittingQA(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/questions/${selectedQuestion.id}/answers`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ content: replyContent })
            });
            if (res.ok) {
                message.success("Đã gửi câu trả lời!");
                setReplyContent("");
                await refetchQA();
            }
        } catch (e) { message.error("Lỗi mạng!"); } finally { setIsSubmittingQA(false); }
    };

    const handleUpdateAnswer = async () => {
        if (!editAnswerContent.trim()) return message.warning("Không được để trống!");
        setIsSubmittingQA(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/answers/${editingAnswerId}`, {
                method: 'PUT',
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ content: editAnswerContent })
            });
            if (res.ok) {
                message.success("Đã cập nhật câu trả lời!");
                setEditingAnswerId(null);
                await refetchQA();
            } else message.error((await res.json()).message);
        } catch (e) { message.error("Lỗi mạng!"); } finally { setIsSubmittingQA(false); }
    };

    const handleResolveQuestion = async () => {
        if (!selectedQuestion) return;
        setIsSubmittingQA(true);
        try {
            const res = await fetch(`http://localhost:8000/api/qa/questions/${selectedQuestion.id}/resolve`, {
                method: 'PATCH',
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                message.success("Đã đánh dấu giải quyết xong!");
                await refetchQA();
            }
        } catch (e) { } finally { setIsSubmittingQA(false); }
    };

    // LOGIC ĐIỀU HƯỚNG BÀI HỌC
    const allLessons = useMemo(() => {
        if (!courseData) return [];
        return courseData.sections.flatMap((section: any) => section.lessons);
    }, [courseData]);

    const activeLesson = useMemo(() => {
        return allLessons.find((l: any) => l.id === activeLessonId);
    }, [allLessons, activeLessonId]);

    const handleToggleComplete = async () => {
        if (!activeLessonId || !token) return;
        try {
            const res = await fetch(`http://localhost:8000/api/store/my-learning/${courseId}/lessons/${activeLessonId}/complete`, {
                method: "PUT", headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setOverallProgress(data.data.progressPercent);
                let isNewlyCompleted = false;
                setCourseData((prev: any) => {
                    const newSections = prev.sections.map((section: any) => ({
                        ...section,
                        lessons: section.lessons.map((lesson: any) => {
                            if (lesson.id === activeLessonId) {
                                isNewlyCompleted = !lesson.isCompleted;
                                return { ...lesson, isCompleted: isNewlyCompleted };
                            }
                            return lesson;
                        })
                    }));
                    return { ...prev, sections: newSections };
                });
                if (isNewlyCompleted) {
                    setTimeout(() => {
                        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
                        let nextTargetLesson = allLessons.slice(currentIndex + 1).find((l: any) => !l.isCompleted);
                        if (!nextTargetLesson) nextTargetLesson = allLessons.find((l: any) => !l.isCompleted && l.id !== activeLessonId);
                        if (nextTargetLesson) setActiveLessonId(nextTargetLesson.id);
                        else message.success("Tuyệt vời! Bạn đã hoàn thành toàn bộ khóa học này 🎉", 5);
                    }, 500);
                }
            } else message.error(data.message);
        } catch (error) { message.error("Lỗi cập nhật tiến độ"); }
    };

    // ==========================================
    // FIX LOGIC CHẤM ĐIỂM (FRONTEND GRADING)
    // ==========================================
    const handleSubmitQuiz = async (quizId: number) => {
        if (!token || !activeLesson?.quizzes?.[0]) return;
        setIsSubmittingQuiz(true);

        try {
            const quiz = activeLesson.quizzes[0];
            let correctCount = 0;
            const totalQuestions = quiz.questions?.length || 0;

            // 1. TỰ CHẤM ĐIỂM TẠI FRONTEND (Tránh phụ thuộc vào backend bị thiếu ID)
            quiz.questions.forEach((q: any) => {
                const choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
                const userAnswerKey = userAnswers[q.id];

                // Tìm ra đáp án user đã chọn
                const selectedChoice = choices?.find((c: any, cIdx: number) => {
                    const key = c.id !== undefined ? c.id : cIdx;
                    return key === userAnswerKey;
                });

                // Nếu đúng -> Cộng điểm
                if (selectedChoice && selectedChoice.isCorrect === true) {
                    correctCount++;
                }
            });

            // 2. TÍNH TOÁN KẾT QUẢ ĐẦU RA
            const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
            const isPassed = scorePercent >= (quiz.passingScorePercent || 0);

            // Gán thẳng vào UI
            setQuizResult({
                isPassed,
                scorePercent,
                correctCount,
                totalQuestions
            });

            // 3. GỬI LỊCH SỬ LÊN BACKEND (Cứ gửi để backend lưu, nếu backend có lỗi thì giao diện vẫn báo đúng)
            const formattedAnswers = Object.keys(userAnswers).map(qId => ({
                questionId: parseInt(qId),
                selectedChoiceId: userAnswers[parseInt(qId)]
            }));

            try {
                await fetch(`http://localhost:8000/api/store/my-learning/quizzes/${quizId}/submit`, {
                    method: "POST",
                    headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                    body: JSON.stringify({ answers: formattedAnswers })
                });
            } catch (err) {
                console.log("Ignored backend sync error");
            }

            // 4. KIỂM TRA ĐẠT THÌ ĐÁNH DẤU HOÀN THÀNH BÀI HỌC
            if (isPassed && !activeLesson.isCompleted) {
                handleToggleComplete();
            }

        } catch (error) {
            message.error("Lỗi khi nộp bài");
        } finally {
            setIsSubmittingQuiz(false);
        }
    };

    const handleNextPrev = (direction: "next" | "prev") => {
        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
        if (direction === "next" && currentIndex < allLessons.length - 1) setActiveLessonId(allLessons[currentIndex + 1].id);
        else if (direction === "prev" && currentIndex > 0) setActiveLessonId(allLessons[currentIndex - 1].id);
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            message.loading({ content: `Đang chuẩn bị tải: ${fileName}...`, key: 'downloading' });
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network error");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl; link.download = fileName;
            document.body.appendChild(link); link.click(); link.remove(); window.URL.revokeObjectURL(blobUrl);
            message.success({ content: 'Đã tải xong!', key: 'downloading', duration: 2 });
        } catch (error) { message.destroy('downloading'); window.open(url, "_blank"); }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Skeleton active className="max-w-3xl" /></div>;
    if (!courseData || !activeLesson) return <div className="text-center py-20"><Title level={3}>Không tìm thấy bài học.</Title></div>;

    const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

    // ==========================================
    // TABS UI CONFIGURATION
    // ==========================================
    const tabItems = [
        {
            key: '1',
            label: <span className="font-bold text-base px-4">Tổng quan</span>,
            children: (
                <div className="py-4 text-gray-700 max-w-4xl">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Về bài học này</h3>
                    <p className="text-base">Đây là bài học nằm trong khóa <strong>{courseData.title}</strong>.</p>
                    <p className="text-base">Giảng viên: <strong className="text-learnova-purple">{courseData.instructor?.fullName}</strong></p>

                    <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                        <Button size="large" icon={<LeftOutlined />} onClick={() => handleNextPrev("prev")} disabled={currentIndex === 0}>
                            Bài trước
                        </Button>
                        <Button size="large" type="primary" className="!bg-gray-800 border-none font-bold hover:!bg-black transition-all" onClick={() => handleNextPrev("next")} disabled={currentIndex === allLessons.length - 1}>
                            Bài tiếp theo
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: <span className="font-bold text-base px-4">Hỏi đáp ({questions.length})</span>,
            children: (
                <div className="py-8 max-w-4xl mx-auto animate-fade-in">
                    {/* TRƯỜNG HỢP 1: ĐẶT CÂU HỎI MỚI */}
                    {isAsking ? (
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
                            <h3 className="font-bold text-2xl mb-6 text-gray-900">Thêm câu hỏi mới</h3>
                            <div className="mb-5">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tiêu đề câu hỏi</label>
                                <Input
                                    placeholder="Ví dụ: Lỗi không import được Express..."
                                    value={newQuestionTitle}
                                    onChange={e => setNewQuestionTitle(e.target.value)}
                                    className="font-medium bg-gray-50 focus:bg-white transition-colors"
                                    size="large"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả chi tiết</label>
                                <Input.TextArea
                                    placeholder="Cung cấp thêm ngữ cảnh hoặc mã lỗi bạn đang gặp phải..."
                                    rows={6}
                                    value={newQuestionContent}
                                    onChange={e => setNewQuestionContent(e.target.value)}
                                    className="bg-gray-50 focus:bg-white transition-colors text-base"
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button size="large" className="font-bold" onClick={() => setIsAsking(false)}>Hủy bỏ</Button>
                                <Button size="large" type="primary" className="!bg-learnova-purple font-bold border-none" onClick={handleAskQuestion} loading={isSubmittingQA}>
                                    Đăng câu hỏi
                                </Button>
                            </div>
                        </div>

                        // TRƯỜNG HỢP 2: CHI TIẾT CÂU HỎI & CÂU TRẢ LỜI
                    ) : selectedQuestion ? (
                        <div className="bg-white">
                            <Button type="text" icon={<LeftOutlined />} onClick={() => {
                                setSelectedQuestion(null);
                                setEditingQuestionId(null);
                                setEditingAnswerId(null);
                            }} className="mb-6 px-0 text-gray-500 hover:text-learnova-purple font-bold">
                                Tất cả câu hỏi
                            </Button>

                            {/* --- KHUNG CÂU HỎI GỐC --- */}
                            <div className="flex gap-5 mb-10">
                                <Avatar size={54} src={selectedQuestion.author?.avatarUrl} className="bg-gray-800 flex-shrink-0 text-lg font-bold">
                                    {getInitials(selectedQuestion.author?.fullName)}
                                </Avatar>
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start gap-4 mb-1">
                                        {/* Tiêu đề hoặc Form Edit Tiêu đề */}
                                        {editingQuestionId === selectedQuestion.id ? (
                                            <Input
                                                value={editQuestionTitle}
                                                onChange={e => setEditQuestionTitle(e.target.value)}
                                                className="mb-3 font-bold text-xl w-full"
                                            />
                                        ) : (
                                            <h3 className="font-bold text-2xl m-0 text-gray-900 leading-tight pr-4">
                                                {selectedQuestion.title}
                                            </h3>
                                        )}

                                        {/* Nút hành động */}
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {selectedQuestion.userId === user?.id && !selectedQuestion.isResolved && editingQuestionId !== selectedQuestion.id && (
                                                <Button size="small" type="text" icon={<EditOutlined />} onClick={() => {
                                                    setEditingQuestionId(selectedQuestion.id);
                                                    setEditQuestionTitle(selectedQuestion.title);
                                                    setEditQuestionContent(selectedQuestion.content);
                                                }} className="text-gray-400 hover:text-learnova-purple transition-colors" title="Sửa bài" />
                                            )}
                                            {selectedQuestion.userId === user?.id && !selectedQuestion.isResolved && (
                                                <Button size="small" className="border-green-500 text-green-600 font-bold hover:!bg-green-50" icon={<CheckOutlined />} onClick={handleResolveQuestion} loading={isSubmittingQA}>
                                                    Đã giải quyết
                                                </Button>
                                            )}
                                            {selectedQuestion.isResolved && <Tag color="green" className="border-none m-0 px-3 py-1 font-bold rounded-full">Đã giải quyết</Tag>}
                                        </div>
                                    </div>

                                    {/* Meta info */}
                                    <div className="text-sm text-gray-500 mb-5 flex items-center gap-2">
                                        <span className="font-bold text-learnova-purple">{selectedQuestion.author?.fullName}</span>
                                        <span>•</span>
                                        <span>{new Date(selectedQuestion.createdAt).toLocaleDateString("vi-VN", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        {selectedQuestion.createdAt !== selectedQuestion.updatedAt && <span className="italic text-gray-400">(Đã sửa)</span>}
                                    </div>

                                    {/* Nội dung hoặc Form Edit Nội dung */}
                                    {editingQuestionId === selectedQuestion.id ? (
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                            <Input.TextArea
                                                value={editQuestionContent}
                                                onChange={e => setEditQuestionContent(e.target.value)}
                                                rows={5}
                                                className="mb-4 text-base"
                                            />
                                            <div className="flex gap-2 justify-end">
                                                <Button onClick={() => setEditingQuestionId(null)} className="font-bold">Hủy</Button>
                                                <Button type="primary" className="!bg-learnova-purple font-bold border-none" onClick={handleUpdateQuestion} loading={isSubmittingQA}>Lưu thay đổi</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-gray-800 text-[15px] whitespace-pre-wrap leading-relaxed">
                                            {selectedQuestion.content}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Divider className="border-gray-100" />

                            <h4 className="font-bold text-xl mb-8 text-gray-900">
                                {selectedQuestion.answers?.length || 0} Phản hồi
                            </h4>

                            {/* --- DANH SÁCH CÂU TRẢ LỜI --- */}
                            <div className="space-y-8 mb-12 pl-2 md:pl-10">
                                {selectedQuestion.answers?.map((ans: any) => (
                                    <div key={ans.id} className="flex gap-4">
                                        <Avatar size={42} src={ans.author?.avatarUrl} className="bg-gray-300 flex-shrink-0 font-bold text-gray-700">
                                            {getInitials(ans.author?.fullName)}
                                        </Avatar>
                                        <div className="flex-1 w-full">
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-[15px] text-gray-900">
                                                        {ans.author?.fullName}
                                                    </span>
                                                    {ans.isInstructorResponse && (
                                                        <Tag color="#A435F0" className="border-none font-bold rounded-sm px-2 text-[10px]">GIẢNG VIÊN</Tag>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(ans.createdAt).toLocaleDateString("vi-VN")}
                                                        {ans.createdAt !== ans.updatedAt && <span className="ml-1 italic">(đã sửa)</span>}
                                                    </span>
                                                    {ans.userId === user?.id && editingAnswerId !== ans.id && !selectedQuestion.isResolved && (
                                                        <Button size="small" type="text" icon={<EditOutlined />} onClick={() => {
                                                            setEditingAnswerId(ans.id);
                                                            setEditAnswerContent(ans.content);
                                                        }} className="text-gray-400 hover:text-learnova-purple px-1" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Form Edit Answer */}
                                            {editingAnswerId === ans.id ? (
                                                <div className="mt-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                    <Input.TextArea
                                                        value={editAnswerContent}
                                                        onChange={e => setEditAnswerContent(e.target.value)}
                                                        rows={4}
                                                        className="mb-3 text-base"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="small" className="font-bold" onClick={() => setEditingAnswerId(null)}>Hủy</Button>
                                                        <Button size="small" type="primary" className="!bg-learnova-purple font-bold border-none" onClick={handleUpdateAnswer} loading={isSubmittingQA}>Lưu cập nhật</Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className={`text-gray-800 text-[15px] whitespace-pre-wrap leading-relaxed mt-2 p-4 rounded-xl ${ans.isInstructorResponse ? 'bg-[#f4ebf9] border border-[#e6d0f0]' : 'bg-gray-50 border border-gray-100'}`}>
                                                    {ans.content}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* --- Ô NHẬP CÂU TRẢ LỜI MỚI --- */}
                            {selectedQuestion.isResolved ? (
                                <div className="pl-2 md:pl-10 text-center py-6 bg-green-50/50 text-green-700 rounded-xl border border-green-100 font-medium text-base">
                                    <CheckCircleFilled className="mr-2 text-xl" /> Câu hỏi này đã được giải quyết.
                                </div>
                            ) : (
                                <div className="flex gap-4 pl-2 md:pl-10">
                                    <Avatar size={42} src={user?.avatarUrl} className="bg-learnova-dark flex-shrink-0 font-bold text-white">
                                        {getInitials(user?.fullName || "")}
                                    </Avatar>
                                    <div className="flex-1 w-full bg-white border border-gray-300 rounded-xl overflow-hidden focus-within:border-learnova-purple focus-within:shadow-sm transition-all">
                                        <Input.TextArea
                                            placeholder="Bạn có câu trả lời hoặc gợi ý nào không? Hãy nhập vào đây..."
                                            rows={3}
                                            value={replyContent}
                                            onChange={e => setReplyContent(e.target.value)}
                                            className="border-none shadow-none resize-y text-base p-4 focus:ring-0"
                                        />
                                        <div className="bg-gray-50 px-4 py-3 flex justify-end border-t border-gray-100">
                                            <Button type="primary" className="!bg-learnova-purple font-bold border-none px-6" onClick={handleReplyQuestion} loading={isSubmittingQA} disabled={!replyContent.trim()}>
                                                Gửi phản hồi
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        // TRƯỜNG HỢP 3: DANH SÁCH TẤT CẢ CÂU HỎI
                    ) : (
                        <div>
                            <div className="flex justify-between items-center mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <Input
                                    placeholder="Tìm kiếm trong phần Hỏi đáp..."
                                    className="max-w-md bg-white text-base py-2"
                                    prefix={<MessageOutlined className="text-gray-400 mr-2" />}
                                    disabled={questions.length === 0}
                                />
                                <Button type="primary" size="large" className="!bg-gray-900 border-none hover:!bg-black font-bold px-6" onClick={() => setIsAsking(true)}>
                                    Đặt câu hỏi mới
                                </Button>
                            </div>

                            {isLoadingQA ? <div className="py-10"><Skeleton active avatar paragraph={{ rows: 3 }} /></div> : questions.length === 0 ? (
                                <div className="text-center py-24 px-6">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <MessageOutlined className="text-5xl text-gray-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">Chưa có câu hỏi nào</h3>
                                    <p className="text-gray-500 text-base max-w-md mx-auto">Hãy là người đầu tiên khơi mào cuộc thảo luận. Giảng viên và các học viên khác luôn sẵn sàng hỗ trợ bạn!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {questions.map(q => (
                                        <div
                                            key={q.id}
                                            className="flex gap-5 p-6 border border-gray-200 rounded-xl hover:shadow-md hover:border-learnova-purple cursor-pointer transition-all duration-300 bg-white group"
                                            onClick={() => setSelectedQuestion(q)}
                                        >
                                            <Avatar size={50} src={q.author?.avatarUrl} className="bg-gray-800 flex-shrink-0 font-bold text-lg">
                                                {getInitials(q.author?.fullName)}
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 text-lg m-0 mb-1.5 group-hover:text-learnova-purple transition-colors pr-4 line-clamp-2">
                                                    {q.title}
                                                </h4>
                                                <p className="text-[15px] text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                                                    {q.content}
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                                                    <span className="font-bold text-gray-700">{q.author?.fullName}</span>
                                                    <span>{new Date(q.createdAt).toLocaleDateString("vi-VN")}</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <MessageOutlined />
                                                        <span className="font-medium">{q.answers?.length || 0} phản hồi</span>
                                                    </span>
                                                    {q.isResolved && <Tag color="green" className="m-0 border-none px-2 rounded-full font-bold">Đã giải quyết</Tag>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: '3',
            label: <span className="font-bold text-base px-4">Tài liệu đính kèm</span>,
            children: (
                <div className="py-6 max-w-4xl">
                    {activeLesson.attachments?.length > 0 ? (
                        <ul className="space-y-3 p-0 list-none">
                            {activeLesson.attachments.map((file: any) => (
                                <li key={file.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="bg-red-50 p-3 rounded-lg">
                                        <FilePdfOutlined className="text-red-500 text-2xl" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-gray-900 font-bold text-base">{file.fileName}</div>
                                        <div className="text-sm text-gray-500 mt-0.5">{file.fileSizeString}</div>
                                    </div>
                                    <Button
                                        onClick={() => handleDownload(file.fileUrl, file.fileName)}
                                        className="font-bold border-gray-300 text-gray-700 hover:!border-learnova-purple hover:!text-learnova-purple hover:!bg-purple-50 transition-all rounded-lg"
                                    >
                                        Tải xuống
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-gray-500 py-10 flex items-center gap-3">
                            <FileTextOutlined className="text-2xl text-gray-300" /> Không có tài liệu đính kèm cho bài học này.
                        </div>
                    )}
                </div>
            ),
        }
    ];

    return (
        <div className="flex h-screen flex-col bg-white overflow-hidden">
            {/* HEADER KHÓA HỌC */}
            <header className="h-16 bg-[#1c1d1f] text-white flex items-center px-6 justify-between flex-shrink-0 z-10 border-b border-gray-700">
                <div className="flex items-center gap-4">
                    <Link href="/my-learning" className="text-gray-300 hover:text-white flex items-center gap-2 transition-colors">
                        <LeftOutlined /> <span className="hidden md:inline font-bold">Không gian học tập</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-gray-600 mx-2 hidden md:block" />
                    <h1 className="text-base font-bold m-0 line-clamp-1 truncate max-w-xl">{courseData.title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end w-40 md:w-56">
                        <span className="text-[12px] text-gray-400 mb-1">Tiến độ của bạn</span>
                        <div className="flex items-center gap-3 w-full">
                            <div className="flex-1">
                                <Progress
                                    percent={overallProgress || 0}
                                    size="small"
                                    showInfo={false}
                                    strokeColor="#A435F0"
                                    trailColor="#3a3b3c"
                                    style={{ margin: 0 }}
                                />
                            </div>
                            <span className="text-white text-sm font-bold w-10 text-right">
                                {overallProgress || 0}%
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-y-auto flex flex-col bg-white relative">
                    {/* KHUNG VIDEO/NỘI DUNG */}
                    <div className="bg-black w-full aspect-video flex justify-center items-center relative max-h-[70vh]">
                        {activeLesson.lessonType === 'Video' && activeLesson.videoUrl ? (
                            <video
                                key={activeLesson.id}
                                src={activeLesson.videoUrl}
                                controls autoPlay controlsList="nodownload"
                                className="w-full h-full object-contain outline-none"
                            />
                        ) : activeLesson.lessonType === 'Article' && activeLesson.articleContent ? (
                            <div className="bg-white w-full h-full p-8 overflow-y-auto">
                                <div dangerouslySetInnerHTML={{ __html: activeLesson.articleContent }} className="prose max-w-none mx-auto" />
                            </div>
                        ) : (!activeLesson.quizzes?.length && (
                            <div className="text-white/50">Nội dung bài học đang được cập nhật...</div>
                        ))}
                    </div>

                    {/* KHUNG BÀI TRẮC NGHIỆM */}
                    {activeLesson.quizzes && activeLesson.quizzes.length > 0 && (
                        <div className="w-full bg-gray-50 border-b border-gray-200">
                            <div className="max-w-4xl mx-auto py-10 px-6">
                                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-black">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="bg-purple-100 p-2 rounded-lg">
                                            <QuestionCircleOutlined className="text-2xl text-learnova-purple" />
                                        </div>
                                        <div>
                                            <Title level={4} className="!m-0">{activeLesson.quizzes[0].title}</Title>
                                            <Text className="text-gray-500">Yêu cầu đạt: {activeLesson.quizzes[0].passingScorePercent}% để qua bài</Text>
                                        </div>
                                    </div>

                                    {!quizResult ? (
                                        <div className="flex flex-col gap-6">
                                            {activeLesson.quizzes[0].questions?.map((q: any, index: number) => {
                                                const choices = typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices;
                                                return (
                                                    <div key={q.id} className="p-5 border border-gray-100 rounded-lg bg-gray-50">
                                                        <div className="font-bold text-base mb-4">Câu {index + 1}: {q.questionText}</div>
                                                        <Space direction="vertical" className="w-full">
                                                            {choices?.map((choice: any, choiceIndex: number) => {
                                                                const choiceKey = choice.id !== undefined ? choice.id : choiceIndex;

                                                                return (
                                                                    <div
                                                                        key={choiceKey}
                                                                        onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: choiceKey }))}
                                                                        className={`p-3 rounded-md border cursor-pointer transition-all flex items-center gap-3 ${userAnswers[q.id] === choiceKey
                                                                            ? "border-learnova-purple bg-purple-50 text-learnova-purple font-bold shadow-sm"
                                                                            : "border-gray-200 bg-white hover:border-learnova-purple hover:bg-gray-50"
                                                                            }`}
                                                                    >
                                                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${userAnswers[q.id] === choiceKey
                                                                            ? 'bg-learnova-purple text-white'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                            }`}>
                                                                            {String.fromCharCode(65 + choiceIndex)}
                                                                        </div>
                                                                        <span>{choice.text}</span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </Space>
                                                    </div>
                                                );
                                            })}
                                            <Button
                                                type="primary" size="large" block
                                                className="!bg-learnova-purple border-none mt-2 font-bold"
                                                onClick={() => handleSubmitQuiz(activeLesson.quizzes[0].id)}
                                                loading={isSubmittingQuiz}
                                                disabled={Object.keys(userAnswers).length !== activeLesson.quizzes[0].questions?.length}
                                            >
                                                Nộp bài kiểm tra
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            {quizResult.isPassed ? <CheckCircleFilled className="text-5xl text-green-500 mb-3" /> : <div className="text-5xl mb-3">😢</div>}
                                            <Title level={3} className={quizResult.isPassed ? "!text-green-600" : "!text-red-500"}>
                                                {quizResult.isPassed ? "Vượt qua bài kiểm tra!" : "Chưa đạt yêu cầu"}
                                            </Title>
                                            <Text className="text-base block">Kết quả: <b>{quizResult.scorePercent}%</b> (Đúng {quizResult.correctCount}/{quizResult.totalQuestions})</Text>
                                            {!quizResult.isPassed && (
                                                <Button className="mt-4 border-learnova-purple text-learnova-purple font-bold" onClick={() => { setQuizResult(null); setUserAnswers({}); }}>
                                                    Thử làm lại
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TABS NỘI DUNG DƯỚI VIDEO */}
                    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-3xl font-bold text-gray-900 m-0 leading-snug pr-4">{activeLesson.title}</h2>

                            {(!activeLesson.quizzes || activeLesson.quizzes.length === 0) && (
                                <Button
                                    size="large"
                                    type={activeLesson.isCompleted ? "default" : "primary"}
                                    icon={activeLesson.isCompleted ? <CheckCircleFilled className="text-green-500" /> : <CheckCircleOutlined />}
                                    onClick={handleToggleComplete}
                                    className={!activeLesson.isCompleted ? "!bg-learnova-purple border-none font-bold shadow-md" : "font-bold border-gray-300"}
                                >
                                    {activeLesson.isCompleted ? "Đã hoàn thành" : "Hoàn thành bài học"}
                                </Button>
                            )}
                        </div>

                        <Tabs defaultActiveKey="1" items={tabItems} className="learnova-learning-tabs mt-8" />
                    </div>
                </main>

                {/* SIDEBAR BÀI HỌC BÊN PHẢI */}
                <aside className="w-80 lg:w-[400px] border-l border-gray-200 bg-white overflow-y-auto hidden md:flex flex-col flex-shrink-0">
                    <div className="p-5 border-b border-gray-200 bg-white sticky top-0 z-10">
                        <h2 className="font-bold text-lg text-gray-900 m-0">Nội dung khóa học</h2>
                    </div>

                    <Collapse
                        defaultActiveKey={courseData.sections.map((_: any, i: number) => i.toString())}
                        expandIconPosition="end"
                        className="learnova-curriculum border-none bg-white rounded-none"
                        ghost
                    >
                        {courseData.sections.map((section: any, index: number) => (
                            <Panel
                                header={
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[15px] text-gray-900 leading-tight">
                                            {section.title}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium mt-1.5 flex items-center gap-2">
                                            Đã hoàn thành: {section.lessons.filter((l: any) => l.isCompleted).length} / {section.lessons.length} bài
                                        </span>
                                    </div>
                                }
                                key={index.toString()}
                                className="bg-[#f7f9fa] border-b border-gray-200"
                            >
                                <ul className="list-none p-0 m-0 bg-white">
                                    {section.lessons.map((lesson: any) => {
                                        const isActive = lesson.id === activeLessonId;

                                        return (
                                            <li
                                                key={lesson.id}
                                                className={`flex gap-3 py-3 px-5 border-b border-gray-50 cursor-pointer transition-colors
                                                    ${isActive ? 'bg-[#e6f2f5]' : 'hover:bg-gray-50'}`}
                                                onClick={() => setActiveLessonId(lesson.id)}
                                            >
                                                <div className="mt-0.5">
                                                    {lesson.isCompleted ? (
                                                        <CheckCircleFilled className="text-green-500" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-gray-400 mt-1" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <span className={`text-[14px] line-clamp-2 leading-snug
                                                        ${isActive ? 'font-bold text-gray-900' : 'text-gray-700'}`}>
                                                        {lesson.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        {lesson.lessonType === 'Video' ? <PlayCircleOutlined className="text-[10px] text-gray-400" /> :
                                                            lesson.lessonType === 'Article' ? <FileTextOutlined className="text-[10px] text-gray-400" /> :
                                                                <QuestionCircleOutlined className="text-[10px] text-gray-400" />
                                                        }
                                                        <span className="text-xs text-gray-500">
                                                            {lesson.lessonType === 'Quiz' ? 'Trắc nghiệm' : lesson.durationString}
                                                        </span>
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </Panel>
                        ))}
                    </Collapse>
                </aside>
            </div>

            <style jsx global>{`
                .learnova-learning-tabs .ant-tabs-nav::before { border-bottom: 1px solid #d1d7dc !important; }
                .learnova-learning-tabs .ant-tabs-ink-bar { background: #111827 !important; height: 3px !important; }
                .learnova-learning-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn { color: #111827 !important; }
                .learnova-learning-tabs .ant-tabs-tab:hover { color: #A435F0 !important; }
                
                .learnova-curriculum .ant-collapse-header { padding: 16px 20px !important; }
                .learnova-curriculum .ant-collapse-content-box { padding: 0 !important; }

                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
}