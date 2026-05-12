"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import {
    Card, Row, Col, Statistic, Button, Table, Tag,
    Form, Input, message, Modal, Skeleton, Divider, Typography, Alert
} from "antd";
import {
    DollarOutlined,
    WalletOutlined,
    BankOutlined,
    InfoCircleOutlined,
    CheckCircleOutlined,
    HistoryOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function InstructorRevenuePage() {
    const { token, user } = useAuthStore();
    const router = useRouter();
    const [form] = Form.useForm();

    // States
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ totalRevenue: 0, availableBalance: 0, totalWithdrawn: 0 });
    const [history, setHistory] = useState<any[]>([]);
    const [settings, setSettings] = useState<any>(null);

    // Modal Rút tiền States
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [withdrawAmount, setWithdrawAmount] = useState<number | "">("");
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [isUpdatingBank, setIsUpdatingBank] = useState(false);

    // 1. FETCH TẤT CẢ DỮ LIỆU CÙNG LÚC (Đã bỏ API chart)
    const fetchAllData = async () => {
        if (!token) return;
        try {
            const headers = { "Authorization": `Bearer ${token}` };
            const [statsRes, historyRes, settingsRes] = await Promise.all([
                fetch("http://localhost:8000/api/finance/stats", { headers }),
                fetch("http://localhost:8000/api/finance/withdrawals", { headers }),
                fetch("http://localhost:8000/api/finance/settings", { headers })
            ]);

            const statsData = await statsRes.json();
            const historyData = await historyRes.json();
            const settingsData = await settingsRes.json();

            if (statsData.status === "success") setStats(statsData.data);
            if (historyData.status === "success") setHistory(historyData.data.history);
            if (settingsData.status === "success") {
                setSettings(settingsData.data.settings);
                form.setFieldsValue({
                    bankName: settingsData.data.settings.bankName,
                    bankAccount: settingsData.data.settings.bankAccount,
                    accountName: settingsData.data.settings.accountName
                });
            }
        } catch (error) {
            message.error("Lỗi khi tải dữ liệu tài chính!");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!token || user?.role !== "Instructor") {
            router.push("/");
            return;
        }
        fetchAllData();
    }, [token, router, user]);

    // 2. CẬP NHẬT THÔNG TIN NGÂN HÀNG
    const handleUpdateBankInfo = async (values: any) => {
        setIsUpdatingBank(true);
        try {
            const res = await fetch("http://localhost:8000/api/finance/settings", {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify(values)
            });
            const data = await res.json();
            if (res.ok) {
                message.success("Đã cập nhật thông tin ngân hàng thành công!");
                setSettings(data.data.settings);
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error("Lỗi mạng!");
        } finally {
            setIsUpdatingBank(false);
        }
    };

    // 3. YÊU CẦU RÚT TIỀN
    const handleWithdraw = async () => {
        const amount = Number(withdrawAmount);
        if (!amount || amount < 100000) {
            return message.warning("Số tiền rút tối thiểu là 100,000 VNĐ");
        }
        if (amount > stats.availableBalance) {
            return message.error("Số dư khả dụng không đủ!");
        }

        setIsWithdrawing(true);
        try {
            const res = await fetch("http://localhost:8000/api/finance/withdrawals", {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
                body: JSON.stringify({ amount })
            });
            const data = await res.json();

            if (res.ok) {
                message.success("Đã gửi yêu cầu rút tiền thành công!");
                setIsWithdrawModalOpen(false);
                setWithdrawAmount("");
                fetchAllData(); // Refresh lại toàn bộ data
            } else {
                message.error(data.message);
            }
        } catch (error) {
            message.error("Lỗi mạng khi rút tiền!");
        } finally {
            setIsWithdrawing(false);
        }
    };

    // Format tiền tệ
    const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);

    // Render Tag trạng thái
    const renderStatusTag = (status: string) => {
        switch (status) {
            case 'Pending': return <Tag color="orange">Đang xử lý</Tag>;
            case 'Approved': return <Tag color="blue">Đã duyệt (Chờ CK)</Tag>;
            case 'Completed': return <Tag color="green">Đã chuyển khoản</Tag>;
            case 'Rejected': return <Tag color="red">Từ chối</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    const columns = [
        { title: 'Mã lệnh', dataIndex: 'id', key: 'id', render: (id: number) => <span className="font-medium text-gray-700">WTD-{id}</span> },
        { title: 'Ngày yêu cầu', dataIndex: 'createdAt', key: 'createdAt', render: (date: string) => new Date(date).toLocaleString('vi-VN') },
        { title: 'Số tiền rút', dataIndex: 'amount', key: 'amount', render: (val: number) => <span className="font-bold text-gray-900">{formatCurrency(val)}</span> },
        { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: renderStatusTag },
        { title: 'Ghi chú', dataIndex: 'adminNote', key: 'adminNote', render: (val: string) => val ? <span className="text-red-500 text-xs italic">{val}</span> : '-' },
    ];

    if (isLoading) return <div className="p-10 max-w-7xl mx-auto"><Skeleton active paragraph={{ rows: 10 }} /></div>;

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 mb-8">
                <div className="max-w-7xl mx-auto">
                    <Title level={2} className="!m-0 text-gray-800">Quản lý Tài chính</Title>
                    <Text className="text-gray-500 text-base">Theo dõi doanh thu, cấu hình thanh toán và thực hiện rút tiền về tài khoản ngân hàng của bạn.</Text>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8">
                {/* 1. THỐNG KÊ TỔNG QUAN */}
                <Row gutter={[24, 24]} className="mb-8 flex items-stretch">
                    <Col xs={24} md={8}>
                        <Card
                            className="h-full rounded-2xl shadow-sm border-gray-100 hover:shadow-md transition-all"
                            bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <Statistic
                                title={<span className="text-gray-500 font-medium text-base">Tổng doanh thu (Đã bán)</span>}
                                value={stats.totalRevenue}
                                prefix={<DollarOutlined className="text-green-500 mr-1" />}
                                formatter={(val: any) => formatCurrency(Number(val))}
                                valueStyle={{ color: '#111827', fontWeight: 'bold', fontSize: '26px' }}
                            />
                        </Card>
                    </Col>

                    {/* CARD SỐ DƯ ĐƯỢC CHIA 2 NỬA TRÁI / PHẢI */}
                    <Col xs={24} md={8}>
                        <Card
                            className="h-full rounded-2xl shadow-sm border-gray-100 bg-purple-50/40 hover:shadow-md transition-all"
                            bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}
                        >
                            <Statistic
                                title={<span className="text-purple-600 font-bold text-base">Số dư khả dụng</span>}
                                value={stats.availableBalance}
                                prefix={<WalletOutlined className="text-learnova-purple mr-1" />}
                                formatter={(val: any) => formatCurrency(Number(val))}
                                valueStyle={{ color: '#A435F0', fontWeight: '900', fontSize: '24px' }}
                            />
                            <Button
                                type="primary"
                                className="!bg-learnova-purple hover:!bg-[#872bc9] font-bold border-none shadow-md h-11 px-6 rounded-xl transition-colors"
                                onClick={() => {
                                    if (!settings?.bankAccount) {
                                        message.warning("Vui lòng cập nhật Ngân hàng trước khi rút!");
                                        return;
                                    }
                                    setIsWithdrawModalOpen(true);
                                }}
                            >
                                Rút tiền
                            </Button>
                        </Card>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card
                            className="h-full rounded-2xl shadow-sm border-gray-100 hover:shadow-md transition-all"
                            bodyStyle={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <Statistic
                                title={<span className="text-gray-500 font-medium text-base">Đã rút (Bao gồm đang xử lý)</span>}
                                value={stats.totalWithdrawn}
                                prefix={<BankOutlined className="text-orange-400 mr-1" />}
                                formatter={(val: any) => formatCurrency(Number(val))}
                                valueStyle={{ color: '#111827', fontWeight: 'bold', fontSize: '26px' }}
                            />
                        </Card>
                    </Col>
                </Row>

                {/* 2. CÀI ĐẶT NGÂN HÀNG & LỊCH SỬ RÚT TIỀN */}
                <Row gutter={[24, 24]}>
                    {/* CÀI ĐẶT NGÂN HÀNG (CỘT TRÁI) */}
                    <Col xs={24} lg={8}>
                        <Card title={<span className="font-bold text-lg text-gray-800"><BankOutlined className="mr-2 text-learnova-purple" />Tài khoản Ngân hàng</span>} className="rounded-2xl shadow-sm border-gray-100 h-full">
                            <Alert
                                message={`Tỉ lệ hoa hồng hệ thống: ${(settings?.commissionRate * 100) || 70}%`}
                                type="info"
                                showIcon
                                className="mb-6 py-2.5 px-4 bg-purple-50 border-purple-200 text-learnova-purple font-medium rounded-lg"
                            />

                            <Form form={form} layout="vertical" onFinish={handleUpdateBankInfo}>
                                <Form.Item name="bankName" label={<span className="font-bold text-gray-700">Tên Ngân hàng (VD: Vietcombank)</span>} rules={[{ required: true, message: 'Vui lòng nhập tên NH' }]}>
                                    <Input size="large" placeholder="Nhập tên ngân hàng..." className="bg-gray-50 hover:bg-white focus:bg-white rounded-lg" />
                                </Form.Item>
                                <Form.Item name="bankAccount" label={<span className="font-bold text-gray-700">Số tài khoản</span>} rules={[{ required: true, message: 'Vui lòng nhập STK' }]}>
                                    <Input size="large" placeholder="Nhập số tài khoản..." className="bg-gray-50 hover:bg-white focus:bg-white rounded-lg" />
                                </Form.Item>
                                <Form.Item name="accountName" label={<span className="font-bold text-gray-700">Tên chủ tài khoản</span>} rules={[{ required: true, message: 'Vui lòng nhập Tên chủ TK' }]}>
                                    <Input size="large" placeholder="Viết hoa không dấu..." className="bg-gray-50 hover:bg-white focus:bg-white rounded-lg" />
                                </Form.Item>
                                <Button
                                    type="primary"
                                    size="large"
                                    htmlType="submit"
                                    className="w-full mt-4 !bg-gray-900 hover:!bg-black border-none font-bold rounded-lg h-12"
                                    loading={isUpdatingBank}
                                >
                                    Lưu thông tin ngân hàng
                                </Button>
                            </Form>
                        </Card>
                    </Col>

                    {/* LỊCH SỬ RÚT TIỀN (CỘT PHẢI) */}
                    <Col xs={24} lg={16}>
                        <Card title={<span className="font-bold text-lg text-gray-800"><HistoryOutlined className="mr-2 text-learnova-purple" />Lịch sử rút tiền</span>} className="rounded-2xl shadow-sm border-gray-100 h-full">
                            {history.length > 0 ? (
                                <Table
                                    dataSource={history}
                                    columns={columns}
                                    rowKey="id"
                                    pagination={{ pageSize: 6 }}
                                    scroll={{ x: 600 }}
                                    className="border border-gray-100 rounded-lg overflow-hidden"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                    <HistoryOutlined className="text-5xl mb-4 text-gray-300" />
                                    <p className="text-base">Bạn chưa thực hiện lệnh rút tiền nào.</p>
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>

                {/* 3. MODAL RÚT TIỀN */}
                <Modal
                    title={<div className="text-xl font-bold border-b border-gray-100 pb-4 text-gray-800">Yêu cầu rút tiền</div>}
                    open={isWithdrawModalOpen}
                    onCancel={() => setIsWithdrawModalOpen(false)}
                    footer={null}
                    centered
                >
                    <div className="pt-5">
                        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-gray-600 font-medium">Số dư khả dụng:</span>
                                <span className="font-black text-learnova-purple text-xl">{formatCurrency(stats.availableBalance)}</span>
                            </div>
                            <Divider className="my-3 border-gray-200" />
                            <div className="text-sm text-gray-700 space-y-2">
                                <p><BankOutlined className="text-gray-400 mr-2" /> <strong>Ngân hàng:</strong> {settings?.bankName}</p>
                                <p><InfoCircleOutlined className="text-gray-400 mr-2" /> <strong>Số tài khoản:</strong> {settings?.bankAccount}</p>
                                <p><CheckCircleOutlined className="text-gray-400 mr-2" /> <strong>Chủ tài khoản:</strong> {settings?.accountName}</p>
                            </div>
                        </div>

                        <div className="mb-8">
                            <label className="block text-gray-800 font-bold mb-2">Nhập số tiền muốn rút (VNĐ)</label>
                            <Input
                                type="number"
                                size="large"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                                placeholder="Tối thiểu 100,000"
                                className="font-bold text-lg text-gray-900 rounded-lg h-12"
                            />
                            {withdrawAmount && Number(withdrawAmount) > 0 && (
                                <p className="text-green-600 mt-2 text-sm font-bold bg-green-50 inline-block px-3 py-1 rounded-md">
                                    Thực nhận: {formatCurrency(Number(withdrawAmount))}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
                            <Button size="large" className="font-bold rounded-lg" onClick={() => setIsWithdrawModalOpen(false)}>Hủy</Button>
                            <Button size="large" type="primary" className="!bg-learnova-purple font-bold border-none rounded-lg px-6" onClick={handleWithdraw} loading={isWithdrawing}>
                                Xác nhận rút tiền
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        </div>
    );
}