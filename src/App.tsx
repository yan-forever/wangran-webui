import './App.css';
import { AuthProvider, useAuth } from './AuthContext.tsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Me from './Me.tsx';
import Header, { AuthPanel } from './APP/Header.tsx';
import AdminConsole from './console/AdminConsole.tsx';
import MerchantConsole from './console/MerchantConsole.tsx';
import UserConsole from './console/UserConsole.tsx';
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookEvent, getPublicEvents } from './Utils/request.ts';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="flex flex-col bg-gray-950 min-h-screen w-full">
                    <Header />

                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/me" element={<Me />} />
                        <Route path="/console/admin" element={<AdminConsole />} />
                        <Route path="/console/merchant" element={<MerchantConsole />} />
                        <Route path="/console/user" element={<UserConsole />} />
                    </Routes>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}
function Home() {
    // 1. 本地输入状态（不直接触发请求）
    const [eventType, setEventType] = useState<string>('');
    const [city, setCity] = useState<string>('');
    const [startTime, setStartTime] = useState<string>('');
    const [endTime, setEndTime] = useState<string>('');

    const { role } = useAuth();
    const [status, setStatus] = useState<boolean>(false);

    // 2. 实际查询状态（点击搜索后更新）
    const [queryParams, setQueryParams] = useState({
        eventType: '',
        city: '',
        startTime: '',
        endTime: '',
    });
    const [now, setNow] = useState(() => Date.now());

    const [page, setPage] = useState<number>(1);
    const pageSize = 12;

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(Date.now());
        }, 60_000);

        return () => window.clearInterval(timer);
    }, []);

    // 3. 查询请求
    const {
        data: events,
        isLoading,
        isError,
        isFetching,
    } = useQuery({
        // 将 queryParams 放入 key 中，变化时自动请求
        queryKey: ['events', page, queryParams],
        queryFn: () =>
            getPublicEvents(
                queryParams.eventType,
                queryParams.city,
                queryParams.startTime,
                queryParams.endTime,
                page,
                pageSize,
            ),
        // 保持旧数据，防止翻页闪烁
        placeholderData: (previousData) => previousData,
    });

    // 4. 处理搜索与重置
    const handleSearch = () => {
        setPage(1);
        setQueryParams({ eventType, city, startTime, endTime });
    };

    const handleReset = () => {
        setEventType('');
        setCity('');
        setStartTime('');
        setEndTime('');
        setQueryParams({ eventType: '', city: '', startTime: '', endTime: '' });
        setPage(1);
    };

    // 5. 格式化日期辅助函数
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '时间待定';
        return new Date(dateStr).toLocaleString('zh-CN', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getEventKey = (
        id: string | null | undefined,
        eventCode: string | null | undefined,
        name: string | null | undefined,
        time: string | null | undefined,
        location: string | null | undefined,
    ) => {
        if (id) return id;
        if (eventCode) return eventCode;
        return `${name || 'event'}-${time || 'time'}-${location || 'city'}`;
    };

    const getSaleStatus = (saleStartTime: string | null, saleEndTime: string | null) => {
        const start = saleStartTime ? new Date(saleStartTime).getTime() : null;
        const end = saleEndTime ? new Date(saleEndTime).getTime() : null;

        if (start && now < start) return '未开售';
        if (end && now > end) return '已停售';
        return '售票中';
    };

    return (
        <div className="w-full min-h-screen bg-black text-zinc-100 p-4 md:p-8 lg:p-12">
            <AuthPanel isOpen={status} onClose={() => setStatus(false)} authMode={true} />
            <div className="max-w-7xl mx-auto space-y-8">
                {/* 头部标题区 */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">
                            探索精彩活动
                        </h1>
                        <p className="text-zinc-400 mt-2 text-sm">发现您身边的即时票务信息</p>
                    </div>
                    {isFetching && (
                        <span className="text-xs text-indigo-400 animate-pulse">数据更新中...</span>
                    )}
                </div>

                {/* 筛选工具栏 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800/50 backdrop-blur-xl shadow-xl">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 font-medium ml-1">活动类型</label>
                        <input
                            type="text"
                            placeholder="例如：演唱会"
                            value={eventType}
                            onChange={(e) => setEventType(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 font-medium ml-1">城市</label>
                        <input
                            type="text"
                            placeholder="例如：上海"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 font-medium ml-1">开始时间</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 scheme-dark"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-500 font-medium ml-1">结束时间</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm text-zinc-300 outline-none transition-all focus:ring-2 focus:ring-indigo-500/50 scheme-dark"
                        />
                    </div>

                    <div className="flex items-end gap-2 pb-0.5">
                        <button
                            type="button"
                            onClick={handleSearch}
                            className="h-10.5 flex-1 rounded-xl bg-indigo-600 text-sm font-medium text-white shadow-lg shadow-indigo-900/20 transition-all hover:bg-indigo-500 active:scale-95"
                        >
                            搜索
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex h-10.5 w-10.5 items-center justify-center rounded-xl bg-zinc-800 font-medium text-zinc-300 transition-all hover:bg-zinc-700 active:scale-95"
                            title="重置"
                        >
                            ↺
                        </button>
                    </div>
                </div>

                {/* 内容区域 */}
                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="h-72 rounded-3xl border border-zinc-800 bg-zinc-900"
                            />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-20 text-red-400 bg-red-900/10 rounded-3xl border border-red-900/20">
                        <p className="text-lg font-medium">数据加载失败</p>
                        <p className="text-sm opacity-70 mt-2">请检查网络连接或稍后重试</p>
                    </div>
                ) : events && events.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {events.map((event) => (
                            <div
                                key={getEventKey(
                                    event.id,
                                    event.eventCode,
                                    event.eventName,
                                    event.eventTime,
                                    event.city,
                                )}
                                className="flex h-full flex-col rounded-3xl border border-zinc-800 bg-zinc-900 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10"
                            >
                                <div className="mb-4 flex items-start justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-full bg-indigo-400/10 px-2.5 py-1 text-xs font-medium text-indigo-300 ring-1 ring-inset ring-indigo-400/20">
                                            {event.eventType || '未分类'}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                                            📍 {event.city || '未知城市'}
                                        </span>
                                    </div>
                                    <span
                                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                            getSaleStatus(
                                                event.saleStartTime,
                                                event.saleEndTime,
                                            ) === '售票中'
                                                ? 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20'
                                                : getSaleStatus(
                                                        event.saleStartTime,
                                                        event.saleEndTime,
                                                    ) === '未开售'
                                                  ? 'bg-amber-400/10 text-amber-300 ring-amber-400/20'
                                                  : 'bg-zinc-700/50 text-zinc-300 ring-zinc-600'
                                        }`}
                                    >
                                        {getSaleStatus(event.saleStartTime, event.saleEndTime)}
                                    </span>
                                </div>

                                <div className="flex flex-1 flex-col">
                                    <h3 className="mb-3 line-clamp-2 text-lg font-bold leading-snug text-zinc-100 transition-colors hover:text-indigo-400">
                                        {event.eventName}
                                    </h3>

                                    <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-3">
                                        <div>
                                            <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500">
                                                价格
                                            </p>
                                            <p className="text-base font-semibold text-white">
                                                {event.price && event.price > 0
                                                    ? `¥${event.price}`
                                                    : '免费'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="mb-1 text-[11px] uppercase tracking-wide text-zinc-500">
                                                库存
                                            </p>
                                            <p className="text-base font-semibold text-white">
                                                {event.stock !== null ? event.stock : '未知'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 border-t border-zinc-800/60 pt-4 text-sm text-zinc-300">
                                        <div className="flex items-start gap-2">
                                            <span className="text-zinc-500">活动时间</span>
                                            <span className="flex-1 text-right text-zinc-100">
                                                {formatDate(event.eventTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-zinc-500">开售时间</span>
                                            <span className="flex-1 text-right text-zinc-100">
                                                {formatDate(event.saleStartTime)}
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <span className="text-zinc-500">停售时间</span>
                                            <span className="flex-1 text-right text-zinc-100">
                                                {formatDate(event.saleEndTime)}
                                            </span>
                                        </div>
                                        {event.stock !== null && event.stock <= 0 && (
                                            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-center text-xs font-medium text-red-300">
                                                当前票务已售罄
                                            </div>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (role == 'guest') setStatus(true);
                                                else if (role == 'user') {
                                                    if (window.confirm('订此票？')) {
                                                        bookEvent(event.id || '');
                                                    }
                                                } else window.confirm('非用户不能订票！');
                                            }}
                                            className="w-full rounded-xl border border-zinc-700/50 bg-zinc-100/5 py-2.5 text-sm font-medium text-zinc-300 transition-all duration-300 hover:border-indigo-500 hover:bg-indigo-600 hover:text-white"
                                        >
                                            立即订票
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-zinc-500 bg-zinc-900/30 rounded-3xl border border-zinc-800/50 border-dashed">
                        <div className="text-4xl mb-4 opacity-50">🎫</div>
                        <p className="text-lg font-medium text-zinc-400">暂无相关活动</p>
                        <p className="text-sm opacity-60 mt-1">换个搜索条件试试看？</p>
                    </div>
                )}

                {/* 分页控制 */}
                <div className="flex justify-center items-center gap-4 mt-12 py-8 border-t border-zinc-800/50">
                    <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 hover:border-zinc-700 transition-all font-medium text-sm"
                    >
                        ← 上一页
                    </button>
                    <span className="font-mono text-zinc-500 text-sm bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
                        Page <span className="text-indigo-400 font-bold">{page}</span>
                    </span>
                    <button
                        type="button"
                        disabled={!events || events.length < pageSize}
                        onClick={() => setPage((p) => p + 1)}
                        className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-800 hover:border-zinc-700 transition-all font-medium text-sm"
                    >
                        下一页 →
                    </button>
                </div>
            </div>
        </div>
    );
}
export default App;
