import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle, Loader2, RotateCcw } from 'lucide-react';
import { bookEvent, getPublicEvents } from '@/api/events.ts';
import { useAuth } from '@/hooks/useAuth.tsx';
import { formatDateShort, getSaleStatus } from '@/lib/tool.ts';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx';
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
    Skeleton,
} from '@/components/ui';

export function Home() {
    const [eventType, setEventType] = useState('');
    const [city, setCity] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [queryParams, setQueryParams] = useState({
        eventType: '',
        city: '',
        startTime: '',
        endTime: '',
    });
    const [now, setNow] = useState(() => Date.now());
    const [page, setPage] = useState(1);

    const { role } = useAuth();
    const pageSize = 12;

    useEffect(() => {
        const timer = window.setInterval(() => setNow(Date.now()), 60_000);
        return () => window.clearInterval(timer);
    }, []);

    const { data: events, isLoading, isError, isFetching } = useQuery({
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
        placeholderData: (previousData) => previousData,
    });

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

    const getEventKey = (
        id: number | string | null | undefined,
        eventCode: string | null | undefined,
        name: string | null | undefined,
        time: string | null | undefined,
        location: string | null | undefined,
    ) => {
        if (id !== null && id !== undefined) return id;
        if (eventCode) return eventCode;
        return `${name || 'event'}-${time || 'time'}-${location || 'city'}`;
    };

    const getSaleStatusNow = (saleStart: string | null, saleEnd: string | null) =>
        getSaleStatus(saleStart, saleEnd, now);

    const getSaleBadgeVariant = (status: string) => {
        if (status === '售票中') return 'default';
        if (status === '未开售') return 'secondary';
        return 'outline';
    };

    return (
        <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">探索精彩活动</h1>
                    <p className="text-sm text-zinc-400 sm:text-base">发现、购票、享受精彩时刻</p>
                </div>

                <Card className="border-zinc-800 bg-zinc-900/50">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-zinc-100">高级搜索</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <div className="space-y-2">
                                <Label htmlFor="eventType" className="text-zinc-300">活动类型</Label>
                                <Input
                                    id="eventType"
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    placeholder="搜索活动类型..."
                                    className="border-zinc-700 bg-zinc-950 text-zinc-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="city" className="text-zinc-300">城市</Label>
                                <Input
                                    id="city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder="搜索城市..."
                                    className="border-zinc-700 bg-zinc-950 text-zinc-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startTime" className="text-zinc-300">开始时间</Label>
                                <Input
                                    id="startTime"
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="border-zinc-700 bg-zinc-950 text-zinc-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime" className="text-zinc-300">结束时间</Label>
                                <Input
                                    id="endTime"
                                    type="datetime-local"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="border-zinc-700 bg-zinc-950 text-zinc-200"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button onClick={handleSearch} className="min-w-24">搜索</Button>
                            <Button variant="outline" onClick={handleReset} title="重置" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                                <RotateCcw className="size-4" />
                            </Button>
                            {isFetching && (
                                <span className="inline-flex items-center gap-2 text-xs text-zinc-400">
                                    <Loader2 className="size-3 animate-spin" /> 刷新中
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Separator className="bg-zinc-800" />

                {isLoading ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <Card key={index} className="border-zinc-800 bg-zinc-900/50">
                                <CardHeader className="space-y-3">
                                    <Skeleton className="h-4 w-2/3 bg-zinc-800" />
                                    <Skeleton className="h-3 w-1/3 bg-zinc-800" />
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Skeleton className="h-3 w-full bg-zinc-800" />
                                    <Skeleton className="h-3 w-full bg-zinc-800" />
                                    <Skeleton className="h-9 w-full bg-zinc-800" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : isError ? (
                    <Alert variant="destructive" className="border-red-900/30 bg-red-950/30">
                        <AlertCircle className="size-4" />
                        <AlertTitle>数据加载失败</AlertTitle>
                        <AlertDescription>请检查网络连接或稍后重试。</AlertDescription>
                    </Alert>
                ) : events && events.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {events.map((event) => {
                            const saleStatus = getSaleStatusNow(event.saleStartTime, event.saleEndTime);
                            return (
                                <Card
                                    key={getEventKey(
                                        event.id,
                                        event.eventCode,
                                        event.eventName,
                                        event.eventTime,
                                        event.city,
                                    )}
                                    className="border-zinc-800 bg-zinc-900/50"
                                >
                                    <CardHeader className="space-y-3">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-200">{event.eventType || '未分类'}</Badge>
                                            <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300">📍 {event.city || '未知城市'}</Badge>
                                            <Badge
                                                variant={getSaleBadgeVariant(saleStatus)}
                                                className={
                                                    saleStatus === '售票中'
                                                        ? 'bg-emerald-500/20 text-emerald-300'
                                                        : saleStatus === '未开售'
                                                          ? 'bg-amber-500/20 text-amber-300'
                                                          : 'border-zinc-700 bg-zinc-800 text-zinc-300'
                                                }
                                            >
                                                {saleStatus}
                                            </Badge>
                                        </div>
                                        <CardTitle className="line-clamp-2 text-zinc-100">{event.eventName}</CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-950/80 p-3 text-sm">
                                            <div>
                                                <p className="text-zinc-500">价格</p>
                                                <p className="font-semibold text-zinc-100">{event.price && event.price > 0 ? `¥${event.price}` : '免费'}</p>
                                            </div>
                                            <div>
                                                <p className="text-zinc-500">库存</p>
                                                <p className="font-semibold text-zinc-100">{event.stock ?? '未知'}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 text-xs text-zinc-400">
                                            <p className="flex items-center justify-between"><span>活动时间</span><span className="text-zinc-200">{formatDateShort(event.eventTime)}</span></p>
                                            <p className="flex items-center justify-between"><span>开售时间</span><span className="text-zinc-200">{formatDateShort(event.saleStartTime)}</span></p>
                                            <p className="flex items-center justify-between"><span>停售时间</span><span className="text-zinc-200">{formatDateShort(event.saleEndTime)}</span></p>
                                        </div>

                                        <Button
                                            className="w-full"
                                            variant="outline"
                                            onClick={() => {
                                                if (role === 'guest') {
                                                    window.alert('请先登录后再订票');
                                                    return;
                                                }
                                                if (role === 'user') {
                                                    if (window.confirm('订此票？') && event.id !== undefined) {
                                                        void bookEvent(event.id);
                                                    }
                                                    return;
                                                }
                                                window.alert('非用户不能订票');
                                            }}
                                        >
                                            立即订票
                                        </Button>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card className="border-dashed border-zinc-800 bg-zinc-900/30">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <p className="mb-1 text-lg font-medium text-zinc-300">暂无相关活动</p>
                            <p className="text-sm text-zinc-500">换个搜索条件试试看？</p>
                        </CardContent>
                    </Card>
                )}

                <div className="flex items-center justify-center gap-3">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="border-zinc-700 bg-zinc-900 text-zinc-200"
                    >
                        上一页
                    </Button>
                    <span className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-300">Page {page}</span>
                    <Button
                        variant="outline"
                        disabled={!events || events.length < pageSize}
                        onClick={() => setPage((p) => p + 1)}
                        className="border-zinc-700 bg-zinc-900 text-zinc-200"
                    >
                        下一页
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Home;

