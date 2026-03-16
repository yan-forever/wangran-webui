import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOrders, refundOrder } from '../Utils/request.ts';
import type { Order } from '../Utils/interface.ts';

function UserConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (role !== 'user') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    const [page, setPage] = useState<number>(1);
    const [refunded, setRefunded] = useState<boolean>(false);

    const menuItems = [
        { id: 'valid', label: '有效订单', isRefunded: false },
        { id: 'refunded', label: '已退款订单', isRefunded: true },
    ];

    const {
        data: orders,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery<Order[]>({
        queryKey: ['orders', page, refunded],
        queryFn: () => getOrders(page, 10, refunded),
    });

    // 时间格式化工具
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '未知时间';
        return new Date(dateString).toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="flex w-full min-h-[calc(100vh-64px)]">
            {/* 侧边导航栏 */}
            <aside className="w-64 bg-zinc-900/30 border-r border-zinc-800 p-4 shrink-0">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setRefunded(item.isRefunded);
                                setPage(1);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-lg font-medium transition-all duration-200 ${
                                refunded === item.isRefunded
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* 主内容区域 */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* 顶部操作区 */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white tracking-tight">
                            {refunded ? '已退款订单' : '有效订单'}
                        </h2>
                        <button
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isFetching ? '刷新中...' : '刷新'}
                        </button>
                    </div>

                    {/* 订单列表容器 */}
                    <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 min-h-[300px]">
                        {isError && (
                            <div className="p-4 text-center text-sm text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20 mb-4">
                                获取订单数据失败，请检查网络后重试。
                            </div>
                        )}

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 space-y-3">
                                <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                                <div className="text-sm text-zinc-500">加载订单中...</div>
                            </div>
                        ) : !orders || orders.length === 0 ? (
                            <div className="p-10 flex flex-col items-center justify-center">
                                <svg
                                    className="w-12 h-12 text-zinc-700 mb-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="1"
                                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                    />
                                </svg>
                                <p className="text-zinc-500">
                                    暂无{refunded ? '已退款' : '有效'}的订单记录
                                </p>
                            </div>
                        ) : (
                            orders.map((order) => (
                                <div
                                    key={order.id}
                                    className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 mb-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-indigo-500/40 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                >
                                    {/* 左侧：订单详细信息 */}
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                                                {order.eventObject?.eventName || '未知演出'}
                                            </h3>

                                            {/* 状态 Tag */}
                                            {order.refunded ? (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                    已退款
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    出票成功
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-5 text-sm text-zinc-500">
                                            <span className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                                {formatDate(order.eventObject?.eventTime)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                                    />
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                                    />
                                                </svg>
                                                {order.eventObject?.city || '未知地点'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs mt-1">
                                            <span className="text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded-md">
                                                票号:{' '}
                                                <span className="text-zinc-400">
                                                    {order.ticketCode || '暂无数据'}
                                                </span>
                                            </span>
                                            <span className="text-zinc-600">
                                                下单时间: {formatDate(order.createTime)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 右侧：金额与操作按钮 */}
                                    <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex flex-col items-end gap-1">
                                            <div className="text-xs text-zinc-500 font-medium">
                                                实付金额
                                            </div>
                                            <div className="text-xl font-black text-rose-400">
                                                ¥{order.eventObject?.price || '0.00'}
                                            </div>
                                        </div>

                                        {!order.refunded && (
                                            <div className="flex flex-col gap-2 pl-4 border-l border-zinc-800 items-center self-stretch justify-center">
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm('确定要申请退款吗？')) {
                                                            refundOrder(order.id || '');
                                                            alert('退款成功');
                                                        }
                                                    }}
                                                    className="px-4 py-2 text-sm font-medium text-rose-400 bg-rose-500/5 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 hover:border-rose-500/40 transition-all active:scale-95 whitespace-nowrap"
                                                >
                                                    申请退款
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}

                        {/* 分页控制区 */}
                        {orders && orders.length > 0 && (
                            <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-800/60">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    上一页
                                </button>
                                <span className="text-sm text-zinc-500 font-medium">
                                    第 <span className="text-zinc-200">{page}</span> 页
                                    {isFetching && (
                                        <span className="ml-2 animate-pulse text-indigo-400">
                                            刷新中...
                                        </span>
                                    )}
                                </span>
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    disabled={orders.length < 10}
                                    className="px-4 py-2 text-sm font-medium text-zinc-300 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    下一页
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default UserConsole;
