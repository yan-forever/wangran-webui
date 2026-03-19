import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reviewMerchant } from '@/api/merchants.ts';
import { createOrganizer as createOrganizerApi } from '@/api/organizers.ts';
import { useAuth } from '@/hooks/useAuth.tsx';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Tabs,
    TabsList,
    TabsTrigger,
    Textarea,
} from '@/components/ui';

type ReviewResult = 'true' | 'false' | '';

function AdminConsole() {
    const { role, logout } = useAuth();
    const navigate = useNavigate();

    const [merchantPhoneNumber, setMerchantPhoneNumber] = useState('');
    const [approved, setApproved] = useState<ReviewResult>('');
    const [rejectReason, setRejectReason] = useState('');
    const [reviewPending, setReviewPending] = useState(false);

    const [organizer, setOrganizer] = useState({
        name: '',
        phoneNumber: '',
        address: '',
    });
    const [organizerPending, setOrganizerPending] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
        null,
    );

    useEffect(() => {
        if (role !== 'admin') {
            logout();
            navigate('/');
        }
    }, [logout, navigate, role]);

    const merchantsReview = async () => {
        try {
            setReviewPending(true);
            setFeedback(null);
            await reviewMerchant(
                Number(merchantPhoneNumber),
                approved === 'true',
                approved === 'false' ? rejectReason : undefined,
            );
            setMerchantPhoneNumber('');
            setApproved('');
            setRejectReason('');
            setFeedback({ type: 'success', message: '商户审核提交成功。' });
        } catch {
            setFeedback({ type: 'error', message: '商户审核提交失败，请稍后重试。' });
        } finally {
            setReviewPending(false);
        }
    };

    const createOrganizer = async () => {
        try {
            setOrganizerPending(true);
            setFeedback(null);
            await createOrganizerApi(
                organizer.name,
                Number(organizer.phoneNumber),
                organizer.address,
            );
            setOrganizer({ name: '', phoneNumber: '', address: '' });
            setFeedback({ type: 'success', message: '主办方创建成功。' });
        } catch {
            setFeedback({ type: 'error', message: '主办方创建失败，请检查信息后重试。' });
        } finally {
            setOrganizerPending(false);
        }
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
            {feedback && (
                <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                    <AlertTitle>{feedback.type === 'error' ? '操作失败' : '操作成功'}</AlertTitle>
                    <AlertDescription>{feedback.message}</AlertDescription>
                </Alert>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">商户入驻审核</CardTitle>
                        <CardDescription>核对商户手机号并给出审核结论</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="merchantPhoneNumber">商户手机号</Label>
                            <Input
                                id="merchantPhoneNumber"
                                type="tel"
                                value={merchantPhoneNumber}
                                onChange={(e) => setMerchantPhoneNumber(e.target.value)}
                                placeholder="请输入手机号"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>审核结论</Label>
                            <Tabs
                                value={approved}
                                onValueChange={(value) => setApproved(value as ReviewResult)}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="true">通过</TabsTrigger>
                                    <TabsTrigger value="false">驳回</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        {approved === 'false' && (
                            <div className="space-y-2">
                                <Label htmlFor="rejectReason">驳回原因</Label>
                                <Textarea
                                    id="rejectReason"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    placeholder="若驳回，请说明理由"
                                    className="min-h-24"
                                />
                            </div>
                        )}

                        <Button
                            type="button"
                            onClick={() => void merchantsReview()}
                            disabled={!approved || !merchantPhoneNumber || reviewPending}
                            className="w-full"
                        >
                            {reviewPending ? '提交中...' : '确认提交审核'}
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-zinc-800 bg-zinc-900/40">
                    <CardHeader>
                        <CardTitle className="text-zinc-100">创建主办方</CardTitle>
                        <CardDescription>新增主办方基础信息</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="organizerName">主办方名称</Label>
                            <Input
                                id="organizerName"
                                value={organizer.name}
                                onChange={(e) =>
                                    setOrganizer((prev) => ({ ...prev, name: e.target.value }))
                                }
                                placeholder="例如: XXX 演出公司"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organizerPhone">联系电话</Label>
                            <Input
                                id="organizerPhone"
                                type="tel"
                                value={organizer.phoneNumber}
                                onChange={(e) =>
                                    setOrganizer((prev) => ({
                                        ...prev,
                                        phoneNumber: e.target.value,
                                    }))
                                }
                                placeholder="请输入联系电话"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="organizerAddress">地址</Label>
                            <Input
                                id="organizerAddress"
                                value={organizer.address}
                                onChange={(e) =>
                                    setOrganizer((prev) => ({ ...prev, address: e.target.value }))
                                }
                                placeholder="请输入地址"
                            />
                        </div>
                        <Button
                            type="button"
                            onClick={() => void createOrganizer()}
                            disabled={
                                !organizer.name ||
                                !organizer.phoneNumber ||
                                !organizer.address ||
                                organizerPending
                            }
                            className="w-full"
                        >
                            {organizerPending ? '创建中...' : '确认创建'}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AdminConsole;
