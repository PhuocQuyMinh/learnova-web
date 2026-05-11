"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
    Row, Col, Rate, Button, Collapse, Skeleton,
    Breadcrumb, Tag, message, Avatar, Modal, Divider, Spin
} from "antd";
import {
    PlayCircleOutlined,
    FileTextOutlined,
    ClockCircleOutlined,
    GlobalOutlined,
    HeartOutlined,
    CheckOutlined,
    LockOutlined,
    UserOutlined,
    DownloadOutlined,          // Icon cho tài nguyên tải xuống
    QuestionCircleOutlined,    // Icon cho bài kiểm tra/trắc nghiệm
    UsergroupAddOutlined,
    PlaySquareOutlined,
    StarOutlined
} from "@ant-design/icons";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";

const { Panel } = Collapse;

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter(); // Đã có sẵn
    const { user } = useAuthStore(); // Lấy thông tin user hiện tại

    const courseId = params.id;

    // State Khóa học
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // State Đánh giá (Reviews)
    const [highlightReviews, setHighlightReviews] = useState<any[]>([]);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [modalReviews, setModalReviews] = useState<any[]>([]);
    const [modalPage, setModalPage] = useState(1);
    const [modalHasMore, setModalHasMore] = useState(true);
    const [loadingModalReviews, setLoadingModalReviews] = useState(false);
    const [courseStats, setCourseStats] = useState<any>(null); // Thêm state quản lý Stats

    // State Modal Giảng viên
    const [isInstructorModalOpen, setIsInstructorModalOpen] = useState(false);
    const [instructorProfile, setInstructorProfile] = useState<any>(null);
    const [loadingInstructor, setLoadingInstructor] = useState(false);

    // Hàm xử lý khi click tên giảng viên
    const handleOpenInstructorModal = async (instructorId: number) => {
        setIsInstructorModalOpen(true);
        setLoadingInstructor(true);
        try {
            const response = await fetch(`http://localhost:8000/api/users/instructors/${instructorId}/profile`);
            const result = await response.json();
            if (result.status === "success") {
                setInstructorProfile(result.data.instructor);
            }
        } catch (error) {
            console.error("Lỗi tải thông tin giảng viên:", error);
        } finally {
            setLoadingInstructor(false);
        }
    };

    // Thêm 2 hàm xử lý click này:
    const handleBuyNow = () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để mua khóa học!");
            router.push("/login");
            return;
        }
        // Xử lý logic mua ngay cho user đã đăng nhập (sẽ làm ở các bước sau)
        message.success("Chuyển đến trang thanh toán...");
    };

    const handleAddToCart = () => {
        if (!user) {
            message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
            router.push("/login");
            return;
        }
        // Xử lý logic thêm giỏ hàng cho user đã đăng nhập (sẽ làm ở các bước sau)
        message.success("Đã thêm khóa học vào giỏ hàng!");
    };

    // 1. Fetch dữ liệu Khóa học và 4 Review nổi bật khi load trang
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [courseRes, reviewRes, statsRes] = await Promise.all([
                    fetch(`http://localhost:8000/api/store/coursesDetail/${courseId}`),
                    fetch(`http://localhost:8000/api/courses/${courseId}/reviews?mode=highlights`),
                    fetch(`http://localhost:8000/api/courses/${courseId}/stats`) // API mới
                ]);

                const courseResult = await courseRes.json();
                if (courseResult.status === "success") {
                    setCourse(courseResult.data.course);
                }

                const statsResult = await statsRes.json();
                if (statsResult.status === "success") {
                    setCourseStats(statsResult.data.stats);
                }

                const reviewResult = await reviewRes.json();
                if (reviewResult.status === "success") {
                    setHighlightReviews(reviewResult.data.reviews);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) fetchInitialData();
    }, [courseId]);

    // 2. Fetch Review có phân trang cho Modal
    const fetchPaginatedReviews = async (page: number) => {
        setLoadingModalReviews(true);
        try {
            const response = await fetch(
                `http://localhost:8000/api/courses/${courseId}/reviews?page=${page}&limit=5&sortBy=rating&order=DESC`
            );
            const result = await response.json();

            if (result.status === "success") {
                if (page === 1) {
                    setModalReviews(result.data.reviews);
                } else {
                    setModalReviews((prev) => [...prev, ...result.data.reviews]);
                }
                setModalPage(result.data.currentPage);
                setModalHasMore(result.data.currentPage < result.data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi tải thêm đánh giá:", error);
        } finally {
            setLoadingModalReviews(false);
        }
    };

    // Mở Modal và load trang 1 nếu chưa có data
    const handleOpenReviewModal = () => {
        setIsReviewModalOpen(true);
        if (modalReviews.length === 0) {
            fetchPaginatedReviews(1);
        }
    };

    // Hàm tiện ích: Lấy chữ cái đầu của tên (ví dụ: "Nguyễn Bá Học" -> "NH")
    const getInitials = (name: string) => {
        if (!name) return "U";
        const words = name.trim().split(" ");
        if (words.length > 1) {
            return (words[0][0] + words[words.length - 1][0]).toUpperCase();
        }
        return words[0][0].toUpperCase();
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
    };

    // Hàm render 1 item Review (Dùng chung cho cả ngoài trang và trong Modal)
    const renderReviewItem = (review: any) => (
        <div key={review.id} className="border-t border-gray-100 py-6 first:border-none">
            <div className="flex gap-4">
                <Avatar
                    size={48}
                    src={review.User?.avatarUrl}
                    icon={!review.User?.avatarUrl && <UserOutlined />}
                    className="bg-learnova-dark text-white font-bold flex-shrink-0"
                >
                    {!review.User?.avatarUrl && review.User?.fullName && getInitials(review.User.fullName)}
                </Avatar>
                <div className="flex-1">
                    <h4 className="font-bold text-learnova-dark mb-1">{review.User?.fullName || "Học viên ẩn danh"}</h4>
                    <div className="flex items-center gap-2 mb-3">
                        <Rate disabled defaultValue={review.rating} className="text-[12px] text-[#b4690e]" />
                        <span className="text-caption text-gray-400">
                            {new Date(review.createdAt).toLocaleDateString("vi-VN", { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                    </div>
                    <p className="text-body text-gray-700 whitespace-pre-line">{review.comment}</p>
                </div>
            </div>
        </div>
    );

    if (loading) return <div className="max-w-7xl mx-auto p-10"><Skeleton active /></div>;
    if (!course) return <div className="text-center py-20 text-h3">Không tìm thấy khóa học này.</div>;

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* 1. BANNER KHU VỰC TRÊN */}
            {/* Giảm pt-8 xuống pt-6 để thu hẹp khoảng cách mép trên */}
            <section className="bg-learnova-dark pt-6 pb-12 text-white border-b border-gray-700">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">

                        <Breadcrumb
                            /* Đặt mb-6 để nó cân xứng chính xác với pt-6 của thẻ section ở trên */
                            className="mb-8 text-sm font-medium"
                            items={[
                                { title: <Link href="/" className="!text-learnova-purple hover:underline">Trang chủ</Link> },
                                { title: <span className="text-gray-400">Khóa học</span> },
                                { title: <span className="text-gray-400">{course.title}</span> }
                            ]}
                        />

                        <div style={{ height: "15px" }}></div>

                        {/* THÊM mt-0: Ép thẻ h1 không được tự động sinh thêm khoảng trống phía trên */}
                        <h1 className="text-4xl font-bold mt-0 mb-5 leading-tight">
                            {course.title}
                        </h1>

                        <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                            {course.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                            <Tag color="#A435F0" className="font-bold border-none px-3 py-1">Bán chạy</Tag>
                            <div className="flex items-center gap-1">
                                <span className="text-orange-400 font-bold text-base">{course.averageRating}</span>
                                <Rate disabled defaultValue={course.averageRating} allowHalf className="text-xs text-orange-400" />
                                <span className="text-blue-400 hover:underline cursor-pointer" onClick={handleOpenReviewModal}>
                                    ({course.reviewCount} đánh giá)
                                </span>
                            </div>
                            {/* Thêm phần hiển thị số lượng học viên tại đây */}
                            <span className="text-white">
                                {course.enrollmentCount.toLocaleString('vi-VN')} học viên
                            </span>
                            <span className="text-gray-300">Giảng viên: <span
                                className="text-blue-400 hover:underline cursor-pointer transition-all"
                                onClick={() => handleOpenInstructorModal(course.instructorId)}
                            >{course.instructor.fullName}</span></span>
                        </div>

                        <div className="flex items-center gap-6 mt-6 text-sm text-gray-300">
                            <span className="flex items-center gap-2"><ClockCircleOutlined /> Cập nhật lần cuối {new Date(course.updatedAt).toLocaleDateString("vi-VN")}</span>
                            <span className="flex items-center gap-2"><GlobalOutlined /> Tiếng Việt</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 2. NỘI DUNG CHÍNH & SIDEBAR */}
            <div className="max-w-7xl mx-auto px-6 py-12 relative">
                <Row gutter={[48, 32]}>
                    {/* CỘT TRÁI: CHI TIẾT & CHƯƠNG TRÌNH HỌC */}
                    <Col xs={24} lg={16}>

                        {/* 1. NỘI DUNG CHI TIẾT (COURSE CONTENT) - Hiển thị trước mục lục */}
                        {course.courseContent && (
                            <div className="mb-12 p-6 border border-gray-200 rounded-sm bg-gray-50/30">
                                <h2 className="text-h2 mb-6">Bạn sẽ học được gì?</h2>
                                <div
                                    /* Đã xóa các class ngoặc vuông lỗi, thay bằng class learnova-html-content */
                                    className="text-body max-w-none learnova-html-content"
                                    dangerouslySetInnerHTML={{ __html: course.courseContent }}
                                />
                            </div>
                        )}

                        {/* Nội dung khóa học (Curriculum) */}
                        <div className="mb-12">
                            <h2 className="text-h2 mb-6">Nội dung khóa học</h2>
                            <div className="flex justify-between mb-4 text-sm text-gray-600">
                                <span>{course.sections.length} chương • {course.sections.reduce((acc: any, sec: any) => acc + sec.lessons.length, 0)} bài học</span>
                                <span className="text-learnova-purple font-bold cursor-pointer">Mở rộng tất cả</span>
                            </div>

                            <Collapse
                                defaultActiveKey={['0']}
                                expandIconPlacement="end"
                                className="learnova-curriculum border-gray-200"
                            >
                                {course.sections.map((section: any, index: number) => (
                                    <Panel
                                        header={<span className="font-bold text-base">{section.title}</span>}
                                        key={index}
                                        extra={<span className="text-gray-500 text-sm">{section.lessons.length} bài học</span>}
                                    >
                                        <ul className="list-none p-0 m-0">
                                            {section.lessons.map((lesson: any) => (
                                                <li key={lesson.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-none">
                                                    <div className="flex items-center gap-3">
                                                        {lesson.isPreviewable ? <PlayCircleOutlined className="text-gray-400" /> : <LockOutlined className="text-gray-400" />}
                                                        <span className={lesson.isPreviewable ? "text-gray-700" : "text-gray-500"}>
                                                            {lesson.title}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-4">
                                                        {lesson.isPreviewable && (
                                                            <Link
                                                                href={`/learn/${courseId}/lesson/${lesson.id}`}
                                                                className="!text-[#A435F0] hover:!text-[#8e2ce0] underline cursor-pointer text-sm font-medium transition-colors"                                                            >
                                                                Học thử
                                                            </Link>
                                                        )}
                                                        <span className="text-gray-400 text-sm">{lesson.durationString}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </Panel>
                                ))}
                            </Collapse>
                        </div>

                        {/* 3. YÊU CẦU (PREREQUISITES) - Hiển thị sau mục lục */}
                        {course.prerequisites && (
                            <div className="mb-10">
                                <h2 className="text-h2 mb-4">Yêu cầu</h2>
                                <div
                                    className="text-body prose prose-slate"
                                    dangerouslySetInnerHTML={{ __html: course.prerequisites }}
                                />
                            </div>
                        )}

                        {/* 4. ĐỐI TƯỢNG HỌC VIÊN (TARGET AUDIENCE) - Hiển thị sau mục lục */}
                        {course.targetAudience && (
                            <div className="mb-10">
                                <h2 className="text-h2 mb-4">Đối tượng của khóa học này</h2>
                                <div
                                    className="text-body prose prose-slate"
                                    dangerouslySetInnerHTML={{ __html: course.targetAudience }}
                                />
                            </div>
                        )}

                        {/* KHU VỰC REVIEW HIGHLIGHTS */}
                        {highlightReviews.length > 0 && (
                            <div className="mb-12">
                                <h2 className="text-h2 mb-6 flex items-center gap-2">
                                    Đánh giá khóa học
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                    {highlightReviews.map(renderReviewItem)}
                                </div>

                                <div className="mt-6">
                                    <Button
                                        className="font-bold h-10 px-6 border-gray-900 text-gray-900 hover:!border-learnova-purple hover:!text-learnova-purple rounded-none transition-all"
                                        onClick={handleOpenReviewModal}
                                    >
                                        Xem thêm đánh giá
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Col>

                    {/* CỘT PHẢI: SIDEBAR MUA HÀNG */}
                    <Col xs={24} lg={8}>
                        <div className="lg:absolute lg:-top-64 lg:right-6 w-full max-w-[380px] bg-white border border-gray-200 shadow-xl z-10">
                            <div className="relative group cursor-pointer">
                                <img src={course.coverImage} alt={course.title} className="w-full aspect-video object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircleOutlined className="text-white text-5xl" />
                                </div>
                                <div className="absolute bottom-4 w-full text-center text-white font-bold text-sm">Xem trước khóa học</div>
                            </div>

                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-3xl font-bold text-gray-900">{formatPrice(course.price)}</span>
                                </div>

                                <div className="flex flex-col gap-3">
                                    <Button
                                        type="primary"
                                        size="large"
                                        className="h-12 !bg-learnova-purple hover:!bg-learnova-purple-hover border-none font-bold text-lg rounded-none transition-all"
                                        onClick={handleBuyNow}
                                    >
                                        Mua ngay
                                    </Button>
                                    <Button
                                        size="large"
                                        className="h-12 border-gray-900 text-gray-900 font-bold hover:!text-learnova-purple hover:!border-learnova-purple rounded-none transition-all"
                                        onClick={handleAddToCart}
                                    >
                                        Thêm vào giỏ hàng
                                    </Button>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="text-xs text-gray-500">Bảo đảm hoàn tiền trong 30 ngày</p>
                                </div>

                                <div className="mt-8">
                                    <h4 className="font-bold mb-3">Khóa học này bao gồm:</h4>
                                    <ul className="space-y-3 p-0 list-none text-sm text-gray-700">

                                        {/* Render động dựa trên dữ liệu API, chỉ hiện khi lớn hơn 0 */}
                                        {courseStats?.totalStudyHours > 0 && (
                                            <li className="flex items-center gap-3">
                                                <PlayCircleOutlined /> {courseStats.totalStudyHours} giờ video theo yêu cầu
                                            </li>
                                        )}

                                        {courseStats?.totalArticles > 0 && (
                                            <li className="flex items-center gap-3">
                                                <FileTextOutlined /> {courseStats.totalArticles} bài viết
                                            </li>
                                        )}

                                        {courseStats?.totalAttachments > 0 && (
                                            <li className="flex items-center gap-3">
                                                <DownloadOutlined /> {courseStats.totalAttachments} tài nguyên tải xuống
                                            </li>
                                        )}

                                        {courseStats?.totalQuizzes > 0 && (
                                            <li className="flex items-center gap-3">
                                                <QuestionCircleOutlined /> {courseStats.totalQuizzes} bài tập trắc nghiệm
                                            </li>
                                        )}
                                        <li className="flex items-center gap-3"><ClockCircleOutlined /> Truy cập trọn đời</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {/* 3. MODAL XEM TOÀN BỘ ĐÁNH GIÁ */}
            <Modal
                title={
                    <div className="text-h3 flex items-center gap-2 pb-4 border-b border-gray-200">
                        Đánh giá khóa học
                    </div>
                }
                open={isReviewModalOpen}
                onCancel={() => setIsReviewModalOpen(false)}
                footer={null}
                width={800}
                styles={{
                    body: { maxHeight: '70vh', overflowY: 'auto', paddingRight: '12px' }
                }}
                centered
            >
                <div className="flex flex-col gap-4 mt-4">
                    {modalReviews.map(renderReviewItem)}

                    {/* Nút Load More trong Modal */}
                    {modalHasMore && (
                        <div className="text-center py-6">
                            <Button
                                loading={loadingModalReviews}
                                onClick={() => fetchPaginatedReviews(modalPage + 1)}
                                className="font-bold h-10 border-gray-900 text-gray-900 hover:!border-learnova-purple hover:!text-learnova-purple rounded-none transition-all"
                            >
                                {loadingModalReviews ? "Đang tải..." : "Tải thêm đánh giá"}
                            </Button>
                        </div>
                    )}
                    {!modalHasMore && modalReviews.length > 0 && (
                        <Divider className="text-gray-400 text-sm">Bạn đã xem hết đánh giá</Divider>
                    )}
                </div>
            </Modal>
            {/* 4. MODAL THÔNG TIN GIẢNG VIÊN */}
            <Modal
                title={
                    <div className="text-h3 pb-4 border-b border-gray-200 text-learnova-dark">
                        Hồ sơ Giảng viên
                    </div>
                }
                open={isInstructorModalOpen}
                onCancel={() => setIsInstructorModalOpen(false)}
                footer={null}
                width={700}
                centered
            >
                {loadingInstructor ? (
                    <div className="flex justify-center py-12">
                        <Spin size="large" />
                    </div>
                ) : instructorProfile ? (
                    <div className="flex flex-col gap-6 mt-6">
                        {/* Header: Avatar + Tên */}
                        <div className="flex items-center gap-6">
                            <Avatar
                                size={80}
                                src={instructorProfile.avatarUrl}
                                icon={!instructorProfile.avatarUrl && <UserOutlined />}
                                className="bg-learnova-dark text-white font-bold text-2xl flex-shrink-0"
                            >
                                {!instructorProfile.avatarUrl && getInitials(instructorProfile.fullName)}
                            </Avatar>
                            <div>
                                <h3 className="text-2xl font-bold text-learnova-dark mb-1">
                                    {instructorProfile.fullName}
                                </h3>
                                {/* Ẩn email đi nếu không muốn học viên thấy, hoặc hiện mờ mờ */}
                                <p className="text-gray-500 text-sm">{instructorProfile.email}</p>
                            </div>
                        </div>

                        {/* Thống kê */}
                        <div className="flex flex-wrap gap-8 py-5 border-y border-gray-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Tổng học viên</span>
                                <span className="text-lg font-bold text-learnova-dark flex items-center gap-2">
                                    <UsergroupAddOutlined className="text-learnova-purple" />
                                    {instructorProfile.studentCount.toLocaleString('vi-VN')}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Lượt đánh giá</span>
                                <span className="text-lg font-bold text-learnova-dark flex items-center gap-2">
                                    <StarOutlined className="text-learnova-purple" />
                                    {instructorProfile.reviewCount.toLocaleString('vi-VN')}
                                </span>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Khóa học</span>
                                <span className="text-lg font-bold text-learnova-dark flex items-center gap-2">
                                    <PlaySquareOutlined className="text-learnova-purple" />
                                    {instructorProfile.coursesCount.toLocaleString('vi-VN')}
                                </span>
                            </div>
                        </div>

                        {/* Giới thiệu (Bio) */}
                        <div>
                            <h4 className="font-bold text-lg mb-3 text-learnova-dark">Về tôi</h4>
                            {instructorProfile.bio ? (
                                <div
                                    className="text-body prose prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: instructorProfile.bio }}
                                />
                            ) : (
                                <p className="text-gray-500 italic">Giảng viên này chưa cập nhật thông tin giới thiệu.</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-500">
                        Không thể tải thông tin giảng viên lúc này.
                    </div>
                )}
            </Modal>
            <style jsx global>{`
        .learnova-curriculum .ant-collapse-header {
          background: #f7f9fa !important;
          padding: 16px 24px !important;
        }
        .learnova-curriculum .ant-collapse-content-box {
          padding: 0 24px !important;
        }
      `}</style>
        </div >
    );
}