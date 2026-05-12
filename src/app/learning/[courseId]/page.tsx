"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Collapse, Skeleton, Button, Tabs, message, Progress, Space, Typography
} from "antd";
import {
    PlayCircleOutlined,
    LeftOutlined,
    CheckCircleFilled,
    CheckCircleOutlined,
    FilePdfOutlined,
    QuestionCircleOutlined,
    FileTextOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Panel } = Collapse;
const { Title, Text } = Typography;

export default function EnrolledLearningPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { token } = useAuthStore();

    const [courseData, setCourseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [overallProgress, setOverallProgress] = useState(0);

    // STATE BÀI TRẮC NGHIỆM
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [quizResult, setQuizResult] = useState<any>(null);
    const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

    // 1. FETCH DATA (API DÀNH CHO HỌC VIÊN ĐÃ MUA)
    useEffect(() => {
        if (!token) {
            router.push(`/login?redirect=/learning/${courseId}`);
            return;
        }

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

    // LÀM PHẲNG MẢNG BÀI HỌC VÀ LẤY BÀI HIỆN TẠI
    const allLessons = useMemo(() => {
        if (!courseData) return [];
        return courseData.sections.flatMap((section: any) => section.lessons);
    }, [courseData]);

    const activeLesson = useMemo(() => {
        return allLessons.find((l: any) => l.id === activeLessonId);
    }, [allLessons, activeLessonId]);

    // Reset quiz khi chuyển bài
    useEffect(() => {
        setUserAnswers({});
        setQuizResult(null);
    }, [activeLessonId]);

    // 2. LOGIC ĐÁNH DẤU HOÀN THÀNH & TỰ ĐỘNG CHUYỂN BÀI
    const handleToggleComplete = async () => {
        if (!activeLessonId || !token) return;

        try {
            const res = await fetch(`http://localhost:8000/api/store/my-learning/${courseId}/lessons/${activeLessonId}/complete`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
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

                // Auto-next sau 0.5s nếu vừa học xong
                if (isNewlyCompleted) {
                    setTimeout(() => {
                        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
                        let nextTargetLesson = allLessons.slice(currentIndex + 1).find((l: any) => !l.isCompleted);
                        if (!nextTargetLesson) {
                            nextTargetLesson = allLessons.find((l: any) => !l.isCompleted && l.id !== activeLessonId);
                        }
                        if (nextTargetLesson) {
                            setActiveLessonId(nextTargetLesson.id);
                        } else {
                            message.success("Tuyệt vời! Bạn đã hoàn thành toàn bộ khóa học này 🎉", 5);
                        }
                    }, 500);
                }
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error("Lỗi cập nhật tiến độ");
        }
    };

    // 3. LOGIC NỘP BÀI TRẮC NGHIỆM
    const handleSubmitQuiz = async (quizId: number) => {
        if (!token) return;
        setIsSubmittingQuiz(true);

        try {
            const formattedAnswers = Object.keys(userAnswers).map(qId => ({
                questionId: parseInt(qId),
                selectedChoiceId: userAnswers[parseInt(qId)]
            }));

            const res = await fetch(`http://localhost:8000/api/store/my-learning/quizzes/${quizId}/submit`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ answers: formattedAnswers })
            });
            const data = await res.json();

            if (res.ok) {
                setQuizResult(data.data);
                if (data.data.isPassed && activeLesson && !activeLesson.isCompleted) {
                    handleToggleComplete(); // Pass thì auto đánh dấu hoàn thành bài
                }
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error("Lỗi khi nộp bài");
        } finally {
            setIsSubmittingQuiz(false);
        }
    };

    // 4. LOGIC ĐIỀU HƯỚNG BÀI TẬP BẰNG TAY (NEXT/PREV)
    const handleNextPrev = (direction: "next" | "prev") => {
        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
        if (direction === "next" && currentIndex < allLessons.length - 1) {
            setActiveLessonId(allLessons[currentIndex + 1].id);
        } else if (direction === "prev" && currentIndex > 0) {
            setActiveLessonId(allLessons[currentIndex - 1].id);
        }
    };

    // 5. LOGIC TẢI FILE
    const handleDownload = async (url: string, fileName: string) => {
        try {
            message.loading({ content: `Đang chuẩn bị tải: ${fileName}...`, key: 'downloading' });
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network error");
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(blobUrl);
            message.success({ content: 'Đã tải xong!', key: 'downloading', duration: 2 });
        } catch (error) {
            message.destroy('downloading');
            window.open(url, "_blank");
        }
    };

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Skeleton active className="max-w-3xl" /></div>;
    if (!courseData || !activeLesson) return <div className="text-center py-20 text-h3">Không tìm thấy bài học.</div>;

    const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

    // TABS CONFIGURATION
    const tabItems = [
        {
            key: '1',
            label: <span className="font-bold text-base px-4">Tổng quan</span>,
            children: (
                <div className="py-4 text-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-gray-800">Về bài học này</h3>
                    <p>Đây là bài học nằm trong khóa <strong>{courseData.title}</strong>.</p>
                    <p>Giảng viên: <strong>{courseData.instructor?.fullName}</strong></p>

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                        <Button size="large" icon={<LeftOutlined />} onClick={() => handleNextPrev("prev")} disabled={currentIndex === 0}>
                            Bài trước
                        </Button>
                        <Button size="large" type="primary" className="!bg-gray-800 border-none font-bold" onClick={() => handleNextPrev("next")} disabled={currentIndex === allLessons.length - 1}>
                            Bài tiếp theo
                        </Button>
                    </div>
                </div>
            ),
        },
        {
            key: '2',
            label: <span className="font-bold text-base px-4">Hỏi đáp</span>,
            children: (
                <div className="py-10 text-center text-gray-500">
                    <QuestionCircleOutlined className="text-4xl mb-3 text-gray-300" />
                    <p>Hệ thống hỏi đáp đang được kết nối với Giảng viên...</p>
                </div>
            ),
        },
        {
            key: '3',
            label: <span className="font-bold text-base px-4">Tài liệu đính kèm</span>,
            children: (
                <div className="py-4">
                    {activeLesson.attachments?.length > 0 ? (
                        <ul className="space-y-3 p-0 list-none">
                            {activeLesson.attachments.map((file: any) => (
                                <li key={file.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
                                    <FilePdfOutlined className="text-red-500 text-2xl" />
                                    <div className="flex-1">
                                        <div className="text-learnova-purple font-bold text-sm">{file.fileName}</div>
                                        <div className="text-xs text-gray-500">{file.fileSizeString}</div>
                                    </div>
                                    <Button
                                        size="small"
                                        onClick={() => handleDownload(file.fileUrl, file.fileName)}
                                        className="text-xs font-bold border-gray-900 text-gray-900 hover:!border-learnova-purple hover:!text-learnova-purple transition-all"
                                    >
                                        Tải xuống
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">Không có tài liệu đính kèm cho bài học này.</p>
                    )}
                </div>
            ),
        }
    ];

    return (
        <div className="flex h-screen flex-col bg-white overflow-hidden">
            {/* ====== BẢN SỬA LỖI UI HEADER TIẾN ĐỘ Ở ĐÂY ====== */}
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
            {/* ================================================ */}

            <div className="flex flex-1 overflow-hidden">
                {/* CỘT TRÁI: KHUNG MEDIA VÀ TABS */}
                <main className="flex-1 overflow-y-auto flex flex-col bg-white relative">
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
                                                            {choices?.map((choice: any) => (
                                                                <div
                                                                    key={choice.id}
                                                                    onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: choice.id }))}
                                                                    className={`p-3 rounded-md border cursor-pointer transition-all ${userAnswers[q.id] === choice.id
                                                                        ? "border-learnova-purple bg-purple-50 text-learnova-purple font-medium"
                                                                        : "border-gray-200 bg-white hover:border-learnova-purple"
                                                                        }`}
                                                                >
                                                                    {choice.text}
                                                                </div>
                                                            ))}
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

                    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 m-0 leading-snug pr-4">{activeLesson.title}</h2>

                            {(!activeLesson.quizzes || activeLesson.quizzes.length === 0) && (
                                <Button
                                    type={activeLesson.isCompleted ? "default" : "primary"}
                                    icon={activeLesson.isCompleted ? <CheckCircleFilled className="text-green-500" /> : <CheckCircleOutlined />}
                                    onClick={handleToggleComplete}
                                    className={!activeLesson.isCompleted ? "!bg-learnova-purple border-none font-bold" : "font-bold border-gray-300"}
                                >
                                    {activeLesson.isCompleted ? "Đã hoàn thành" : "Hoàn thành"}
                                </Button>
                            )}
                        </div>

                        <Tabs defaultActiveKey="1" items={tabItems} className="learnova-learning-tabs" />
                    </div>
                </main>

                {/* CỘT PHẢI: SIDEBAR LỊCH TRÌNH CHUẨN UDEMY */}
                <aside className="w-80 lg:w-[400px] border-l border-gray-200 bg-white overflow-y-auto hidden md:flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
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
                                // ====== BẢN SỬA LỖI UI ĐẾM BÀI HỌC Ở SIDEBAR ======
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
                                // ===================================================
                                key={index.toString()}
                                className="bg-[#f7f9fa] border-b border-gray-200"
                            >
                                <ul className="list-none p-0 m-0 bg-white">
                                    {section.lessons.map((lesson: any) => {
                                        const isActive = lesson.id === activeLessonId;

                                        return (
                                            <li
                                                key={lesson.id}
                                                className={`flex gap-3 py-3 px-4 border-b border-gray-50 cursor-pointer transition-colors
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
                                                    <div className="flex items-center gap-2 mt-1">
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
            `}</style>
        </div>
    );
}