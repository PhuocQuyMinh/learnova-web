"use client"; // Bắt buộc dùng "use client" khi component có tương tác state hoặc hooks

import { Button, Card, Typography } from "antd";
import { useStore } from "@/store/useStore";

const { Title, Text } = Typography;

export default function Home() {
  // Lấy state và actions từ Zustand store
  const { count, increase, decrease, reset } = useStore();

  return (
    // Sử dụng Tailwind CSS cho Layout
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">


      <Card className="w-full max-w-md shadow-lg rounded-2xl text-center">
        <Title level={2} className="!mb-6">
          Zustand & Antd
        </Title>

        <div className="mb-6">
          <Text className="text-gray-500">Giá trị bộ đếm hiện tại:</Text>
          <div className="text-6xl font-bold text-blue-600 my-4">
            {count}
          </div>
        </div>


        <div className="flex gap-3 justify-center">
          <Button type="primary" size="large" onClick={increase}>
            Tăng (+1)
          </Button>
          <Button size="large" onClick={decrease}>
            Giảm (-1)
          </Button>
          <Button danger size="large" onClick={reset}>
            Reset
          </Button>
        </div>
      </Card>

    </main>
  );
}