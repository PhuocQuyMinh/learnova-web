"use client";

import { Card, Typography, Rate, Badge } from "antd";
import { FireFilled } from "@ant-design/icons";

const { Text } = Typography;

interface CourseCardProps {
    course: any;
    enrollmentCount: number;
}

export default function CourseCard({ course, enrollmentCount }: CourseCardProps) {
    // Hàm định dạng tiền tệ VND
    const formatPrice = (price: number) => {
        if (price === 0) return "Miễn phí";
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    return (
        <Card
            hoverable
            className="overflow-hidden border-none shadow-sm hover:shadow-md transition-all duration-300 group h-full flex flex-col"
            cover={
                <div className="relative aspect-video bg-gray-200 overflow-hidden">
                    {/* Ảnh cover - nếu null sẽ hiện placeholder */}
                    {course.coverImage ? (
                        <img
                            alt={course.title}
                            src={course.coverImage}
                            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 bg-[#f7f9fa]">
                            Leanova Image
                        </div>
                    )}
                    {/* Badge Thịnh hành */}
                    <div className="absolute top-2 left-2">
                        <Badge
                            count={<span className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded text-[10px] font-bold italic"><FireFilled /> HOT</span>}
                        />
                    </div>
                </div>
            }
            styles={{ body: { padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' } }}        >
            <div className="flex-1">
                <Typography.Title level={5} className="!text-[15px] !mb-1 line-clamp-2 hover:text-[#A435F0] transition-colors h-11">
                    {course.title}
                </Typography.Title>

                <Text className="text-[12px] text-gray-500 block mb-1">
                    {course.instructor.fullName}
                </Text>

                <div className="flex items-center gap-1 mb-1">
                    <span className="text-[13px] font-bold text-[#b4690e]">{course.averageRating || 0}</span>
                    <Rate
                        disabled
                        defaultValue={course.averageRating}
                        allowHalf
                        className="text-[10px] text-[#b4690e]"
                    />
                    <span className="text-[12px] text-gray-400">({enrollmentCount})</span>
                </div>

                <Text className="text-base font-bold text-[#1c1d1f]">
                    {formatPrice(course.price)}
                </Text>
            </div>
        </Card>
    );
}