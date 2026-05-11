"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCourseStore } from "@/store/useCourseStore";
import { Avatar, Typography, Skeleton, Button, Card, Row, Col } from "antd";
import { UserOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
const { Title, Text } = Typography;

export default function Home() {
  const { user } = useAuthStore();
  const { trendingCourses, isLoading, fetchTrendingCourses } = useCourseStore();

  useEffect(() => {
    fetchTrendingCourses();
  }, [fetchTrendingCourses]);

  return (
    <div className="pb-20 bg-white">
      {/* PHẦN CHÀO MỪNG */}
      <section className="bg-learnova-light-gray py-12 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Sử dụng dữ liệu động từ user, nếu chưa đăng nhập thì hiển thị chữ "bạn" */}
          <h1 className="text-h2 mb-2">
            Chào mừng {user?.fullName || "bạn"} đã trở lại!
          </h1>
          <p className="text-body">
            Học tập mỗi ngày để mở rộng cánh cửa tương lai.
          </p>
        </div>
      </section>

      {user && (
        <section className="max-w-7xl mx-auto px-6 mt-12">
          {/* Header section sử dụng text-h2 đồng nhất */}
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-h2 m-0">Tiếp tục việc học của bạn</h2>
            <Link
              href="/my-learning"
              className="text-learnova-purple font-bold hover:text-learnova-purple-hover hover:underline flex items-center gap-1 mb-1"
            >
              Xem tất cả <RightOutlined className="text-xs" />
            </Link>
          </div>

          {/* Demo một thẻ khóa học đang học dở */}
          <Card
            hoverable
            className="max-w-md border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
            styles={{ body: { padding: '16px' } }}
          >
            <div className="flex gap-4">
              {/* Thumbnail ảnh khóa học */}
              <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0" />

              {/* Chi tiết tiến độ */}
              <div className="flex flex-col justify-center flex-1">
                {/* Sử dụng text-body và font-bold cho tiêu đề khóa học */}
                <h3 className="text-body font-bold mb-1 line-clamp-2 leading-tight">
                  Lập trình React cho người mới bắt đầu
                </h3>
                {/* Sử dụng text-caption cho tên bài giảng hiện tại */}
                <p className="text-caption mb-3">Bài 12: Quản lý State với Zustand</p>

                {/* Thanh tiến độ sử dụng màu learnova-purple */}
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-learnova-purple h-full w-[65%]" />
                </div>

                <span className="text-[12px] text-gray-500 font-medium mt-2 block">
                  Đã hoàn thành 65%
                </span>
              </div>
            </div>
          </Card>
        </section>
      )}

      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="mb-8">
          {/* Dùng chung class text-h2, đảm bảo đẹp y hệt tiêu đề trên */}
          <h2 className="text-h2 mb-1">
            Các khóa học thịnh hành
          </h2>
          <p className="text-caption">
            Cập nhật những xu hướng kiến thức mới nhất
          </p>
        </div>

        {isLoading ? (
          // Hiển thị Skeleton khi đang tải dữ liệu
          <Row gutter={[20, 24]}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Col key={i} xs={24} sm={12} md={8} lg={6} xl={4.8}>
                <Skeleton active />
              </Col>
            ))}
          </Row>
        ) : (
          // Hiển thị danh sách khóa học thực tế
          <Row gutter={[20, 24]}>
            {trendingCourses.map((item) => (
              <Col key={item.courseId} xs={24} sm={12} md={8} lg={6} xl={4.8}>
                <CourseCard
                  course={item.Course}
                  enrollmentCount={item.enrollmentCount}
                />
              </Col>
            ))}
          </Row>
        )}
      </section>
    </div>
  );
}