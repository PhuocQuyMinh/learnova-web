"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Row, Col, Select, InputNumber, Rate, Button, Pagination, Empty, Skeleton, Divider, Space } from "antd";
import { FilterOutlined } from "@ant-design/icons";
import CourseCard from "@/components/CourseCard";

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const keyword = searchParams.get("keyword") || "";
    const page = searchParams.get("page") || "1";
    const minPrice = searchParams.get("minPrice") || "";
    const maxPrice = searchParams.get("maxPrice") || "";
    const minRating = searchParams.get("minRating") || "0";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "DESC";

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams({
                page,
                limit: "8",
                keyword,
                minPrice,
                maxPrice,
                minRating,
                sortBy,
                order,
            });
            const response = await fetch(`http://localhost:8000/api/store/search/courses?${query.toString()}`);
            const result = await response.json();
            if (result.status === "success") {
                setData(result.data);
            }
        } catch (error) {
            console.error("Search Error:", error);
        } finally {
            setLoading(false);
        }
    }, [keyword, page, minPrice, maxPrice, minRating, sortBy, order]);

    useEffect(() => {
        fetchResults();
    }, [fetchResults]);

    const updateFilter = (newParams: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", "1");
        Object.entries(newParams).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        router.push(`/search?${params.toString()}`);
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
            <div className="mb-8">
                <h1 className="text-h2">
                    {data?.totalItems || 0} kết quả cho "{keyword}"
                </h1>
            </div>

            <Row gutter={[32, 32]}>
                {/* SIDEBAR: BỘ LỌC */}
                <Col xs={24} md={6}>
                    <div className="sticky top-24 space-y-8">
                        <div>
                            <h3 className="text-body font-bold mb-4 flex items-center gap-2 text-learnova-dark">
                                <FilterOutlined className="text-learnova-purple" /> Sắp xếp theo
                            </h3>
                            <Select
                                className="w-full learnova-select"
                                value={`${sortBy}-${order}`}
                                onChange={(val) => {
                                    const [s, o] = val.split("-");
                                    updateFilter({ sortBy: s, order: o });
                                }}
                                options={[
                                    { label: "Mới nhất", value: "createdAt-DESC" },
                                    { label: "Đánh giá cao nhất", value: "averageRating-DESC" },
                                    { label: "Giá: Thấp đến Cao", value: "price-ASC" },
                                    { label: "Giá: Cao đến Thấp", value: "price-DESC" },
                                ]}
                            />
                        </div>

                        <Divider />

                        <div>
                            <h3 className="text-body font-bold mb-4 text-learnova-dark">Đánh giá</h3>
                            <div className="space-y-2">
                                {[4.5, 4, 3, 2].map((r) => (
                                    <div
                                        key={r}
                                        className={`flex items-center gap-2 cursor-pointer transition-colors ${minRating === r.toString() ? 'text-learnova-purple font-bold' : 'text-gray-600 hover:text-learnova-purple'}`}
                                        onClick={() => updateFilter({ minRating: r.toString() })}
                                    >
                                        <Rate disabled defaultValue={r} className="text-[11px] text-[#b4690e]" />
                                        <span className="text-caption">từ {r} trở lên</span>
                                    </div>
                                ))}
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => updateFilter({ minRating: "0" })}
                                    className="p-0 text-gray-400 hover:!text-learnova-purple"
                                >
                                    Xóa chọn
                                </Button>
                            </div>
                        </div>

                        <Divider />

                        <div>
                            <h3 className="text-body font-bold mb-4 text-learnova-dark">Khoảng giá (VND)</h3>
                            <div className="flex flex-col gap-3">
                                <InputNumber
                                    placeholder="Giá thấp nhất"
                                    className="w-full !w-full"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    onBlur={(e) => updateFilter({ minPrice: e.target.value.replace(/,/g, "") })}
                                />
                                <InputNumber
                                    placeholder="Giá cao nhất"
                                    className="w-full !w-full"
                                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    onBlur={(e) => updateFilter({ maxPrice: e.target.value.replace(/,/g, "") })}
                                />
                            </div>
                        </div>

                        <Button
                            block
                            className="mt-4 border-learnova-purple text-learnova-purple hover:!bg-learnova-purple hover:!text-white font-bold transition-all"
                            onClick={() => router.push(`/search?keyword=${keyword}`)}
                        >
                            Xóa tất cả bộ lọc
                        </Button>
                    </div>
                </Col>

                {/* NỘI DUNG KẾT QUẢ */}
                <Col xs={24} md={18}>
                    {loading ? (
                        <Row gutter={[20, 24]}>
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Col key={i} xs={24} sm={12} lg={8}>
                                    <Skeleton active />
                                </Col>
                            ))}
                        </Row>
                    ) : data?.courses.length > 0 ? (
                        <>
                            <Row gutter={[20, 24]}>
                                {data.courses.map((course: any) => (
                                    <Col key={course.id} xs={24} sm={12} lg={8}>
                                        <CourseCard course={course} enrollmentCount={course.reviewCount} />
                                    </Col>
                                ))}
                            </Row>

                            <div className="mt-14 flex justify-center">
                                <Pagination
                                    current={data.currentPage}
                                    total={data.totalItems}
                                    pageSize={8}
                                    onChange={(p) => {
                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                        updateFilter({ page: p.toString() });
                                    }}
                                    showSizeChanger={false}
                                    className="learnova-pagination"
                                />
                            </div>
                        </>
                    ) : (
                        <Empty description="Không tìm thấy khóa học nào phù hợp." className="mt-20" />
                    )}
                </Col>
            </Row>

            <style jsx global>{`
        /* 1. Đồng bộ màu Text và Border của nút bấm */
        .ant-btn-default:hover {
          border-color: var(--color-learnova-purple) !important;
          color: var(--color-learnova-purple) !important;
        }

        /* 2. Cấu hình Pagination chuẩn màu Learnova */
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
          border-color: var(--color-learnova-purple-hover) !important;
        }

        /* 3. Đảm bảo InputNumber và Select dùng đúng màu highlight */
        .ant-input-number:hover, .ant-input-number-focused,
        .ant-select:hover .ant-select-selector, .ant-select-focused .ant-select-selector {
          border-color: var(--color-learnova-purple) !important;
          box-shadow: 0 0 0 2px rgba(164, 53, 240, 0.1) !important;
        }

        /* 4. Ép InputNumber rộng 100% Sidebar */
        .ant-input-number {
          width: 100% !important;
        }
      `}</style>
        </div>
    );
}