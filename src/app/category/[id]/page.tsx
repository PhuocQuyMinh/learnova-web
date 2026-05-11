"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { Row, Col, Skeleton, Pagination, Empty, Breadcrumb } from "antd";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";

export default function CategoryPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const categoryId = params.id;
    // Lấy số trang từ URL (ví dụ: ?page=2). Nếu không có, mặc định là trang 1.
    const pageQuery = searchParams.get("page");
    const currentPageParams = pageQuery ? parseInt(pageQuery, 10) : 1;

    // States lưu trữ dữ liệu
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoryName, setCategoryName] = useState("Danh mục khóa học");

    useEffect(() => {
        if (!categoryId) return;

        const fetchCourses = async () => {
            setLoading(true);
            try {
                // Gọi API với categoryId và page
                const response = await fetch(
                    `http://localhost:8000/api/store/search/courses?categoryId=${categoryId}&page=${currentPageParams}&limit=8`
                );
                const result = await response.json();

                if (result.status === "success") {
                    setCourses(result.data.courses);
                    setTotalItems(result.data.totalItems);
                    setCurrentPage(result.data.currentPage);

                    // Cập nhật tên danh mục hiển thị từ dữ liệu khóa học đầu tiên trả về
                    if (result.data.courses.length > 0 && result.data.courses[0].category) {
                        setCategoryName(result.data.courses[0].category.name);
                    }
                } else {
                    setCourses([]);
                }
            } catch (error) {
                console.error("Lỗi khi tải danh sách khóa học:", error);
                setCourses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [categoryId, currentPageParams]); // Sẽ fetch lại API nếu categoryId hoặc số trang thay đổi

    // Hàm xử lý khi người dùng nhấn chuyển trang
    const handlePageChange = (page: number) => {
        // 1. Cuộn mượt mà lên đầu danh sách
        window.scrollTo({ top: 0, behavior: "smooth" });
        // 2. Đẩy query parameter vào URL (Giúp người dùng có thể copy link gửi cho bạn bè)
        router.push(`/category/${categoryId}?page=${page}`);
    };

    return (
        <div className="pb-20 bg-white min-h-screen">
            {/* 1. HEADER CỦA TRANG DANH MỤC */}
            <section className="bg-learnova-light-gray py-12 px-6 border-b border-gray-200">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumb - Đường dẫn điều hướng */}
                    <Breadcrumb
                        items={[
                            { title: <Link href="/">Trang chủ</Link> },
                            { title: "Khám phá" },
                            { title: categoryName }
                        ]}
                        className="mb-4 text-learnova-purple font-medium"
                    />

                    <h1 className="text-h1 mb-2 text-learnova-dark">
                        Khóa học {categoryName}
                    </h1>
                    <p className="text-body">
                        Khám phá các khóa học chất lượng cao và cập nhật kỹ năng của bạn cùng Leanova.
                    </p>
                </div>
            </section>

            {/* 2. LƯỚI DANH SÁCH KHÓA HỌC */}
            <section className="max-w-7xl mx-auto px-6 mt-10">
                {loading ? (
                    // Hiển thị khung xương (Skeleton) khi đang tải API
                    <Row gutter={[20, 24]}>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <Col key={i} xs={24} sm={12} md={8} lg={6}>
                                <Skeleton.Node active style={{ width: '100%', height: 280 }} />
                            </Col>
                        ))}
                    </Row>
                ) : courses.length > 0 ? (
                    <>
                        <div className="mb-6 text-body font-medium text-gray-500">
                            Hiển thị {courses.length} trên tổng số {totalItems} khóa học
                        </div>

                        <Row gutter={[20, 24]}>
                            {courses.map((course) => (
                                <Col key={course.id} xs={24} sm={12} md={8} lg={6}>
                                    {/* Tái sử dụng CourseCard. 
                      Lưu ý: API search trả về 'reviewCount', nên truyền nó vào thay cho 'enrollmentCount' */}
                                    <CourseCard
                                        course={course}
                                        enrollmentCount={course.reviewCount || 0}
                                    />
                                </Col>
                            ))}
                        </Row>

                        {/* 3. THANH PHÂN TRANG (PAGINATION) */}
                        {totalItems > 8 && (
                            <div className="mt-14 flex justify-center">
                                <Pagination
                                    current={currentPage}
                                    total={totalItems}
                                    pageSize={8} // Cố định limit=8 theo API của bạn
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                    className="learnova-pagination"
                                />
                            </div>
                        )}
                    </>
                ) : (
                    // Trạng thái trống: Khi danh mục chưa có khóa học nào
                    <div className="py-24 flex justify-center">
                        <Empty
                            description={<span className="text-body text-gray-500">Chưa có khóa học nào trong danh mục này.</span>}
                        />
                    </div>
                )}
            </section>

            {/* CSS Ghi đè để đổi màu xanh mặc định của Pagination Antd thành màu Tím Leanova */}
            <style jsx global>{`
        .learnova-pagination .ant-pagination-item-active {
          border-color: var(--color-learnova-purple) !important;
          background-color: var(--color-learnova-purple) !important;
        }
        .learnova-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        .learnova-pagination .ant-pagination-item:hover {
          border-color: var(--color-learnova-purple-hover) !important;
        }
        .learnova-pagination .ant-pagination-item:hover a {
          color: var(--color-learnova-purple-hover) !important;
        }
        .learnova-pagination .ant-pagination-item-link:hover {
          color: var(--color-learnova-purple-hover) !important;
        }
      `}</style>
        </div>
    );
}