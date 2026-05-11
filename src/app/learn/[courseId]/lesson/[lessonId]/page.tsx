"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Collapse, Skeleton, Button, Tabs, Alert, message } from "antd";
import {
    PlayCircleOutlined,
    LeftOutlined,
    CheckCircleFilled,
    LockOutlined,
    FilePdfOutlined,
    QuestionCircleOutlined
} from "@ant-design/icons";
import Link from "next/link";

const { Panel } = Collapse;

export default function LearningPage() {
    const params = useParams();
    const router = useRouter();

    const courseId = params.courseId;
    const lessonId = params.lessonId ? parseInt(params.lessonId as string, 10) : null;

    const [course, setCourse] = useState<any>(null);
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Giả lập trạng thái user chưa mua khóa học (Chỉ đang xem thử)
    // Sau này bạn thay bằng logic check Enrollment từ hệ thống nhé
    const hasEnrolled = false;

    useEffect(() => {
        const fetchCourseAndLesson = async () => {
            setLoading(true);
            try {
                // Tạm dùng API detail để lấy toàn bộ curriculum
                const response = await fetch(`http://localhost:8000/api/store/coursesDetail/${courseId}`);
                const result = await response.json();

                if (result.status === "success") {
                    const courseData = result.data.course;
                    setCourse(courseData);

                    // Tìm bài học hiện tại dựa trên lessonId từ URL
                    let foundLesson = null;
                    for (const section of courseData.sections) {
                        const lesson = section.lessons.find((l: any) => l.id === lessonId);
                        if (lesson) {
                            foundLesson = lesson;
                            break;
                        }
                    }

                    setCurrentLesson(foundLesson);

                    // NẾU BÀI NÀY KHÔNG CHO XEM THỬ VÀ USER CHƯA MUA -> Đẩy về trang chi tiết
                    if (foundLesson && !foundLesson.isPreviewable && !hasEnrolled) {
                        router.push(`/course/${courseId}`);
                    }
                }
            } catch (error) {
                console.error("Lỗi khi tải bài học:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && lessonId) fetchCourseAndLesson();
    }, [courseId, lessonId, hasEnrolled, router]);

    // Hàm xử lý ép tải file (Force Download)
    const handleDownload = async (url: string, fileName: string) => {
        try {
            // Hiển thị thông báo đang tải (rất hữu ích với file nặng)
            message.loading({ content: `Đang chuẩn bị tải: ${fileName}...`, key: 'downloading' });

            // 1. Fetch dữ liệu từ URL
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network response was not ok");

            // 2. Chuyển đổi dữ liệu thành dạng Blob
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);

            // 3. Tạo thẻ <a> ảo để kích hoạt download
            const link = document.createElement("a");
            link.href = blobUrl;
            link.download = fileName; // Bắt buộc trình duyệt tải về với tên này
            document.body.appendChild(link);
            link.click();

            // 4. Dọn dẹp rác bộ nhớ
            link.remove();
            window.URL.revokeObjectURL(blobUrl);

            message.success({ content: 'Đã tải xong!', key: 'downloading', duration: 2 });
        } catch (error) {
            console.error("Lỗi CORS hoặc tải file, dùng phương án dự phòng:", error);
            // Fallback: Nếu URL không cho phép Fetch (bị chặn CORS), mở file sang tab mới
            message.destroy('downloading');
            window.open(url, "_blank");
        }
    };

    // Cấu hình các Tabs bên dưới Video
    const tabItems = [
        {
            key: '1',
            label: <span className="font-bold text-base px-4">Tổng quan</span>,
            children: (
                <div className="py-4 text-body text-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-learnova-dark">Về bài học này</h3>
                    <p>Đây là bài học nằm trong khóa <strong>{course?.title}</strong>.</p>
                    <p>Giảng viên: <strong>{course?.instructor?.fullName}</strong></p>
                </div>
            ),
        },
        {
            key: '2',
            label: <span className="font-bold text-base px-4">Hỏi đáp</span>,
            children: (
                <div className="py-10 text-center text-gray-500">
                    <QuestionCircleOutlined className="text-4xl mb-3 text-gray-300" />
                    <p>Tính năng hỏi đáp chỉ dành cho học viên đã mua khóa học.</p>
                </div>
            ),
        },
        {
            key: '3',
            label: <span className="font-bold text-base px-4">Tài liệu đính kèm</span>,
            children: (
                <div className="py-4">
                    {currentLesson?.attachments?.length > 0 ? (
                        <ul className="space-y-3 p-0 list-none">
                            {currentLesson.attachments.map((file: any) => (
                                <li key={file.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-sm hover:bg-gray-50 transition-colors">
                                    <FilePdfOutlined className="text-red-500 text-2xl" />
                                    <div className="flex-1">
                                        <div className="text-learnova-purple font-bold text-sm">{file.fileName}</div>
                                        <div className="text-xs text-gray-500">{file.fileSizeString}</div>
                                    </div>

                                    {/* CẬP NHẬT NÚT TẢI XUỐNG TẠI ĐÂY */}
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

    if (loading) return <div className="h-screen flex items-center justify-center"><Skeleton active className="max-w-3xl" /></div>;
    if (!currentLesson) return <div className="text-center py-20 text-h3">Không tìm thấy bài học.</div>;

    return (
        <div className="flex h-screen flex-col bg-white overflow-hidden">
            {/* HEADER HỌC TẬP (Màu đen đặc trưng) */}
            <header className="h-16 bg-learnova-dark text-white flex items-center px-4 justify-between flex-shrink-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href={`/course/${courseId}`} className="text-white hover:text-gray-300 flex items-center gap-2">
                        <LeftOutlined /> <span className="hidden md:inline font-bold">Quay lại khóa học</span>
                    </Link>
                    <div className="h-6 w-[1px] bg-gray-600 mx-2 hidden md:block" />
                    <h1 className="text-base font-bold m-0 line-clamp-1 truncate max-w-xl">{course?.title}</h1>
                </div>

                <div className="flex items-center gap-4">
                    {!hasEnrolled && (
                        <Button type="primary" className="!bg-learnova-purple border-none font-bold rounded-none">
                            Mua khóa học ngay
                        </Button>
                    )}
                </div>
            </header>

            {/* MAIN CONTENT VÀ SIDEBAR */}
            <div className="flex flex-1 overflow-hidden">

                {/* CỘT TRÁI: VIDEO VÀ THÔNG TIN */}
                <main className="flex-1 overflow-y-auto flex flex-col bg-white relative">

                    {/* Cảnh báo chế độ Xem thử */}
                    {!hasEnrolled && currentLesson.isPreviewable && (
                        <Alert
                            message={
                                <span className="font-bold">Bạn đang ở chế độ xem thử. Để học toàn bộ lộ trình và làm bài tập, vui lòng mua khóa học.</span>
                            }
                            type="warning"
                            showIcon
                            banner
                            className="!bg-[#fcf7e5] !border-b !border-[#f6e199]"
                        />
                    )}

                    {/* Video Player */}
                    <div className="bg-black w-full aspect-video flex justify-center items-center relative">
                        <video
                            src={currentLesson.videoUrl}
                            controls
                            autoPlay
                            className="w-full h-full max-h-[70vh] object-contain"
                            controlsList="nodownload" // Tùy chọn chống tải xuống cơ bản
                        />
                    </div>

                    {/* Khu vực Tabs bên dưới */}
                    <div className="p-6 md:p-10 max-w-5xl mx-auto w-full">
                        <h2 className="text-2xl font-bold text-learnova-dark mb-6">{currentLesson.title}</h2>
                        <Tabs defaultActiveKey="1" items={tabItems} className="learnova-learning-tabs" />
                    </div>
                </main>

                {/* CỘT PHẢI: SIDEBAR MỤC LỤC */}
                <aside className="w-80 lg:w-96 border-l border-gray-200 bg-white overflow-y-auto hidden md:flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                        <h2 className="font-bold text-lg text-learnova-dark m-0">Nội dung khóa học</h2>
                    </div>

                    <Collapse
                        defaultActiveKey={course?.sections.map((_: any, i: number) => i.toString())}
                        expandIconPosition="end"
                        className="learnova-curriculum border-none bg-white rounded-none"
                        ghost
                    >
                        {course?.sections.map((section: any, index: number) => (
                            <Panel
                                header={
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[15px] text-learnova-dark">{section.title}</span>
                                        <span className="text-xs text-gray-500 font-normal mt-1">
                                            0 / {section.lessons.length} | {section.lessons.reduce((acc: any, cur: any) => acc + parseFloat(cur.durationString.replace(':', '.')), 0).toFixed(0)} phút
                                        </span>
                                    </div>
                                }
                                key={index.toString()}
                                className="bg-[#f7f9fa] border-b border-gray-200"
                            >
                                <ul className="list-none p-0 m-0 bg-white">
                                    {section.lessons.map((lesson: any) => {
                                        const isActive = lesson.id === lessonId;
                                        const canAccess = hasEnrolled || lesson.isPreviewable;

                                        return (
                                            <li
                                                key={lesson.id}
                                                className={`flex gap-3 py-3 px-4 border-b border-gray-50 cursor-pointer transition-colors
                          ${isActive ? 'bg-[#e6f2f5]' : 'hover:bg-gray-50'}
                          ${!canAccess ? 'opacity-60 cursor-not-allowed' : ''}
                        `}
                                                onClick={() => {
                                                    if (canAccess && !isActive) {
                                                        router.push(`/learn/${courseId}/lesson/${lesson.id}`);
                                                    }
                                                }}
                                            >
                                                <div className="mt-0.5">
                                                    {/* Trạng thái xem thử / Hoàn thành / Khóa */}
                                                    {hasEnrolled ? (
                                                        <div className="w-4 h-4 rounded-full border border-gray-400 mt-1" /> // Box tick hoàn thành
                                                    ) : (
                                                        !canAccess ? <LockOutlined className="text-gray-400" /> : <PlayCircleOutlined className="text-gray-400" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <span className={`text-[14px] line-clamp-2 leading-snug
                            ${isActive ? 'font-bold text-learnova-dark' : 'text-gray-700'}
                          `}>
                                                        {lesson.title}
                                                    </span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <PlayCircleOutlined className="text-[10px] text-gray-400" />
                                                        <span className="text-xs text-gray-500">{lesson.durationString}</span>
                                                        {!hasEnrolled && lesson.isPreviewable && (
                                                            <span className="text-[10px] bg-purple-100 text-learnova-purple px-1.5 py-0.5 rounded font-bold">Học thử</span>
                                                        )}
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

            {/* Tinh chỉnh CSS cho Tabs và Sidebar */}
            <style jsx global>{`
        /* Chỉnh style Tab theo chuẩn Udemy */
        .learnova-learning-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #d1d7dc !important;
        }
        .learnova-learning-tabs .ant-tabs-ink-bar {
          background: var(--color-learnova-dark) !important;
          height: 3px !important;
        }
        .learnova-learning-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: var(--color-learnova-dark) !important;
        }
        .learnova-learning-tabs .ant-tabs-tab:hover {
          color: var(--color-learnova-dark) !important;
        }
        
        /* Chỉnh khoảng cách Collapse của Sidebar */
        .learnova-curriculum .ant-collapse-header {
          padding: 16px 20px !important;
        }
        .learnova-curriculum .ant-collapse-content-box {
          padding: 0 !important;
        }
      `}</style>
        </div>
    );
}