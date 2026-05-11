"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, Typography, Button, Card } from "antd";
import { UserOutlined, RightOutlined } from "@ant-design/icons";
import Link from "next/link";

const { Title, Text } = Typography;

export default function Home() {
  const { user } = useAuthStore();

  return (
    <div className="pb-20">
      {/* PHẦN CHÀO MỪNG (Welcome Section) */}
      <section className="bg-[#f8f9fb] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center gap-6">
          {/* Ảnh đại diện lớn */}
          <Avatar
            size={80}
            src={user?.avatarUrl}
            icon={<UserOutlined />}
            className="bg-[#1c1d1f] shadow-sm flex-shrink-0"
          />

          <div className="flex flex-col">
            <Title level={2} className="!m-0 !text-2xl !font-bold text-gray-900">
              {user ? `Chào mừng ${user.fullName} đã trở lại!` : "Chào mừng bạn đến với Leanova!"}
            </Title>
            <Text className="text-gray-600 text-lg mt-1">
              {user
                ? "Hôm nay bạn muốn học thêm kỹ năng gì mới không?"
                : "Đăng nhập để lưu lại tiến trình học tập của bạn."
              }
            </Text>

            {!user && (
              <div className="mt-4">
                <Link href="/login">
                  <Button type="primary" className="bg-[#A435F0] hover:!bg-[#8e2ce0] border-none font-bold h-10">
                    Bắt đầu học ngay
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* PHẦN NỘI DUNG TIẾP THEO (Ví dụ: Khóa học đang học) */}
      {user && (
        <section className="max-w-7xl mx-auto px-6 mt-12">
          <div className="flex justify-between items-center mb-6">
            <Title level={3} className="!m-0">Tiếp tục việc học của bạn</Title>
            <Link href="/my-learning" className="text-[#A435F0] font-bold hover:underline flex items-center gap-1">
              Xem tất cả <RightOutlined className="text-xs" />
            </Link>
          </div>

          {/* Demo một thẻ khóa học đang học dở */}
          <Card className="max-w-md border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded flex-shrink-0" />
              <div>
                <Text strong className="block text-base">Lập trình React cho người mới bắt đầu</Text>
                <Text className="text-gray-500 block text-sm">Bài 12: Quản lý State với Zustand</Text>
                <div className="w-full bg-gray-200 h-1.5 mt-4 rounded-full overflow-hidden">
                  <div className="bg-[#A435F0] h-full w-[65%]" />
                </div>
                <Text className="text-[12px] text-gray-500 mt-1 block">Đã hoàn thành 65%</Text>
              </div>
            </div>
          </Card>
        </section>
      )}
    </div>
  );
}