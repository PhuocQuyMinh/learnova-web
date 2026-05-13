"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
    Button, Card, Form, Input, InputNumber, Select, Tabs,
    Upload, message, Typography, Collapse, Space, Modal,
    Empty, Tag, Skeleton, Divider, Row, Col, Tooltip
} from "antd";
import {
    LeftOutlined, SaveOutlined, PlusOutlined, VideoCameraOutlined,
    FileTextOutlined, DeleteOutlined, EditOutlined, UploadOutlined,
    CloudUploadOutlined, EyeOutlined, PaperClipOutlined,
    CheckSquareOutlined, InfoCircleOutlined, AppstoreOutlined, MenuOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;
const { Option, OptGroup } = Select;

export default function CourseEditPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id || params.courseId;
    const { token } = useAuthStore();
    const { categories, fetchCategories } = useCategoryStore();

    // -- STATE QUẢN LÝ THÔNG TIN CHUNG --
    const [formInfo] = Form.useForm();
    const [courseData, setCourseData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [coverFile, setCoverFile] = useState<any>(null);
    const [previewImage, setPreviewImage] = useState("");

    // -- STATE QUẢN LÝ CURRICULUM (CHƯƠNG & BÀI HỌC) --
    const [openSectionKeys, setOpenSectionKeys] = useState<string[]>([]);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [activeSectionId, setActiveSectionId] = useState<number | null>(null);
    const [lessonType, setLessonType] = useState<"Video" | "Article">("Video");
    const [videoFile, setVideoFile] = useState<any>(null);

    // -- STATE QUẢN LÝ ATTACHMENT & QUIZZES --
    const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
    const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
    const [attachmentFile, setAttachmentFile] = useState<any>(null);

    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [isQuizDetailModalOpen, setIsQuizDetailModalOpen] = useState(false);
    const [viewingQuiz, setViewingQuiz] = useState<any>(null);

    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
    const [activeQuizId, setActiveQuizId] = useState<number | null>(null);
    const [questionForm] = Form.useForm();
    const watchedChoices = Form.useWatch('choices', questionForm); // Hook theo dõi đáp án an toàn

    // ==========================================
    // 1. FETCH DỮ LIỆU
    // ==========================================
    const fetchCourseDetail = async () => {
        try {
            const res = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const result = await res.json();
            if (res.ok) {
                const data = result.data.course;
                setCourseData(data);
                setPreviewImage(data.coverImage);

                // Đồng bộ lại dữ liệu Quiz đang xem (nếu có) để giao diện cập nhật ngay lập tức
                if (viewingQuiz) {
                    const updatedQuiz = data.sections
                        ?.flatMap((s: any) => s.lessons || [])
                        ?.flatMap((l: any) => l.quizzes || [])
                        ?.find((q: any) => q.id === viewingQuiz.id);
                    if (updatedQuiz) setViewingQuiz(updatedQuiz);
                }

                // Tự động mở tất cả các chương
                if (data.sections) {
                    setOpenSectionKeys(data.sections.map((s: any) => s.id.toString()));
                }

                formInfo.setFieldsValue({
                    title: data.title,
                    categoryId: data.categoryId,
                    price: data.price,
                    description: data.description,
                });
            }
        } catch (error) { message.error("Lỗi tải thông tin khóa học"); }
        finally { setIsLoading(false); }
    };

    useEffect(() => {
        fetchCourseDetail();
        fetchCategories();
    }, [courseId]);

    // ==========================================
    // 2. CÁC HÀM XỬ LÝ (HANDLERS)
    // ==========================================
    const handleUpdateInfo = async (values: any) => {
        setIsSaving(true);
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("categoryId", values.categoryId);
        formData.append("price", values.price);
        formData.append("description", values.description || "");
        if (coverFile) formData.append("coverImage", coverFile);

        try {
            const res = await fetch(`http://localhost:8000/api/courses/${courseId}`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                message.success("Đã lưu thông tin khóa học!");
                fetchCourseDetail();
            } else {
                const err = await res.json();
                message.error(err.message);
            }
        } catch (e) { message.error("Lỗi mạng!"); }
        finally { setIsSaving(false); }
    };

    const handleAddSection = async (values: any) => {
        try {
            const res = await fetch(`http://localhost:8000/api/courses/${courseId}/sections`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });
            if (res.ok) {
                message.success("Đã thêm chương học mới!");
                setIsSectionModalOpen(false);
                fetchCourseDetail();
            }
        } catch (e) { message.error("Lỗi khi thêm chương"); }
    };

    const handleAddLesson = async (values: any) => {
        if (lessonType === "Video" && !videoFile) return message.error("Vui lòng tải lên video bài giảng!");
        setIsSaving(true);
        const formData = new FormData();
        formData.append("title", values.title);
        formData.append("lessonType", lessonType);
        if (lessonType === "Video") {
            const actualVideo = videoFile.originFileObj || videoFile;
            formData.append("video", actualVideo);
        } else {
            formData.append("articleContent", values.articleContent || "");
        }

        try {
            const res = await fetch(`http://localhost:8000/api/courses/sections/${activeSectionId}/lessons`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                message.success("Đã thêm bài học thành công!");
                setIsLessonModalOpen(false);
                setVideoFile(null);
                fetchCourseDetail();
            } else {
                const err = await res.json();
                message.error(err.message || "Lỗi khi upload bài học!");
            }
        } catch (e) { message.error("Lỗi mạng khi upload bài học!"); }
        finally { setIsSaving(false); }
    };

    const handleAddAttachment = async (values: any) => {
        if (!attachmentFile) return message.error("Vui lòng chọn file tài liệu!");
        setIsSaving(true);
        const formData = new FormData();
        formData.append("fileName", values.fileName);
        formData.append("file", attachmentFile.originFileObj || attachmentFile);

        try {
            const res = await fetch(`http://localhost:8000/api/courses/lessons/${activeLessonId}/attachments`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                message.success("Đã thêm tài liệu thành công!");
                setIsAttachmentModalOpen(false);
                setAttachmentFile(null);
                fetchCourseDetail();
            }
        } catch (e) { message.error("Lỗi upload tài liệu"); }
        finally { setIsSaving(false); }
    };

    const handleAddQuiz = async (values: any) => {
        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/api/courses/sections/${activeLessonId}/quizzes`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });
            if (res.ok) {
                message.success("Đã tạo bài kiểm tra!");
                setIsQuizModalOpen(false);
                fetchCourseDetail();
            }
        } catch (e) { message.error("Lỗi tạo bài tập"); }
        finally { setIsSaving(false); }
    };

    const handleAddQuestion = async (values: any) => {
        const hasCorrect = values.choices.some((c: any) => c.isCorrect);
        if (!hasCorrect) return message.warning("Vui lòng đánh dấu ít nhất 1 đáp án đúng (✓) !");

        setIsSaving(true);
        try {
            const res = await fetch(`http://localhost:8000/api/courses/quizzes/${activeQuizId}/questions`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });

            if (res.ok) {
                message.success("Đã thêm câu hỏi vào bài kiểm tra!");
                setIsQuestionModalOpen(false);
                questionForm.resetFields();
                fetchCourseDetail();
            } else {
                const err = await res.json();
                message.error(err.message || "Có lỗi xảy ra!");
            }
        } catch (e) { message.error("Lỗi khi thêm câu hỏi!"); }
        finally { setIsSaving(false); }
    };

    // ==========================================
    // 3. GIAO DIỆN (RENDER)
    // ==========================================
    if (isLoading) return <div className="p-10 max-w-5xl mx-auto"><Skeleton active paragraph={{ rows: 10 }} /></div>;

    return (
        <div className="min-h-screen bg-[#f3f4f6] pb-20 font-sans">

            {/* HEADER - ĐÃ FIX LỖI STICKY ĐÈ LOGO & CĂN LỀ NÚT BẤM */}
            <div className="bg-white border-b border-gray-200 px-8 py-5 shadow-sm relative z-10">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-5">
                        <Button
                            icon={<LeftOutlined />}
                            shape="circle"
                            size="large"
                            className="border-gray-300 hover:border-learnova-purple hover:text-learnova-purple flex-shrink-0 flex items-center justify-center"
                            onClick={() => router.push("/instructor/courses")}
                        />
                        <div className="flex flex-col justify-center">
                            <Title level={4} className="!m-0 !text-gray-800 font-extrabold tracking-tight leading-none">
                                {courseData?.title || 'Đang tải...'}
                            </Title>
                            <div className="flex items-center gap-2 mt-2">
                                <Tag color={courseData?.status === 'Published' ? 'green' : 'orange'} className="rounded-full px-3 m-0 font-medium border-none shadow-sm flex items-center">
                                    {courseData?.status === 'Published' ? 'Đã xuất bản' : 'Bản nháp'}
                                </Tag>
                                <span className="text-xs text-gray-400 font-medium pt-0.5">ID: #{courseData?.id}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3" style={{ marginRight: '50px' }}>
                        <Button
                            size="large"
                            icon={<EyeOutlined />}
                            className="rounded-full font-medium border-gray-300 hover:!border-learnova-purple hover:!text-learnova-purple"
                        >
                            Xem trước
                        </Button>
                        <Button
                            size="large"
                            type="primary"
                            className="rounded-full !bg-learnova-purple hover:!bg-purple-700 font-bold border-none shadow-md px-8"
                        >
                            Gửi duyệt khóa học
                        </Button>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="max-w-6xl mx-auto px-6 py-10">
                <Tabs
                    defaultActiveKey="1"
                    size="large"
                    className="learnova-premium-tabs"
                    items={[
                        {
                            key: "1",
                            label: <span className="font-bold text-base px-6 flex items-center gap-2"><AppstoreOutlined /> Thông tin chung</span>,
                            children: (
                                <Card className="rounded-2xl border-none shadow-sm overflow-hidden" bodyStyle={{ padding: '32px' }}>
                                    <Form form={formInfo} layout="vertical" onFinish={handleUpdateInfo}>
                                        <Row gutter={40}>
                                            <Col span={16} className="flex flex-col gap-2">
                                                <Form.Item name="title" label={<span className="font-bold text-gray-700 text-base">Tiêu đề khóa học</span>} rules={[{ required: true }]}>
                                                    <Input size="large" className="rounded-xl bg-gray-50 hover:bg-white focus:bg-white text-base py-2.5" placeholder="Nhập tên khóa học..." />
                                                </Form.Item>

                                                <Row gutter={24}>
                                                    <Col span={12}>
                                                        <Form.Item name="categoryId" label={<span className="font-bold text-gray-700 text-base">Danh mục</span>} rules={[{ required: true }]}>
                                                            <Select size="large" className="w-full">
                                                                {categories.map((cat: any) => (
                                                                    <OptGroup label={cat.name} key={cat.id}>
                                                                        {cat.children?.map((child: any) => (
                                                                            <Option value={child.id} key={child.id}>{child.name}</Option>
                                                                        ))}
                                                                    </OptGroup>
                                                                ))}
                                                            </Select>
                                                        </Form.Item>
                                                    </Col>
                                                    <Col span={12}>
                                                        <Form.Item name="price" label={<span className="font-bold text-gray-700 text-base">Giá bán (VNĐ)</span>} rules={[{ required: true }]}>
                                                            <InputNumber
                                                                size="large" className="w-full rounded-xl bg-gray-50"
                                                                formatter={(val: any) => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                                                parser={(val: any) => val?.replace(/\$\s?|(,*)/g, '')}
                                                            />
                                                        </Form.Item>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            <Col span={8}>
                                                <Form.Item label={<span className="font-bold text-gray-700 text-base">Ảnh bìa khóa học</span>}>
                                                    <div className="border-2 border-dashed border-purple-200 rounded-2xl p-2 text-center bg-purple-50/30 aspect-video flex flex-col items-center justify-center relative overflow-hidden group transition-all hover:border-purple-400 hover:bg-purple-50">
                                                        {previewImage ? (
                                                            <img src={previewImage} className="w-full h-full object-cover rounded-xl shadow-sm" />
                                                        ) : (
                                                            <div className="flex flex-col items-center text-purple-400">
                                                                <CloudUploadOutlined className="text-5xl mb-2" />
                                                                <span className="font-medium text-sm">Nhấn để tải ảnh lên</span>
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gray-900/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all backdrop-blur-sm rounded-xl">
                                                            <Upload
                                                                showUploadList={false}
                                                                beforeUpload={(file) => {
                                                                    setCoverFile(file);
                                                                    setPreviewImage(URL.createObjectURL(file));
                                                                    return false;
                                                                }}
                                                            >
                                                                <Button icon={<UploadOutlined />} className="rounded-full border-none font-bold shadow-lg">Thay đổi ảnh bìa</Button>
                                                            </Upload>
                                                        </div>
                                                    </div>
                                                    <Text className="text-[12px] text-gray-400 mt-3 block italic text-center">Định dạng 16:9, tối đa 2MB (VD: 1280x720)</Text>
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Divider className="my-6 border-gray-100" />
                                        <Form.Item name="description" label={<span className="font-bold text-gray-700 text-base">Mô tả chi tiết</span>}>
                                            <Input.TextArea rows={8} className="rounded-xl bg-gray-50 hover:bg-white focus:bg-white p-4 text-base leading-relaxed" placeholder="Chia sẻ những gì học viên sẽ đạt được sau khóa học này..." />
                                        </Form.Item>

                                        <div className="flex justify-end mt-8">
                                            <Button type="primary" size="large" icon={<SaveOutlined />} htmlType="submit" loading={isSaving} className="!bg-gray-900 hover:!bg-gray-800 rounded-full font-bold border-none px-10 shadow-md">Lưu thay đổi</Button>
                                        </div>
                                    </Form>
                                </Card>
                            )
                        },
                        {
                            key: "2",
                            label: <span className="font-bold text-base px-6 flex items-center gap-2"><MenuOutlined /> Chương trình học</span>,
                            children: (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                                        <div>
                                            <Title level={4} className="!m-0 !text-gray-800 font-bold">Cấu trúc khóa học</Title>
                                            <Text className="text-gray-500 text-sm">Kéo thả để sắp xếp lại thứ tự bài học (Đang cập nhật)</Text>
                                        </div>
                                        {/* ĐÃ FIX MÀU NÚT THÊM CHƯƠNG MỚI */}
                                        <Button
                                            size="large"
                                            icon={<PlusOutlined />}
                                            onClick={() => setIsSectionModalOpen(true)}
                                            className="rounded-full bg-purple-50 !text-purple-600 font-bold !border-purple-200 hover:bg-purple-100 hover:!border-purple-300 hover:!text-purple-700 shadow-sm"
                                        >
                                            Thêm Chương mới
                                        </Button>
                                    </div>

                                    {courseData?.sections?.length > 0 ? (
                                        <Collapse
                                            expandIconPosition="end"
                                            className="learnova-curriculum-edit bg-transparent border-none space-y-5"
                                            activeKey={openSectionKeys}
                                            onChange={(keys) => setOpenSectionKeys(keys as string[])}
                                        >
                                            {courseData.sections.map((section: any, sIdx: number) => (
                                                <Panel
                                                    header={
                                                        <div className="flex items-center justify-between w-full pr-4">
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-gray-900 text-white font-bold w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
                                                                    {sIdx + 1}
                                                                </div>
                                                                <span className="font-bold text-gray-800 text-lg">{section.title}</span>
                                                                <Tag className="rounded-full bg-purple-50 text-purple-600 border-purple-100 px-3 py-0.5 font-medium m-0">
                                                                    {section.lessons?.length || 0} bài học
                                                                </Tag>
                                                            </div>
                                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                <Tooltip title="Sửa tên chương"><Button size="small" type="text" icon={<EditOutlined />} className="text-gray-400 hover:text-learnova-purple hover:bg-purple-50" /></Tooltip>
                                                                <Tooltip title="Xóa chương"><Button size="small" type="text" danger icon={<DeleteOutlined />} className="text-gray-400 hover:text-red-500 hover:bg-red-50" /></Tooltip>
                                                            </div>
                                                        </div>
                                                    }
                                                    key={section.id.toString()}
                                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-5 shadow-sm hover:shadow-md transition-shadow"
                                                >
                                                    <div className="p-5 bg-[#f8fafc] space-y-4">
                                                        {section.lessons && section.lessons.length > 0 ? (
                                                            section.lessons.map((lesson: any, lIdx: number) => (
                                                                <div key={lesson.id} className="bg-white border border-gray-200 rounded-xl p-4 group hover:border-purple-300 hover:shadow-md transition-all relative overflow-hidden">
                                                                    {/* Hàng 1: Tiêu đề */}
                                                                    <div className="flex items-center justify-between mb-3">
                                                                        <div className="flex items-center gap-4">
                                                                            <div className="bg-gray-100 text-gray-500 font-mono text-xs w-7 h-7 flex items-center justify-center rounded-full border border-gray-200">
                                                                                {lIdx + 1}
                                                                            </div>
                                                                            <span className="font-bold text-gray-800 text-base">{lesson.title}</span>

                                                                            {lesson.lessonType === "Video" ? (
                                                                                <Tag color="blue" icon={<VideoCameraOutlined />} className="rounded-full px-3 border-none font-medium bg-blue-50 text-blue-600">Video</Tag>
                                                                            ) : (
                                                                                <Tag color="orange" icon={<FileTextOutlined />} className="rounded-full px-3 border-none font-medium bg-orange-50 text-orange-600">Bài viết</Tag>
                                                                            )}

                                                                            {lesson.isPreviewable && <Tag color="cyan" className="rounded-full px-3 border-none font-medium">Học thử</Tag>}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white pl-2 rounded-full shadow-sm border border-gray-100">
                                                                            <Tooltip title="Chỉnh sửa"><Button shape="circle" type="text" icon={<EditOutlined />} className="hover:text-learnova-purple" /></Tooltip>
                                                                            <Tooltip title="Xóa bài học"><Button shape="circle" type="text" danger icon={<DeleteOutlined />} /></Tooltip>
                                                                        </div>
                                                                    </div>

                                                                    {/* Hàng 2: Video URL */}
                                                                    {lesson.lessonType === "Video" && lesson.videoUrl && (
                                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 ml-11 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                            <CloudUploadOutlined className="text-blue-400 text-sm" />
                                                                            <a href={lesson.videoUrl} target="_blank" className="text-blue-500 hover:underline truncate max-w-[500px] font-mono">{lesson.videoUrl}</a>
                                                                        </div>
                                                                    )}

                                                                    {/* Hàng 3: Tài liệu & Bài tập */}
                                                                    <div className="ml-11 flex flex-wrap gap-5 mt-4 pt-4 border-t border-gray-100">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">Tài liệu</span>
                                                                            {lesson.attachments && lesson.attachments.length > 0 ? (
                                                                                lesson.attachments.map((file: any) => (
                                                                                    <Tag key={file.id} icon={<PaperClipOutlined />} className="bg-white border-gray-200 text-gray-600 rounded-full px-3 hover:bg-gray-50 cursor-pointer">
                                                                                        {file.fileName}
                                                                                    </Tag>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400 italic mr-1">Trống</span>
                                                                            )}
                                                                            <Tooltip title="Thêm tài liệu">
                                                                                <Button size="small" type="dashed" shape="circle" icon={<PlusOutlined />} className="text-[10px] hover:border-learnova-purple hover:text-learnova-purple"
                                                                                    onClick={() => { setActiveLessonId(lesson.id); setIsAttachmentModalOpen(true); }}
                                                                                />
                                                                            </Tooltip>
                                                                        </div>

                                                                        <div className="w-[1px] h-6 bg-gray-200"></div>

                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded">Bài tập</span>
                                                                            {lesson.quizzes && lesson.quizzes.length > 0 ? (
                                                                                lesson.quizzes.map((quiz: any) => (
                                                                                    <Tooltip title="Xem chi tiết & Quản lý câu hỏi" key={quiz.id}>
                                                                                        <Tag
                                                                                            color="purple" icon={<CheckSquareOutlined />}
                                                                                            className="m-0 font-medium cursor-pointer hover:bg-purple-100 hover:border-purple-300 transition-all px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border-purple-200"
                                                                                            onClick={() => { setViewingQuiz(quiz); setIsQuizDetailModalOpen(true); }}
                                                                                        >
                                                                                            {quiz.title}
                                                                                            <span className="bg-white text-learnova-purple px-2 rounded-full text-[10px] font-bold shadow-sm border border-purple-100 ml-1">
                                                                                                {quiz.questions?.length || 0} câu
                                                                                            </span>
                                                                                        </Tag>
                                                                                    </Tooltip>
                                                                                ))
                                                                            ) : (
                                                                                <span className="text-xs text-gray-400 italic mr-1">Trống</span>
                                                                            )}
                                                                            <Tooltip title="Tạo bài trắc nghiệm mới">
                                                                                <Button size="small" type="dashed" shape="circle" icon={<PlusOutlined />} className="text-[10px] hover:border-learnova-purple hover:text-learnova-purple"
                                                                                    onClick={() => { setActiveLessonId(lesson.id); setIsQuizModalOpen(true); }}
                                                                                />
                                                                            </Tooltip>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="bg-white border border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                                                                <div className="bg-purple-50 p-3 rounded-full mb-3"><AppstoreOutlined className="text-2xl text-purple-300" /></div>
                                                                <span className="text-gray-500 font-medium mb-1">Chương này chưa có nội dung</span>
                                                                <span className="text-xs text-gray-400 mb-4">Hãy thêm video bài giảng hoặc bài viết để bắt đầu</span>
                                                            </div>
                                                        )}

                                                        <div className="pt-2">
                                                            <Button
                                                                type="dashed" size="large" block icon={<PlusOutlined />}
                                                                onClick={() => { setActiveSectionId(section.id); setIsLessonModalOpen(true); }}
                                                                className="rounded-xl border-2 border-gray-200 hover:!border-learnova-purple hover:!text-learnova-purple font-medium bg-white h-12"
                                                            >
                                                                Thêm bài học mới vào chương này
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </Panel>
                                            ))}
                                        </Collapse>
                                    ) : (
                                        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 flex flex-col items-center text-center shadow-sm">
                                            <Empty description={false} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                            <Title level={4} className="mt-4 !text-gray-700">Khóa học của bạn chưa có chương nào</Title>
                                            <Text className="text-gray-500 mb-6 max-w-md">Bắt đầu xây dựng cấu trúc khóa học bằng cách tạo các chương (Ví dụ: Giới thiệu, Kiến thức cốt lõi, Tổng kết...).</Text>
                                            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsSectionModalOpen(true)} className="rounded-full !bg-learnova-purple font-bold border-none px-8">
                                                Tạo Chương Đầu Tiên
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        }
                    ]}
                />
            </div>

            {/* --- GLOBAL CSS CHO TABS --- */}
            <style jsx global>{`
                .learnova-premium-tabs .ant-tabs-nav { margin-bottom: 24px !important; }
                .learnova-premium-tabs .ant-tabs-nav::before { border-bottom: 1px solid #e5e7eb !important; }
                .learnova-premium-tabs .ant-tabs-tab { padding: 12px 0 !important; margin: 0 32px 0 0 !important; transition: all 0.3s; }
                .learnova-premium-tabs .ant-tabs-tab:hover { color: #A435F0 !important; }
                .learnova-premium-tabs .ant-tabs-tab-active .ant-tabs-tab-btn { color: #A435F0 !important; }
                .learnova-premium-tabs .ant-tabs-ink-bar { background: #A435F0 !important; height: 3px !important; border-radius: 3px 3px 0 0; }
                .learnova-curriculum-edit .ant-collapse-header { padding: 16px 20px !important; align-items: center !important; }
                .learnova-curriculum-edit .ant-collapse-content-box { padding: 0 !important; }
            `}</style>

            {/* ========================================== */}
            {/* CÁC MODAL THÊM SỬA DỮ LIỆU */}
            {/* ========================================== */}

            <Modal title={<span className="text-xl font-bold">Thêm chương học</span>} open={isSectionModalOpen} onCancel={() => setIsSectionModalOpen(false)} footer={null} centered className="rounded-2xl overflow-hidden">
                <Form layout="vertical" onFinish={handleAddSection} className="pt-4">
                    <Form.Item name="title" label={<span className="font-bold text-gray-700">Tên chương</span>} rules={[{ required: true }]}>
                        <Input size="large" placeholder="VD: Giới thiệu và Cài đặt môi trường" className="rounded-lg bg-gray-50 focus:bg-white" />
                    </Form.Item>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={() => setIsSectionModalOpen(false)} className="rounded-lg font-medium">Hủy</Button>
                        <Button size="large" type="primary" htmlType="submit" className="!bg-learnova-purple font-bold border-none rounded-lg px-8">Tạo chương</Button>
                    </div>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl font-bold">Thêm bài học mới</span>} open={isLessonModalOpen} onCancel={() => { setIsLessonModalOpen(false); setVideoFile(null); }} footer={null} width={650} centered className="rounded-2xl overflow-hidden">
                <Form layout="vertical" onFinish={handleAddLesson} className="pt-4">
                    <Form.Item name="title" label={<span className="font-bold text-gray-700">Tiêu đề bài học</span>} rules={[{ required: true }]}>
                        <Input size="large" placeholder="VD: Cách sử dụng useState cơ bản" className="rounded-lg bg-gray-50 focus:bg-white" />
                    </Form.Item>
                    <Form.Item label={<span className="font-bold text-gray-700">Loại nội dung</span>}>
                        <Select size="large" value={lessonType} onChange={(val: any) => setLessonType(val)} className="rounded-lg">
                            <Option value="Video"><div className="flex items-center gap-2"><VideoCameraOutlined className="text-blue-500" /> Video bài giảng</div></Option>
                            <Option value="Article"><div className="flex items-center gap-2"><FileTextOutlined className="text-orange-500" /> Bài viết (Văn bản)</div></Option>
                        </Select>
                    </Form.Item>

                    {lessonType === "Video" ? (
                        <Form.Item label={<span className="font-bold text-gray-700">Tải lên Video (.mp4)</span>} extra="Dung lượng tối đa: 500MB">
                            <Upload maxCount={1} beforeUpload={(file) => { setVideoFile(file); return false; }} onRemove={() => setVideoFile(null)}>
                                <Button size="large" icon={<UploadOutlined />} block className="rounded-lg border-dashed border-gray-300 hover:border-learnova-purple hover:text-learnova-purple bg-gray-50">Chọn Video từ máy tính</Button>
                            </Upload>
                        </Form.Item>
                    ) : (
                        <Form.Item name="articleContent" label={<span className="font-bold text-gray-700">Nội dung bài viết</span>}>
                            <Input.TextArea rows={8} placeholder="Soạn thảo nội dung..." className="rounded-lg bg-gray-50 focus:bg-white" />
                        </Form.Item>
                    )}

                    <div className="flex justify-end gap-3 mt-8">
                        <Button size="large" onClick={() => setIsLessonModalOpen(false)} className="rounded-lg font-medium">Hủy</Button>
                        <Button size="large" type="primary" htmlType="submit" loading={isSaving} className="!bg-learnova-purple font-bold border-none rounded-lg px-8">Tải lên bài học</Button>
                    </div>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl font-bold">Thêm tài liệu đính kèm</span>} open={isAttachmentModalOpen} onCancel={() => setIsAttachmentModalOpen(false)} footer={null} centered className="rounded-2xl overflow-hidden">
                <Form layout="vertical" onFinish={handleAddAttachment} className="pt-4">
                    <Form.Item name="fileName" label={<span className="font-bold text-gray-700">Tên hiển thị tài liệu</span>} rules={[{ required: true }]}>
                        <Input size="large" placeholder="VD: Slide bài giảng, Mã nguồn mẫu..." className="rounded-lg bg-gray-50 focus:bg-white" />
                    </Form.Item>
                    <Form.Item label={<span className="font-bold text-gray-700">Chọn tệp (PDF, ZIP, DOCX...)</span>}>
                        <Upload maxCount={1} beforeUpload={(file) => { setAttachmentFile(file); return false; }} onRemove={() => setAttachmentFile(null)}>
                            <Button size="large" icon={<UploadOutlined />} block className="rounded-lg border-dashed border-gray-300 hover:border-learnova-purple bg-gray-50">Chọn file từ máy tính</Button>
                        </Upload>
                    </Form.Item>
                    <div className="flex justify-end gap-3 mt-8">
                        <Button size="large" onClick={() => setIsAttachmentModalOpen(false)} className="rounded-lg font-medium">Hủy</Button>
                        <Button size="large" type="primary" htmlType="submit" loading={isSaving} className="!bg-gray-900 border-none rounded-lg px-8 font-bold">Tải lên tài liệu</Button>
                    </div>
                </Form>
            </Modal>

            <Modal title={<span className="text-xl font-bold">Tạo bài kiểm tra mới</span>} open={isQuizModalOpen} onCancel={() => setIsQuizModalOpen(false)} footer={null} centered className="rounded-2xl overflow-hidden">
                <Form layout="vertical" onFinish={handleAddQuiz} initialValues={{ passingScorePercent: 80 }} className="pt-4">
                    <Form.Item name="title" label={<span className="font-bold text-gray-700">Tiêu đề bài Quiz</span>} rules={[{ required: true }]}>
                        <Input size="large" placeholder="VD: Kiểm tra kiến thức chương 1" className="rounded-lg bg-gray-50 focus:bg-white" />
                    </Form.Item>
                    <Form.Item name="description" label={<span className="font-bold text-gray-700">Mô tả bài tập (Tùy chọn)</span>}>
                        <Input.TextArea rows={3} placeholder="Hướng dẫn làm bài..." className="rounded-lg bg-gray-50 focus:bg-white" />
                    </Form.Item>
                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="passingScorePercent" label={<span className="font-bold text-gray-700">Điểm đạt (%)</span>}>
                            <InputNumber size="large" min={0} max={100} className="w-full rounded-lg bg-gray-50" />
                        </Form.Item>
                        <Form.Item name="timeLimitMinutes" label={<span className="font-bold text-gray-700">Thời gian (Phút)</span>}>
                            <InputNumber size="large" min={1} className="w-full rounded-lg bg-gray-50" placeholder="Để trống nếu không giới hạn" />
                        </Form.Item>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button size="large" onClick={() => setIsQuizModalOpen(false)} className="rounded-lg font-medium">Hủy</Button>
                        <Button size="large" type="primary" htmlType="submit" loading={isSaving} className="!bg-learnova-purple border-none rounded-lg px-8 font-bold">Khởi tạo</Button>
                    </div>
                </Form>
            </Modal>

            <Modal title={<div className="text-xl font-bold text-gray-800 pb-3 border-b border-gray-100">Soạn thảo câu hỏi trắc nghiệm</div>} open={isQuestionModalOpen} onCancel={() => setIsQuestionModalOpen(false)} footer={null} width={800} centered>
                <div className="pt-4">
                    <Form form={questionForm} layout="vertical" onFinish={handleAddQuestion} requiredMark="optional">
                        <Form.Item name="questionText" label={<span className="font-bold text-base text-gray-800">1. Nội dung câu hỏi <span className="text-red-500">*</span></span>} rules={[{ required: true, message: 'Vui lòng nhập câu hỏi!' }]}>
                            <Input.TextArea rows={3} placeholder="Ví dụ: Đâu là đặc điểm của React Hooks?" className="bg-gray-50 text-base p-4 rounded-xl border-gray-200 focus:bg-white shadow-inner" />
                        </Form.Item>

                        <div className="mb-3 mt-8 flex justify-between items-end">
                            <span className="font-bold text-base text-gray-800">2. Các phương án trả lời</span>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 font-medium">Tích (✓) để chọn đáp án đúng</span>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 mb-8 shadow-sm">
                            <Form.List name="choices">
                                {(fields, { add, remove }) => (
                                    <div className="flex flex-col gap-3">
                                        {fields.map(({ key, name, ...restField }, index) => {
                                            const isCorrect = watchedChoices?.[name]?.isCorrect;
                                            return (
                                                <div key={key} className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${isCorrect ? 'bg-green-50/70 border-green-300 shadow-sm' : 'bg-white border-gray-200'}`}>
                                                    <Form.Item {...restField} name={[name, 'isCorrect']} valuePropName="checked" className="mb-0 mt-1">
                                                        <Tooltip title="Chọn làm đáp án đúng">
                                                            <Button shape="circle" size="large" className={`flex items-center justify-center transition-transform hover:scale-105 ${isCorrect ? '!bg-green-500 !text-white !border-green-500 shadow-md' : 'text-gray-300 border-gray-300 hover:border-green-400 hover:text-green-400 bg-gray-50'}`} onClick={() => {
                                                                const currentChoices = questionForm.getFieldValue('choices');
                                                                const newChoices = currentChoices.map((c: any, i: number) => ({ ...c, isCorrect: i === name }));
                                                                questionForm.setFieldsValue({ choices: newChoices });
                                                            }}>✓</Button>
                                                        </Tooltip>
                                                    </Form.Item>
                                                    <div className="flex-1">
                                                        <Form.Item {...restField} name={[name, 'text']} rules={[{ required: true, message: 'Nhập nội dung!' }]} className="mb-0">
                                                            <Input.TextArea autoSize={{ minRows: 1, maxRows: 3 }} placeholder={`Nhập phương án ${index + 1}...`} className={`text-base border-none shadow-none bg-transparent focus:bg-white focus:ring-1 focus:ring-purple-200 rounded-lg py-2 px-3 ${isCorrect ? 'font-medium text-green-900' : 'text-gray-700'}`} />
                                                        </Form.Item>
                                                    </div>
                                                    {fields.length > 2 && (
                                                        <Tooltip title="Xóa phương án">
                                                            <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} className="mt-1 opacity-40 hover:opacity-100 bg-red-50" />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {fields.length < 6 && (
                                            <Button type="dashed" onClick={() => add({ text: '', isCorrect: false })} block icon={<PlusOutlined />} className="h-12 mt-2 rounded-xl text-learnova-purple border-purple-200 hover:border-learnova-purple bg-purple-50/50 font-medium">Thêm phương án trả lời</Button>
                                        )}
                                    </div>
                                )}
                            </Form.List>
                        </div>

                        <Form.Item name="explanation" label={<span className="font-bold text-base text-gray-800">3. Giải thích (Tùy chọn)</span>} extra="Đoạn văn này sẽ hiện ra khi học viên chọn sai.">
                            <Input.TextArea rows={3} placeholder="Giải thích lý do tại sao đáp án kia lại đúng..." className="bg-gray-50 p-3 rounded-xl focus:bg-white" />
                        </Form.Item>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-6 mt-6">
                            <Button size="large" onClick={() => setIsQuestionModalOpen(false)} className="rounded-xl px-8 font-medium">Hủy bỏ</Button>
                            <Button size="large" type="primary" htmlType="submit" loading={isSaving} className="!bg-learnova-purple border-none rounded-xl px-10 font-bold shadow-md">Lưu câu hỏi</Button>
                        </div>
                    </Form>
                </div>
            </Modal>

            <Modal
                title={
                    <div className="flex items-center justify-between pr-8 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-100 p-3 rounded-xl"><CheckSquareOutlined className="text-learnova-purple text-2xl" /></div>
                            <div>
                                <div className="text-xl font-bold text-gray-900">{viewingQuiz?.title}</div>
                                <div className="text-sm text-gray-500 font-medium mt-0.5">Quản lý danh sách câu hỏi trắc nghiệm</div>
                            </div>
                        </div>
                        <Button size="large" type="primary" icon={<PlusOutlined />} className="!bg-learnova-purple border-none rounded-xl font-bold shadow-sm" onClick={() => { setActiveQuizId(viewingQuiz.id); setIsQuestionModalOpen(true); }}>Thêm câu hỏi</Button>
                    </div>
                }
                open={isQuizDetailModalOpen} onCancel={() => setIsQuizDetailModalOpen(false)} footer={null} width={900} centered bodyStyle={{ padding: '24px 32px', backgroundColor: '#f8fafc', maxHeight: '75vh', overflowY: 'auto' }} className="rounded-3xl overflow-hidden"
            >
                {viewingQuiz?.questions?.length > 0 ? (
                    <div className="flex flex-col gap-6">
                        {viewingQuiz.questions.map((q: any, index: number) => (
                            <Card key={q.id} className="rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow" bodyStyle={{ padding: '24px' }}>
                                <div className="flex justify-between items-start mb-5">
                                    <div className="flex gap-4">
                                        <span className="bg-gray-900 text-white w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm shrink-0 shadow-sm">{index + 1}</span>
                                        <div className="text-lg font-bold text-gray-800 pt-0.5 leading-snug">{q.questionText}</div>
                                    </div>
                                    <Button danger type="text" icon={<DeleteOutlined />} className="opacity-40 hover:opacity-100 bg-red-50 rounded-lg" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12">
                                    {(typeof q.choices === 'string' ? JSON.parse(q.choices) : q.choices || []).map((choice: any, cIdx: number) => (
                                        <div key={cIdx} className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${choice.isCorrect ? 'bg-green-50 border-green-300 text-green-800 shadow-sm' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ${choice.isCorrect ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-400'}`}>
                                                {choice.isCorrect ? '✓' : String.fromCharCode(65 + cIdx)}
                                            </div>
                                            <span className={`text-sm ${choice.isCorrect ? 'font-bold' : 'font-medium'}`}>{choice.text}</span>
                                        </div>
                                    ))}
                                </div>
                                {q.explanation && (
                                    <div className="mt-5 ml-12 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex gap-3">
                                        <InfoCircleOutlined className="text-blue-500 mt-0.5 text-lg" />
                                        <div className="text-sm text-blue-800 leading-relaxed"><strong>Giải thích:</strong> {q.explanation}</div>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="py-24 bg-white rounded-3xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-center shadow-sm">
                        <div className="bg-purple-50 p-4 rounded-full mb-4"><CheckSquareOutlined className="text-4xl text-purple-300" /></div>
                        <Title level={4} className="!text-gray-700 !mb-1">Chưa có câu hỏi nào</Title>
                        <Text className="text-gray-500 mb-6">Bắt đầu tạo bộ câu hỏi trắc nghiệm để đánh giá học viên.</Text>
                        <Button size="large" className="rounded-xl text-learnova-purple border-purple-200 bg-purple-50 hover:border-learnova-purple font-bold px-8" onClick={() => { setActiveQuizId(viewingQuiz.id); setIsQuestionModalOpen(true); }}>Soạn câu hỏi đầu tiên</Button>
                    </div>
                )}
            </Modal>
        </div>
    );
}