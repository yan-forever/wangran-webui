import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.tsx';
import { useNavigate } from 'react-router-dom';
import type { EventsData, MerchantOrders, Organizer } from '../types/interface.ts';
import { AnimatePresence, motion } from 'framer-motion';
import { getMerchantOrders, getOrganizers } from '../api/request.ts';
import { formatTime, toOrganizerIds } from '../lib/tool.ts';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, deleteEvent, getMerchantEvents, upDataEvent } from '@/api/event.ts';

const emptyEventData: EventsData = {
    eventName: '',
    eventTime: '',
    eventType: '',
    city: '',
    price: NaN,
    organizers: [],
    stock: NaN,
    onShelf: false,
    saleStartTime: '',
    saleEndTime: '',
};

function MerchantConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tickets');

    const menuItems = [
        { id: 'tickets', label: '我的票务' },
        { id: 'orders', label: '全部订单' },
    ];

    useEffect(() => {
        if (role != 'merchant') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    return (
        <div className="flex w-full min-h-[calc(100vh-64px)] bg-zinc-950">
            <aside className="w-64 bg-zinc-900/30 border-r border-zinc-800 p-4 shrink-0">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xl font-medium transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {activeTab === 'tickets' && <Tickets />}
                    {activeTab === 'orders' && <Orders />}
                </div>
            </main>
        </div>
    );
}

function Tickets() {
    const [isCreate, setIsCreate] = useState(false);
    const [page] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [preData, setPreData] = useState<EventsData>(emptyEventData);

    const {
        data: events = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery<EventsData[]>({
        queryKey: ['events', page, 10],
        queryFn: () => getMerchantEvents(page, 10),
    });

    return (
        <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">我的票务</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => void refetch()}
                            disabled={isFetching}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isFetching ? '刷新中...' : '刷新'}
                        </button>
                        <button
                            onClick={() => setIsCreate(true)}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center gap-2"
                        >
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
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            创建票务
                        </button>
                    </div>
                </div>
                <CreateChangePanel
                    status={isCreate}
                    onClosed={() => setIsCreate(false)}
                    toUpData={false}
                />
                <CreateChangePanel
                    key={preData.id || 'edit-panel'}
                    status={isEditing}
                    onClosed={() => setIsEditing(false)}
                    toUpData={true}
                    upData={preData}
                />
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 min-h-75">
                    {isLoading ? (
                        <div className="p-4 text-center text-sm text-zinc-500">加载中...</div>
                    ) : isError ? (
                        <div className="p-4 text-center text-sm text-red-400">
                            加载失败，请稍后重试
                        </div>
                    ) : events.length === 0 ? (
                        <div className="p-4 text-center text-sm text-zinc-500">暂无数据</div>
                    ) : (
                        events.map((data) => {
                            return (
                                <div
                                    key={data.id}
                                    id={data.id || ''}
                                    className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 mb-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-indigo-500/40 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                >
                                    <div className="flex flex-col gap-2.5">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                                                {data.eventName || '未命名票务'}
                                            </h3>
                                            {data.eventType && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                                    {data.eventType}
                                                </span>
                                            )}

                                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                售卖中
                                            </span>
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
                                                {formatTime(data.eventTime)}
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
                                                {data.city || '未知地点'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="flex flex-col items-end gap-3">
                                            <div className="flex items-center gap-8">
                                                <div className="text-right">
                                                    <div className="text-xs text-zinc-500 font-medium mb-1">
                                                        单价
                                                    </div>
                                                    <div className="text-xl font-black text-rose-400">
                                                        ¥{data.price || 0}
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <div className="text-xs text-zinc-500 font-medium mb-1">
                                                        剩余库存
                                                    </div>
                                                    <div className="text-xl font-bold text-zinc-100">
                                                        {data.stock || 0}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 bg-zinc-800/40 px-2 py-1 rounded-md border border-zinc-800/60">
                                                <svg
                                                    className="w-3.5 h-3.5 text-zinc-500"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                <span>
                                                    售卖:{' '}
                                                    {data.saleStartTime
                                                        ? formatTime(data.saleStartTime)
                                                        : '未设置'}{' '}
                                                    -{' '}
                                                    {data.saleEndTime
                                                        ? formatTime(data.saleEndTime)
                                                        : '未设置'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2 pl-4 border-l border-zinc-800 items-center self-stretch">
                                            <button
                                                id={data.id || ''}
                                                onClick={() => {
                                                    setIsEditing(true);
                                                    setPreData(data);
                                                }}
                                                disabled={data.onShelf || false}
                                                className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all active:scale-95 flex items-center justify-center h-full"
                                                title="编辑票务"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                id={data.id || ''}
                                                onClick={() => {
                                                    if (window.confirm('确定要删除这个票务吗？'))
                                                        deleteEvent(data.id || '').then(
                                                            () => void refetch(),
                                                        );
                                                }}
                                                disabled={data.onShelf || false}
                                                className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all active:scale-95 flex items-center justify-center h-full"
                                                title="删除票务"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}

function Orders() {
    const [page, setPage] = useState(1);
    // null: 全部, false: 有效, true: 已退款
    const [refunded, setRefunded] = useState<boolean | null>(null);

    const {
        data: orders,
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery<MerchantOrders[]>({
        queryKey: ['orders', page, refunded],
        queryFn: () => getMerchantOrders(page, 10, refunded),
    });

    // 日期格式化辅助函数
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

    const filterTabs = [
        { label: '全部订单', value: null },
        { label: '有效订单', value: false },
        { label: '已退款', value: true },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 顶部标题与操作区 */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white tracking-tight">订单管理</h2>
                <button
                    onClick={() => void refetch()}
                    disabled={isFetching}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {isFetching ? '刷新中...' : '刷新'}
                </button>
            </div>

            {/* 状态过滤标签 */}
            <div className="flex space-x-2 mb-6">
                {filterTabs.map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => {
                            setRefunded(tab.value);
                            setPage(1); // 切换状态时重置页码
                        }}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            refunded === tab.value
                                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]'
                                : 'bg-zinc-900/50 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 订单列表容器 */}
            <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 min-h-100">
                {isError && (
                    <div className="p-4 text-center text-sm text-rose-400 bg-rose-500/10 rounded-xl border border-rose-500/20 mb-4">
                        获取订单数据失败，请检查网络后重试。
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                        <div className="text-sm text-zinc-500">加载订单中...</div>
                    </div>
                ) : !orders || orders.length === 0 ? (
                    <div className="p-16 flex flex-col items-center justify-center">
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
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <p className="text-zinc-500">暂无符合条件的订单记录</p>
                    </div>
                ) : (
                    orders.map((order) => (
                        <div
                            key={order.id}
                            className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 mb-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-indigo-500/40 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                        >
                            {/* 订单核心信息 */}
                            <div className="flex flex-col gap-2.5 flex-1">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                                        {order.eventObject?.eventName || '未知票务项目'}
                                    </h3>

                                    {order.refunded ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                            已退款
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            有效订单
                                        </span>
                                    )}
                                </div>

                                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-500">
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
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        用户 ID:{' '}
                                        <span className="text-zinc-300">
                                            {order.userId || '未知'}
                                        </span>
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
                                                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                                            />
                                        </svg>
                                        票号:{' '}
                                        <span className="text-zinc-300 font-mono">
                                            {order.ticketCode || '暂无'}
                                        </span>
                                    </span>
                                </div>

                                <div className="text-xs text-zinc-600 mt-1">
                                    下单时间: {formatDate(order.createTime)}
                                </div>
                            </div>

                            {/* 交易金额 */}
                            <div className="flex flex-col items-end gap-1 mt-4 sm:mt-0 min-w-30 pl-4 sm:border-l border-zinc-800">
                                <div className="text-xs text-zinc-500 font-medium">订单金额</div>
                                <div className="text-xl font-black text-rose-400">
                                    ¥{order.eventObject?.price || '0.00'}
                                </div>
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
    );
}
function CreateChangePanel({
    status,
    onClosed,
    toUpData,
    upData,
}: {
    status: boolean;
    onClosed: () => void;
    toUpData: boolean;
    upData?: EventsData;
}) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const queryClient = useQueryClient();
    const [eventData, setEventData] = useState<EventsData>(upData ?? emptyEventData);

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!status) return;

        setEventData(
            upData
                ? {
                      ...upData,
                      onShelf: Boolean(upData.onShelf),
                      organizers: toOrganizerIds(upData.organizers),
                  }
                : { ...emptyEventData },
        );
        setIsDropdownOpen(false);
    }, [status, upData]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const { data: organizerOptions = [] } = useQuery<Organizer[]>({
        queryKey: ['organizers'],
        queryFn: () => getOrganizers(1, 100),
        enabled: status,
    });

    const buildUpdatePayload = (current: EventsData, original?: EventsData) => {
        if (!original) return null;

        const payload: Partial<Omit<EventsData, 'id' | 'eventCode'>> = {};
        const currentOrganizers = toOrganizerIds(current.organizers).sort((a, b) => a - b);
        const originalOrganizers = toOrganizerIds(original.organizers).sort((a, b) => a - b);

        if (current.eventName !== original.eventName) payload.eventName = current.eventName;
        if (current.eventType !== original.eventType) payload.eventType = current.eventType;
        if (current.eventTime !== original.eventTime) payload.eventTime = current.eventTime;
        if (current.city !== original.city) payload.city = current.city;
        if (current.price !== original.price) payload.price = current.price;
        if (current.stock !== original.stock) payload.stock = current.stock;
        if (current.saleStartTime !== original.saleStartTime) {
            payload.saleStartTime = current.saleStartTime;
        }
        if (current.saleEndTime !== original.saleEndTime) {
            payload.saleEndTime = current.saleEndTime;
        }
        if (
            currentOrganizers.length !== originalOrganizers.length ||
            currentOrganizers.some((item, index) => item !== originalOrganizers[index])
        ) {
            payload.organizers = currentOrganizers;
        }
        if (current.onShelf !== original.onShelf) payload.onShelf = current.onShelf;

        return Object.keys(payload).length > 0 ? payload : null;
    };

    const saveEventMutation = useMutation({
        mutationFn: async (payload: EventsData | Partial<Omit<EventsData, 'id' | 'eventCode'>>) => {
            if (toUpData) {
                if (!upData?.id) throw new Error('缺少票务 id，无法更新');
                return upDataEvent(
                    upData.id,
                    payload as Partial<Omit<EventsData, 'id' | 'eventCode'>>,
                );
            }

            return createEvent(payload as EventsData);
        },
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: ['events'] });
        },
    });

    const createChangeEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = toUpData ? buildUpdatePayload(eventData, upData) : eventData;

        if (toUpData && !payload) {
            alert('未检测到修改内容');
            return;
        }
        await saveEventMutation.mutateAsync(
            payload as EventsData | Partial<Omit<EventsData, 'id' | 'eventCode'>>,
        );
        alert(toUpData ? '更改成功！' : '创建成功！');

        onClosed();
        setEventData({ ...emptyEventData });
        setIsDropdownOpen(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        setEventData((prev) => ({
            ...prev,
            [name]:
                name === 'price' || name === 'stock'
                    ? value === ''
                        ? null
                        : Number(value)
                    : value,
        }));
    };

    const toggleOnShelf = () => {
        setEventData((prev) => ({
            ...prev,
            onShelf: !prev.onShelf,
        }));
    };

    const toggleOrganizer = (idStr: string | null) => {
        if (!idStr) return;
        const idNum = Number(idStr);

        setEventData((prev) => {
            const currentSelected = toOrganizerIds(prev.organizers);
            const nextSelected = currentSelected.includes(idNum)
                ? currentSelected.filter((orgId) => orgId !== idNum)
                : [...currentSelected, idNum];

            return { ...prev, organizers: nextSelected };
        });
    };

    const selectedOrganizers = toOrganizerIds(eventData.organizers);
    const selectedCount = selectedOrganizers.length;
    const isOnShelf: boolean = !!eventData.onShelf;

    return (
        <AnimatePresence>
            {status && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl"
                    >
                        <div className="px-8 py-10">
                            <h2 className="text-2xl font-bold text-white text-center mb-8">
                                {toUpData ? '更新票务信息' : '新建票务信息'}
                            </h2>
                            <form
                                className="grid grid-cols-2 gap-x-8 gap-y-5"
                                onSubmit={createChangeEvent}
                            >
                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        票务名称
                                    </label>
                                    <input
                                        type="text"
                                        name="eventName"
                                        value={eventData.eventName || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        上架状态
                                    </label>
                                    <div
                                        className="w-full flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-[7px] transition-all hover:border-zinc-700 cursor-pointer"
                                        onClick={toggleOnShelf}
                                    >
                                        <span
                                            className={`text-sm select-none transition-colors ${
                                                isOnShelf
                                                    ? 'text-indigo-400 font-medium'
                                                    : 'text-zinc-500'
                                            }`}
                                        >
                                            {isOnShelf ? '已上架' : '暂不上架'}
                                        </span>
                                        <button
                                            type="button"
                                            role="switch"
                                            aria-checked={isOnShelf}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleOnShelf();
                                            }}
                                            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                                                isOnShelf ? 'bg-indigo-600' : 'bg-zinc-700'
                                            }`}
                                        >
                                            <span
                                                aria-hidden="true"
                                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                                                    isOnShelf ? 'translate-x-5' : 'translate-x-0.5'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        票务类型（演出/赛事）
                                    </label>
                                    <input
                                        type="text"
                                        name="eventType"
                                        value={eventData.eventType || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        举办时间
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="eventTime"
                                        value={eventData.eventTime || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        举办城市
                                    </label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={eventData.city || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        单价
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={eventData.price ?? ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        库存总量
                                    </label>
                                    <input
                                        type="number"
                                        name="stock"
                                        value={eventData.stock ?? ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        主办方选择
                                        {selectedCount > 0 && (
                                            <span className="ml-2 text-indigo-400 normal-case tracking-normal">
                                                (已选取 {selectedCount} 个)
                                            </span>
                                        )}
                                    </label>

                                    <div
                                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 flex items-center justify-between cursor-pointer transition-all hover:border-zinc-700"
                                    >
                                        <span
                                            className={
                                                selectedCount > 0
                                                    ? 'text-zinc-100'
                                                    : 'text-zinc-600'
                                            }
                                        >
                                            {selectedCount > 0
                                                ? `已选择 ${selectedCount} 个主办方`
                                                : '点击选择主办方...'}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 9l-7 7-7-7"
                                            />
                                        </svg>
                                    </div>
                                    <AnimatePresence>
                                        {isDropdownOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-10"
                                                    onClick={() => setIsDropdownOpen(false)}
                                                ></div>
                                                <motion.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                        scale: 0.95,
                                                    }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                    transition={{
                                                        duration: 0.15,
                                                        ease: 'easeOut',
                                                    }}
                                                    className="absolute z-20 mt-2 w-full max-h-60 overflow-y-auto rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl py-2 origin-top scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
                                                >
                                                    {organizerOptions.length === 0 ? (
                                                        <div className="p-4 text-center text-sm text-zinc-500">
                                                            加载中或暂无数据
                                                        </div>
                                                    ) : (
                                                        organizerOptions.map((data) => {
                                                            const idNum = Number(data.id);
                                                            const isSelected =
                                                                selectedOrganizers.includes(idNum);

                                                            return (
                                                                <div
                                                                    key={data.id}
                                                                    onClick={() =>
                                                                        toggleOrganizer(data.id)
                                                                    }
                                                                    className={`px-4 py-2.5 flex items-center justify-between cursor-pointer transition-colors hover:bg-zinc-800 ${
                                                                        isSelected
                                                                            ? 'bg-indigo-600/10'
                                                                            : ''
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`text-sm ${isSelected ? 'text-indigo-400 font-bold' : 'text-zinc-300'}`}
                                                                    >
                                                                        {data.name}
                                                                    </span>
                                                                    {isSelected && (
                                                                        <svg
                                                                            className="w-4 h-4 text-indigo-500"
                                                                            fill="none"
                                                                            viewBox="0 0 24 24"
                                                                            stroke="currentColor"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M5 13l4 4L19 7"
                                                                            />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        销售开始时间
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="saleStartTime"
                                        value={eventData.saleStartTime || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                        销售结束时间
                                    </label>
                                    <input
                                        type="datetime-local"
                                        name="saleEndTime"
                                        value={eventData.saleEndTime || ''}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div className="col-span-2 pt-4">
                                    <button
                                        type="submit"
                                        disabled={saveEventMutation.isPending}
                                        className="w-full py-3 px-6 rounded-xl bg-linear-to-r from-indigo-600 to-violet-700 text-white font-bold hover:from-indigo-500 hover:to-violet-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {saveEventMutation.isPending
                                            ? '提交中...'
                                            : toUpData
                                              ? '更新'
                                              : '发布票务'}
                                    </button>
                                </div>
                            </form>
                        </div>
                        <button
                            onClick={() => onClosed()}
                            className="absolute right-6 top-8 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default MerchantConsole;
