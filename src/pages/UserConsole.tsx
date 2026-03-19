import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import type { Order } from '@/types/orders.ts';
import { getOrders, refundOrder } from '@/api/orders.ts';
import { formatDate } from '@/lib/tool.ts';
import { useAuth } from '@/hooks/useAuth.tsx';
import {
    Alert,
    AlertDescription,
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsList,
    TabsTrigger,
} from '@/components/ui';

const PAGE_SIZE = 10;

function UserConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [refunded, setRefunded] = useState(false);
    const [pendingRefundOrderId, setPendingRefundOrderId] = useState<number | null>(null);
    const [refundPending, setRefundPending] = useState(false);

    useEffect(() => {
        if (role !== 'user') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    const {
        data: orders = [],
        isLoading,
        isError,
        isFetching,
        refetch,
    } = useQuery<Order[]>({
        queryKey: ['orders', page, refunded],
        queryFn: () => getOrders(page, PAGE_SIZE, refunded),
    });

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Card className="w-full border-zinc-800 bg-zinc-900/40">
                <CardHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>{refunded ? '已退款订单' : '有效订单'}</CardTitle>
                            <CardDescription>查看订单并处理退款申请</CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => void refetch()} disabled={isFetching}>
                            {isFetching ? '刷新中...' : '刷新'}
                        </Button>
                    </div>

                    <Tabs
                        value={refunded ? 'refunded' : 'valid'}
                        onValueChange={(value) => {
                            setRefunded(value === 'refunded');
                            setPage(1);
                        }}
                    >
                        <TabsList>
                            <TabsTrigger value="valid">有效订单</TabsTrigger>
                            <TabsTrigger value="refunded">已退款订单</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </CardHeader>

                <CardContent className="space-y-4">
                    {isError && (
                        <Alert variant="destructive">
                            <AlertTitle>数据加载失败</AlertTitle>
                            <AlertDescription>获取订单失败，请稍后重试。</AlertDescription>
                        </Alert>
                    )}

                    {isLoading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : orders.length === 0 ? (
                        <p className="text-sm text-zinc-400">
                            暂无{refunded ? '已退款' : '有效'}订单记录。
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>活动名称</TableHead>
                                    <TableHead>活动时间</TableHead>
                                    <TableHead>城市</TableHead>
                                    <TableHead>票号</TableHead>
                                    <TableHead>状态</TableHead>
                                    <TableHead>下单时间</TableHead>
                                    <TableHead className="text-right">金额</TableHead>
                                    <TableHead className="text-right">操作</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>{order.eventObject?.eventName || '未知活动'}</TableCell>
                                        <TableCell>
                                            {formatDate(order.eventObject?.eventTime)}
                                        </TableCell>
                                        <TableCell>{order.eventObject?.city || '-'}</TableCell>
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
                                        <TableCell className="text-right">
                                            {!order.refunded && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => setPendingRefundOrderId(order.id)}
                                                >
                                                    申请退款
                                                </Button>
                                            )}
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

            <AlertDialog
                open={pendingRefundOrderId !== null}
                onOpenChange={(open) => !open && setPendingRefundOrderId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>确认申请退款？</AlertDialogTitle>
                        <AlertDialogDescription>
                            退款后订单将标记为已退款，操作不可撤销。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={refundPending}
                            onClick={async () => {
                                if (pendingRefundOrderId === null) return;
                                setRefundPending(true);
                                try {
                                    await refundOrder(pendingRefundOrderId);
                                    setPendingRefundOrderId(null);
                                    await refetch();
                                } finally {
                                    setRefundPending(false);
                                }
                            }}
                        >
                            {refundPending ? '提交中...' : '确认退款'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

export default UserConsole;
