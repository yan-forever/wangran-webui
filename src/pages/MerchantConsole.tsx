import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createEvent, deleteEvent, getMerchantEvents, upDataEvent } from '@/api/events.ts';
import { getOrdersMerchant } from '@/api/orders.ts';
import { getOrganizers } from '@/api/organizers.ts';
import { useAuth } from '@/hooks/useAuth.tsx';
import { formatDate, toOrganizerIds } from '@/lib/tool.ts';
import type { EventsData } from '@/types/events.ts';
import type { MerchantOrders } from '@/types/orders.ts';
import type { Organizer } from '@/types/organizers.ts';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Skeleton,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui';

const PAGE_SIZE = 10;

const emptyEventData: EventsData = {
    eventName: '',
    eventTime: '',
    eventType: '',
    city: '',
    price: 0,
    organizers: [],
    stock: 0,
    onShelf: false,
    saleStartTime: '',
    saleEndTime: '',
};

function MerchantConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('tickets');

    useEffect(() => {
        if (role !== 'merchant') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full gap-5">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="tickets">我的票务</TabsTrigger>
                    <TabsTrigger value="orders">全部订单</TabsTrigger>
                </TabsList>

                <TabsContent value="tickets">
                    <TicketsPanel />
                </TabsContent>
                <TabsContent value="orders">
                    <OrdersPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function TicketsPanel() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editing, setEditing] = useState<EventsData | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const {
        data: events = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery<EventsData[]>({
        queryKey: ['merchant-events', 1, PAGE_SIZE],
        queryFn: () => getMerchantEvents(1, PAGE_SIZE),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteEvent(id),
        onSuccess: () => void refetch(),
    });

    return (
        <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                    <CardTitle>我的票务</CardTitle>
                    <CardDescription>管理票务信息、库存与上架状态</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? '刷新中...' : '刷新'}
                    </Button>
                    <Button onClick={() => setIsCreateOpen(true)}>创建票务</Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {isError && (
                    <Alert variant="destructive">
                        <AlertTitle>数据加载失败</AlertTitle>
                        <AlertDescription>票务列表获取失败，请稍后重试。</AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-sm text-zinc-400">暂无票务数据。</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>名称</TableHead>
                                <TableHead>类型</TableHead>
                                <TableHead>城市</TableHead>
                                <TableHead>活动时间</TableHead>
                                <TableHead>库存</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {events.map((event) => (
                                <TableRow key={event.id ?? event.eventCode ?? event.eventName}>
                                    <TableCell>{event.eventName || '未命名票务'}</TableCell>
                                    <TableCell>{event.eventType || '-'}</TableCell>
                                    <TableCell>{event.city || '-'}</TableCell>
                                    <TableCell>{formatDate(event.eventTime)}</TableCell>
                                    <TableCell>{event.stock}</TableCell>
                                    <TableCell>
                                        <Badge variant={event.onShelf ? 'default' : 'secondary'}>
                                            {event.onShelf ? '已上架' : '未上架'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="space-x-2 text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditing(event)}
                                            disabled={!!event.onShelf}
                                        >
                                            编辑
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                setDeletingId(
                                                    event.id === undefined ? null : Number(event.id),
                                                )
                                            }
                                            disabled={!!event.onShelf || event.id === undefined}
                                        >
                                            删除
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            <EventFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
            <EventFormDialog
                open={editing !== null}
                onOpenChange={(open) => {
                    if (!open) setEditing(null);
                }}
                source={editing ?? undefined}
            />

            <AlertDialog open={deletingId !== null} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认删除该票务？</AlertDialogTitle>
                        <AlertDialogDescription>
                            删除后无法恢复，且已上架票务不允许删除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            onClick={async () => {
                                if (deletingId === null) return;
                                await deleteMutation.mutateAsync(deletingId);
                                setDeletingId(null);
                            }}
                        >
                            确认删除
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}

function OrdersPanel() {
    const [page, setPage] = useState(1);
    const [refunded, setRefunded] = useState<boolean | null>(null);

    const {
        data: orders = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery<MerchantOrders[]>({
        queryKey: ['merchant-orders', page, refunded],
        queryFn: () => getOrdersMerchant(page, PAGE_SIZE, refunded),
    });

    const statusValue = refunded === null ? 'all' : refunded ? 'refunded' : 'valid';

    return (
        <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>订单管理</CardTitle>
                        <CardDescription>查看商户订单与退款状态</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                        {isFetching ? '刷新中...' : '刷新'}
                    </Button>
                </div>
                <Tabs
                    value={statusValue}
                    onValueChange={(value) => {
                        setPage(1);
                        if (value === 'all') setRefunded(null);
                        if (value === 'valid') setRefunded(false);
                        if (value === 'refunded') setRefunded(true);
                    }}
                >
                    <TabsList>
                        <TabsTrigger value="all">全部</TabsTrigger>
                        <TabsTrigger value="valid">有效</TabsTrigger>
                        <TabsTrigger value="refunded">已退款</TabsTrigger>
                    </TabsList>
                </Tabs>
            </CardHeader>
            <CardContent className="space-y-4">
                {isError && (
                    <Alert variant="destructive">
                        <AlertTitle>数据加载失败</AlertTitle>
                        <AlertDescription>订单数据获取失败，请稍后重试。</AlertDescription>
                    </Alert>
                )}

                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : orders.length === 0 ? (
                    <p className="text-sm text-zinc-400">暂无符合条件的订单。</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>活动</TableHead>
                                <TableHead>用户</TableHead>
                                <TableHead>票号</TableHead>
                                <TableHead>状态</TableHead>
                                <TableHead>下单时间</TableHead>
                                <TableHead className="text-right">金额</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell>{order.eventObject?.eventName || '未知活动'}</TableCell>
                                    <TableCell>{order.userId}</TableCell>
                                    <TableCell className="font-mono">{order.ticketCode}</TableCell>
                                    <TableCell>
                                        <Badge variant={order.refunded ? 'outline' : 'default'}>
                                            {order.refunded ? '已退款' : '有效'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{formatDate(order.createTime)}</TableCell>
                                    <TableCell className="text-right">
                                        {`¥${order.eventObject?.price ?? 0}`}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                <div className="flex items-center justify-between">
                    <Button
                        variant="outline"
                        disabled={page === 1}
                        onClick={() => setPage((current) => Math.max(1, current - 1))}
                    >
                        上一页
                    </Button>
                    <span className="text-sm text-zinc-400">第 {page} 页</span>
                    <Button
                        variant="outline"
                        disabled={orders.length < PAGE_SIZE}
                        onClick={() => setPage((current) => current + 1)}
                    >
                        下一页
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function EventFormDialog({
    open,
    onOpenChange,
    source,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    source?: EventsData;
}) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<EventsData>(emptyEventData);
    const [formError, setFormError] = useState<string | null>(null);

    const { data: organizerOptions = [] } = useQuery<Organizer[]>({
        queryKey: ['organizers'],
        queryFn: () => getOrganizers(1, 100),
        enabled: open,
    });

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        if (!open) return;

        setFormData(
            source
                ? {
                      ...source,
                      onShelf: Boolean(source.onShelf),
                      organizers: toOrganizerIds(source.organizers),
                  }
                : { ...emptyEventData },
        );
        setFormError(null);
    }, [open, source]);
    /* eslint-enable react-hooks/set-state-in-effect */

    const isUpdating = Boolean(source);

    const payloadForUpdate = useMemo(() => {
        if (!source) return null;

        const nextOrganizers = toOrganizerIds(formData.organizers).sort((a, b) => a - b);
        const prevOrganizers = toOrganizerIds(source.organizers).sort((a, b) => a - b);
        const payload: Partial<Omit<EventsData, 'id' | 'eventCode'>> = {};

        if (formData.eventName !== source.eventName) payload.eventName = formData.eventName;
        if (formData.eventType !== source.eventType) payload.eventType = formData.eventType;
        if (formData.eventTime !== source.eventTime) payload.eventTime = formData.eventTime;
        if (formData.city !== source.city) payload.city = formData.city;
        if (formData.price !== source.price) payload.price = formData.price;
        if (formData.stock !== source.stock) payload.stock = formData.stock;
        if (formData.saleStartTime !== source.saleStartTime) payload.saleStartTime = formData.saleStartTime;
        if (formData.saleEndTime !== source.saleEndTime) payload.saleEndTime = formData.saleEndTime;
        if (formData.onShelf !== source.onShelf) payload.onShelf = formData.onShelf;
        if (
            nextOrganizers.length !== prevOrganizers.length ||
            nextOrganizers.some((value, index) => value !== prevOrganizers[index])
        ) {
            payload.organizers = nextOrganizers;
        }

        return payload;
    }, [formData, source]);

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (isUpdating) {
                if (!source?.id) throw new Error('缺少票务 id');
                if (!payloadForUpdate || Object.keys(payloadForUpdate).length === 0) {
                    throw new Error('未检测到修改内容');
                }
                return upDataEvent(source.id, payloadForUpdate);
            }

            return createEvent(formData);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['merchant-events'] });
            onOpenChange(false);
        },
    });

    const selectedOrganizers = toOrganizerIds(formData.organizers);

    const toggleOrganizer = (id: number) => {
        setFormData((current) => {
            const selected = toOrganizerIds(current.organizers);
            const next = selected.includes(id)
                ? selected.filter((item) => item !== id)
                : [...selected, id];
            return { ...current, organizers: next };
        });
    };

    const validate = () => {
        if (!formData.eventName || !formData.eventType || !formData.eventTime || !formData.city) {
            return '请完善票务基础信息';
        }
        if (!formData.saleStartTime || !formData.saleEndTime) {
            return '请填写销售起止时间';
        }
        if (formData.stock < 0 || formData.price < 0) {
            return '价格和库存不能为负数';
        }
        return null;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>{isUpdating ? '编辑票务' : '创建票务'}</DialogTitle>
                    <DialogDescription>请填写票务信息，保存后将自动刷新列表。</DialogDescription>
                </DialogHeader>

                {formError && (
                    <Alert variant="destructive">
                        <AlertTitle>保存失败</AlertTitle>
                        <AlertDescription>{formError}</AlertDescription>
                    </Alert>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="eventName">票务名称</Label>
                        <Input
                            id="eventName"
                            value={formData.eventName}
                            onChange={(e) => setFormData((prev) => ({ ...prev, eventName: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="eventType">票务类型</Label>
                        <Input
                            id="eventType"
                            value={formData.eventType}
                            onChange={(e) => setFormData((prev) => ({ ...prev, eventType: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="eventTime">举办时间</Label>
                        <Input
                            id="eventTime"
                            type="datetime-local"
                            value={formData.eventTime}
                            onChange={(e) => setFormData((prev) => ({ ...prev, eventTime: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">举办城市</Label>
                        <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="price">票价</Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, price: Number(e.target.value) }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="stock">库存</Label>
                        <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="saleStartTime">开售时间</Label>
                        <Input
                            id="saleStartTime"
                            type="datetime-local"
                            value={formData.saleStartTime}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, saleStartTime: e.target.value }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="saleEndTime">停售时间</Label>
                        <Input
                            id="saleEndTime"
                            type="datetime-local"
                            value={formData.saleEndTime}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, saleEndTime: e.target.value }))
                            }
                        />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <div>
                                <Label htmlFor="onShelf">上架状态</Label>
                                <p className="text-xs text-zinc-400">开启后活动将对用户可见</p>
                            </div>
                            <Switch
                                id="onShelf"
                                checked={Boolean(formData.onShelf)}
                                onCheckedChange={(checked) =>
                                    setFormData((prev) => ({ ...prev, onShelf: checked }))
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                        <Label>主办方</Label>
                        <div className="flex flex-wrap gap-2 rounded-md border p-3">
                            {organizerOptions.length === 0 && (
                                <span className="text-sm text-zinc-400">暂无可选主办方</span>
                            )}
                            {organizerOptions.map((organizer) => {
                                const organizerId = Number(organizer.id);
                                const active = selectedOrganizers.includes(organizerId);
                                return (
                                    <Button
                                        key={organizer.id}
                                        type="button"
                                        variant={active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => toggleOrganizer(organizerId)}
                                    >
                                        {organizer.name}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        onClick={async () => {
                            const message = validate();
                            if (message) {
                                setFormError(message);
                                return;
                            }

                            try {
                                setFormError(null);
                                await saveMutation.mutateAsync();
                            } catch (error) {
                                setFormError(
                                    error instanceof Error ? error.message : '提交失败，请稍后重试。',
                                );
                            }
                        }}
                        disabled={saveMutation.isPending}
                    >
                        {saveMutation.isPending ? '提交中...' : isUpdating ? '保存更新' : '创建票务'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default MerchantConsole;
