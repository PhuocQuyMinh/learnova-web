"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import {
    Layout, Progress, Button, Skeleton, message,
    Collapse, Typography, Space, Divider
} from "antd";
import {
    LeftOutlined,
    CheckCircleFilled,
    CheckCircleOutlined,
    PlayCircleOutlined,
    FileTextOutlined,
    QuestionCircleOutlined,
    MenuUnfoldOutlined
} from "@ant-design/icons";

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function LearningSpacePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { token } = useAuthStore();

    const [courseData, setCourseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [overallProgress, setOverallProgress] = useState(0);

    // LẤY DỮ LIỆU KHÓA HỌC
    useEffect(() => {
        if (!token) {
            router.push(`/login?redirect=/learning/${courseId}`);
            return;
        }

        const fetchLearningData = async () => {
            try {
                // Gọi API lấy chi tiết khóa học cho không gian học tập
                const res = await fetch(`http://localhost:8000/api/store/courses/${courseId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await res.json();

                if (res.ok) {
                    setCourseData(data.data);
                    setOverallProgress(data.data.overallProgressPercent);
                    // Tự động focus vào bài học đang học dở
                    if (data.data.focusLessonId) {
                        setActiveLessonId(data.data.focusLessonId);
                    } else if (data.data.sections?.[0]?.lessons?.[0]) {
                        // Fallback: Nếu không có focusLessonId, chọn bài đầu tiên
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

    // LÀM PHẲNG DANH SÁCH BÀI HỌC (Để dễ tìm kiếm Next/Prev)
    const allLessons = useMemo(() => {
        if (!courseData) return [];
        return courseData.sections.flatMap((section: any) => section.lessons);
    }, [courseData]);

    const activeLesson = useMemo(() => {
        return allLessons.find((l: any) => l.id === activeLessonId);
    }, [allLessons, activeLessonId]);

    // XỬ LÝ ĐÁNH DẤU HOÀN THÀNH BÀI HỌC VÀ CHUYỂN BÀI TỰ ĐỘNG
    const handleToggleComplete = async () => {
        if (!activeLessonId || !token) return;

        try {
            const res = await fetch(`http://localhost:8000/api/store/my-learning/${courseId}/lessons/${activeLessonId}/complete`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();

            if (res.ok) {
                // 1. Cập nhật tiến độ tổng thể trên thanh Progress
                setOverallProgress(data.data.progressPercent);

                let isNewlyCompleted = false; // Biến cờ để kiểm tra xem user vừa Đánh dấu XONG hay BỎ Đánh dấu

                // 2. SỬA LỖI UI (Dùng map thay vì forEach để ép React cập nhật giao diện)
                setCourseData((prev: any) => {
                    const newSections = prev.sections.map((section: any) => ({
                        ...section,
                        lessons: section.lessons.map((lesson: any) => {
                            if (lesson.id === activeLessonId) {
                                isNewlyCompleted = !lesson.isCompleted;
                                return { ...lesson, isCompleted: isNewlyCompleted }; // Ép tạo vùng nhớ mới
                            }
                            return lesson;
                        })
                    }));
                    return { ...prev, sections: newSections };
                });

                // 3. THUẬT TOÁN TỰ ĐỘNG CHUYỂN BÀI CHƯA HOÀN THÀNH GẦN NHẤT
                if (isNewlyCompleted) {
                    // Dùng setTimeout 0.5s để học viên kịp nhìn thấy dấu Tích xanh hiện lên ở bài vừa xong
                    setTimeout(() => {
                        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

                        // Bước 1: Tìm bài chưa học TỪ SAU bài hiện tại đến cuối khóa
                        let nextTargetLesson = allLessons.slice(currentIndex + 1).find((l: any) => !l.isCompleted);

                        // Bước 2: Nếu đoạn sau hết rồi, vòng ngược lên tìm từ ĐẦU khóa học
                        if (!nextTargetLesson) {
                            nextTargetLesson = allLessons.find((l: any) => !l.isCompleted && l.id !== activeLessonId);
                        }

                        // Nếu tìm thấy thì chuyển bài, nếu không thì báo hoàn thành khóa học
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
    // ĐIỀU HƯỚNG BÀI TRƯỚC / BÀI SAU
    const handleNextPrev = (direction: "next" | "prev") => {
        const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);
        if (direction === "next" && currentIndex < allLessons.length - 1) {
            setActiveLessonId(allLessons[currentIndex + 1].id);
        } else if (direction === "prev" && currentIndex > 0) {
            setActiveLessonId(allLessons[currentIndex - 1].id);
        }
    };

    // TẠO MENU SIDEBAR TỪ SECTIONS
    const sidebarItems = useMemo(() => {
        if (!courseData) return [];
        return courseData.sections.map((section: any) => ({
            key: section.id.toString(),
            label: (
                <div className="font-bold text-gray-800">
                    {section.title}
                </div>
            ),
            children: (
                <div className="flex flex-col gap-1">
                    {section.lessons.map((lesson: any) => (
                        <div
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${activeLessonId === lesson.id
                                ? "bg-purple-100 text-learnova-purple"
                                : "hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            <div className="flex items-start gap-3 w-full">
                                <div className="mt-1">
                                    {lesson.isCompleted ? (
                                        <CheckCircleFilled className="text-green-500 text-lg" />
                                    ) : (
                                        <CheckCircleOutlined className="text-gray-300 text-lg" />
                                    )}
                                </div>
                                <div className="flex flex-col flex-1">
                                    <span className="text-sm font-medium line-clamp-2">{lesson.title}</span>
                                    <Space className="text-xs text-gray-500 mt-1">
                                        {lesson.lessonType === 'Video' && <><PlayCircleOutlined /> {lesson.durationString}</>}
                                        {lesson.lessonType === 'Reading' && <><FileTextOutlined /> Bài đọc</>}
                                        {lesson.lessonType === 'Quiz' && <><QuestionCircleOutlined /> Trắc nghiệm</>}
                                    </Space>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )
        }));
    }, [courseData, activeLessonId]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-black"><Skeleton active /></div>;
    if (!courseData) return null;

    const currentIndex = allLessons.findIndex((l: any) => l.id === activeLessonId);

    return (
        <Layout className="min-h-screen">
            {/* HEADER DARK MODE CHO TRẢI NGHIỆM ĐIỆN ẢNH */}
            <Header className="bg-[#1c1d1f] px-6 h-16 flex items-center justify-between border-b border-gray-700 sticky top-0 z-50">
                <div className="flex items-center gap-4 text-white">
                    <Button
                        type="text"
                        icon={<LeftOutlined />}
                        className="text-white hover:text-gray-300"
                        onClick={() => router.push('/my-learning')}
                    >
                        Quay lại
                    </Button>
                    <Divider type="vertical" className="bg-gray-600 h-8" />
                    <h1 className="text-lg font-bold m-0 line-clamp-1">{courseData.title}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <Text className="text-xs text-gray-400">Tiến độ khóa học</Text>
                        <div className="flex items-center gap-3 w-40">
                            <Progress
                                percent={overallProgress}
                                size="small"
                                showInfo={false}
                                strokeColor="#A435F0"
                                trailColor="#3a3b3c"
                            />
                            <span className="text-white text-sm font-bold">{overallProgress}%</span>
                        </div>
                    </div>
                </div>
            </Header>

            <Layout>
                {/* KHU VỰC NỘI DUNG BÀI HỌC CHÍNH */}
                <Content className="bg-white overflow-y-auto" style={{ height: 'calc(100vh - 64px)' }}>
                    {activeLesson ? (
                        <div className="w-full">
                            {/* KHUNG VIDEO / ARTICLE */}
                            <div className="w-full bg-black flex justify-center items-center" style={{ minHeight: '60vh' }}>
                                {activeLesson.lessonType === 'Video' ? (
                                    <video
                                        src={activeLesson.videoUrl}
                                        controls
                                        autoPlay
                                        controlsList="nodownload" // Chống tải video
                                        className="w-full max-w-5xl h-full outline-none"
                                        key={activeLesson.id}
                                    />
                                ) : activeLesson.lessonType === 'Reading' ? (
                                    <div className="bg-white w-full h-full p-10 max-w-4xl mx-auto rounded-md my-8 shadow-sm">
                                        <div dangerouslySetInnerHTML={{ __html: activeLesson.articleContent }} className="prose max-w-none" />
                                    </div>
                                ) : (
                                    <div className="text-white text-xl">Tính năng làm bài Trắc nghiệm đang phát triển...</div>
                                )}
                            </div>

                            {/* THÔNG TIN BÀI HỌC VÀ NÚT ĐIỀU HƯỚNG */}
                            <div className="max-w-5xl mx-auto p-8">
                                <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-6">
                                    <Title level={3} className="!m-0">{activeLesson.title}</Title>

                                    <Button
                                        type={activeLesson.isCompleted ? "default" : "primary"}
                                        size="large"
                                        icon={activeLesson.isCompleted ? <CheckCircleFilled className="text-green-500" /> : <CheckCircleOutlined />}
                                        onClick={handleToggleComplete}
                                        className={!activeLesson.isCompleted ? "!bg-learnova-purple border-none font-bold" : "font-bold border-gray-300"}
                                    >
                                        {activeLesson.isCompleted ? "Bỏ đánh dấu hoàn thành" : "Đánh dấu hoàn thành"}
                                    </Button>
                                </div>

                                {/* NÚT PREV / NEXT BÊN DƯỚI */}
                                <div className="flex justify-between mt-12">
                                    <Button
                                        size="large"
                                        icon={<LeftOutlined />}
                                        onClick={() => handleNextPrev("prev")}
                                        disabled={currentIndex === 0}
                                    >
                                        Bài trước
                                    </Button>
                                    <Button
                                        size="large"
                                        type="primary"
                                        className="!bg-gray-800 border-none"
                                        onClick={() => handleNextPrev("next")}
                                        disabled={currentIndex === allLessons.length - 1}
                                    >
                                        Bài tiếp theo
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full text-gray-500">
                            Vui lòng chọn một bài học bên danh sách
                        </div>
                    )}
                </Content>

                {/* SIDEBAR LỊCH TRÌNH (CURRICULUM) */}
                <Sider
                    width={350}
                    className="bg-white border-l border-gray-200 overflow-y-auto"
                    style={{ height: 'calc(100vh - 64px)' }}
                >
                    <div className="p-4 border-b border-gray-200 bg-gray-50 sticky top-0 z-10 font-bold text-gray-800 flex items-center gap-2">
                        <MenuUnfoldOutlined /> Nội dung khóa học
                    </div>
                    <Collapse
                        items={sidebarItems}
                        defaultActiveKey={courseData.sections.map((s: any) => s.id.toString())} // Mở tất cả các section mặc định
                        expandIconPosition="end"
                        ghost
                        className="bg-white curriculum-collapse"
                    />
                </Sider>
            </Layout>

            {/* Tùy chỉnh CSS nhỏ cho Collapse của AntD */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .curriculum-collapse .ant-collapse-item {
                    border-bottom: 1px solid #f0f0f0 !important;
                }
                .curriculum-collapse .ant-collapse-header {
                    background-color: #f9fafb !important;
                    padding: 16px !important;
                }
                .curriculum-collapse .ant-collapse-content-box {
                    padding: 8px 12px !important;
                }
            `}} />
        </Layout>
    );
}