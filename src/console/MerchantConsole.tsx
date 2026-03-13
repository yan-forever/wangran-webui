import * as React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext.tsx';
import { useNavigate } from 'react-router-dom';
import request from '../Utils/requestDeal.ts';
import type { EventsData, Organizer } from '../Utils/interface.tsx';
import { AnimatePresence, motion } from 'framer-motion';
import { getEvents, getOrganizers } from '../Utils/request.ts';
import { formatTime } from '../Utils/tool.ts';

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
                    {activeTab === 'orders' && <div className="text-white">订单组件占位</div>}
                </div>
            </main>
        </div>
    );
}

function Tickets() {
    const [isCreate, setIsCreate] = useState(false);
    const [events, setEvents] = useState<EventsData[]>([]);
    const [page, setPage] = useState(1);
    const [editingId, setEditingId] = useState<string | null>(null);
    useEffect(() => {
        const getData = async () => {
            const response = await getEvents(page, 10);
            setEvents(response);
        };
        getData();
    }, [page]);

    const editEvent = async (e: React.MouseEvent<HTMLButtonElement>) => {
        setEditingId(e.currentTarget.id);
    };

    return (
        <>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white tracking-tight">我的票务</h2>
                    <button
                        onClick={() => setIsCreate(true)}
                        className=" px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-lg shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all active:scale-95 flex items-center gap-2"
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
                <CreatePanel status={isCreate} onClosed={() => setIsCreate(false)} />
                <div className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 min-h-75">
                    {events.length === 0 ? (
                        <div className="p-4 text-center text-sm text-zinc-500">暂无数据</div>
                    ) : (
                        events.map((data) => {
                            return (
                                <div
                                    key={data.id}
                                    id={data.id || ''}
                                    className="group relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 mb-4 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:border-indigo-500/40 hover:bg-zinc-900/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                                >
                                    {/* 左侧：活动基本信息 */}
                                    <div className="flex flex-col gap-2.5">
                                        {/* 标题与标签行 */}
                                        <div className="flex items-center gap-3">
                                            {editingId == data.id ? (
                                                <input />
                                            ) : (
                                                <h3 className="text-lg font-bold text-zinc-100 group-hover:text-indigo-400 transition-colors">
                                                    {data.eventName || '未命名票务'}
                                                </h3>
                                            )}

                                            {/* 票务类型标签 */}
                                            {data.eventType && (
                                                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                                                    {data.eventType}
                                                </span>
                                            )}

                                            {/* 售卖状态标识 (可以根据你的业务逻辑修改判断条件) */}
                                            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                                售卖中
                                            </span>
                                        </div>

                                        {/* 时间与地点行 */}
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

                                    {/* 右侧：财务数据与操作 */}
                                    <div className="flex items-center gap-8 mt-4 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                                        {/* 价格统计 */}
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-500 font-medium mb-1">
                                                单价
                                            </div>
                                            <div className="text-xl font-black text-rose-400">
                                                ¥{data.price || 0}
                                            </div>
                                        </div>

                                        {/* 库存统计 */}
                                        <div className="text-right">
                                            <div className="text-xs text-zinc-500 font-medium mb-1">
                                                剩余库存
                                            </div>
                                            <div className="text-xl font-bold text-zinc-100">
                                                {data.stock || 0}
                                            </div>
                                        </div>

                                        {/* 操作按钮 (例如：编辑) */}
                                        <div className="pl-4 border-l border-zinc-800 flex items-center">
                                            <button
                                                id={data.id || ''}
                                                onClick={(e) => {
                                                    editEvent(e);
                                                }}
                                                className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all active:scale-95"
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

function CreatePanel({ status, onClosed }: { status: boolean; onClosed: () => void }) {
    const [organizerOptions, setOrganizerOptions] = useState<Organizer[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [eventData, setEventData] = useState<EventsData>({
        eventName: '',
        eventTime: '',
        eventType: '',
        city: '',
        price: NaN,
        organizers: [],
        stock: NaN,
        saleStartTime: '',
        saleEndTime: '',
    });

    useEffect(() => {
        const getData = async () => {
            const data = await getOrganizers(1, 100);
            setOrganizerOptions(data);
        };
        getData();
    }, []);

    const createEvent = async (e: React.SubmitEvent) => {
        e.preventDefault();

        //深拷贝一份数据，准备专门发给后端（不要直接修改原 state）
        const payload = { ...eventData };
        const formatToInstant = (timeStr: string | number | null) => {
            if (!timeStr) return null;
            // new Date 会自动把本地时间转换成标准的 UTC ISO-8601 格式
            return new Date(timeStr as string).toISOString();
        };
        payload.eventTime = formatToInstant(payload.eventTime as string);
        payload.saleStartTime = formatToInstant(payload.saleStartTime as string);
        payload.saleEndTime = formatToInstant(payload.saleEndTime as string);
        // 4. 发送处理好的 payload，而不是原始的 eventData
        const response = await request.post(`/events`, payload);
        console.log('创建成功', response);

        // 5. 体验优化：创建成功后自动关闭弹窗，并清空表单
        alert('创建成功！');
        onClosed();
        setEventData({
            eventName: '',
            eventTime: '',
            eventType: '',
            city: '',
            price: NaN,
            organizers: [],
            stock: NaN,
            saleStartTime: '',
            saleEndTime: '',
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const toggleOrganizer = (idStr: string | null) => {
        if (!idStr) return;
        const idNum = Number(idStr);

        setEventData((prev) => {
            // 获取当前已选的数组，如果是 null 则默认为空数组 []
            const currentSelected = prev.organizers || [];
            let newSelected;

            if (currentSelected.includes(idNum)) {
                // 如果已经选中了，就把它过滤掉（取消选中）
                newSelected = currentSelected.filter((orgId) => orgId !== idNum);
            } else {
                // 如果没选中，就把它加进数组（新增选中）
                newSelected = [...currentSelected, idNum];
            }

            return { ...prev, organizers: newSelected };
        });
    };

    const selectedCount = (eventData.organizers || []).length;

    return (
        <AnimatePresence>
            {status && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
                        /* 1. 增加最大宽度 max-w-3xl (约 768px) 或 max-w-4xl */
                        className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 to-violet-600"></div>

                        <div className="px-8 py-10">
                            <h2 className="text-2xl font-bold text-white text-center mb-8">
                                新建票务信息
                            </h2>
                            <form
                                className="grid grid-cols-2 gap-x-8 gap-y-5"
                                onSubmit={createEvent}
                            >
                                <div className="col-span-2">
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
                                        票价
                                    </label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={eventData.price || ''}
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
                                        value={eventData.stock || ''}
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

                                    {/* 触发器（无改变） */}
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
                                                            const isSelected = (
                                                                eventData.organizers || []
                                                            ).includes(idNum);

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
                                        onClick={() => createEvent}
                                        className="w-full py-3 px-6 rounded-xl bg-linear-to-r from-indigo-600 to-violet-700 text-white font-bold hover:from-indigo-500 hover:to-violet-600 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                                    >
                                        发布票务
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
