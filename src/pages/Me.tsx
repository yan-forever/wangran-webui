import { useEffect, useState } from 'react';
import { getMerchantById, patchMerchantById } from '@/api/merchants.ts';
import { getUser, upDataUser } from '@/api/users.ts';
import {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Input,
    Label,
    Separator,
} from '@/components/ui';
import { useAuth } from '@/hooks/useAuth.tsx';
import { useNavigate } from 'react-router-dom';

function Me() {
    const { isAuthenticated, login, logout, role, token, username, id, phoneNumber, merchantCode } =
        useAuth();
    const navigate = useNavigate();
    const [writeName, setWriteName] = useState(false);
    const [writeTel, setWriteTel] = useState(false);
    const [newUsername, setNewUsername] = useState<string>(username || '');
    const [newPhoneNumber, setNewPhoneNumber] = useState<string>(phoneNumber || '');
    const [isSavingName, setIsSavingName] = useState(false);
    const [isSavingTel, setIsSavingTel] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
        null,
    );

    /* eslint-disable react-hooks/set-state-in-effect */
    useEffect(() => {
        setNewUsername(username || '');
    }, [username]);

    useEffect(() => {
        setNewPhoneNumber(phoneNumber || '');
    }, [phoneNumber]);
    /* eslint-enable react-hooks/set-state-in-effect */

    useEffect(() => {
        if (id === null) {
            logout();
            navigate('/');
            return;
        }
        const getUserData = async () => {
            if (isAuthenticated) {
                try {
                    const account =
                        role === 'user' ? await getUser(id) : await getMerchantById(id);
                    if (token && account) {
                        login(token, account);
                    }
                } catch (error) {
                    logout();
                    navigate('/');
                }
            }
        };
        getUserData().then(() => console.log('用户信息已更新'));
    }, [id, isAuthenticated, login, logout, navigate, role, token]);

    const changeUserData = async (
        mode: 'phoneNumber' | 'username' | 'password',
        newData: string,
    ): Promise<boolean> => {
        const patchData = {
            [mode]: newData,
        };

        try {
            const account =
                role === 'user'
                    ? await upDataUser(id!, patchData.phoneNumber, patchData.password, patchData.username)
                    : await patchMerchantById(id!, patchData);
            if (token != null) {
                login(token, account);
            } else {
                logout();
            }
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleSaveName = async () => {
        if (!newUsername.trim()) {
            setFeedback({ type: 'error', message: '用户名不能为空。' });
            return;
        }

        setIsSavingName(true);
        setFeedback(null);
        const ok = await changeUserData('username', newUsername.trim());
        setIsSavingName(false);
        setWriteName(false);

        if (!ok) {
            setFeedback({ type: 'error', message: '用户名更新失败，请稍后重试。' });
            return;
        }

        setFeedback({ type: 'success', message: '用户名已更新，请重新登录。' });
        logout();
        navigate('/');
    };

    const handleSaveTel = async () => {
        if (!newPhoneNumber.trim()) {
            setFeedback({ type: 'error', message: '手机号不能为空。' });
            return;
        }

        setIsSavingTel(true);
        setFeedback(null);
        const ok = await changeUserData('phoneNumber', newPhoneNumber.trim());
        setIsSavingTel(false);
        setWriteTel(false);

        if (!ok) {
            setFeedback({ type: 'error', message: '手机号更新失败，请稍后重试。' });
            return;
        }

        setFeedback({ type: 'success', message: '手机号已更新，请重新登录。' });
        logout();
        navigate('/');
    };

    return (
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <Card className="w-full max-w-xl border-zinc-800 bg-zinc-900/40">
                <CardHeader>
                    <CardTitle>{role === 'user' ? '个人信息' : '商户信息'}</CardTitle>
                    <CardDescription>可在此查看并修改账户资料</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                    {feedback && (
                        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'}>
                            <AlertTitle>{feedback.type === 'error' ? '操作失败' : '操作成功'}</AlertTitle>
                            <AlertDescription>{feedback.message}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="profile-role">账户类型</Label>
                        <div id="profile-role">
                            <Badge variant="outline">{role === 'merchant' ? '商户' : '用户'}</Badge>
                        </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="space-y-2">
                        <Label htmlFor="profile-username">用户名</Label>
                        <div className="flex items-center gap-2">
                            {writeName ? (
                                <Input
                                    id="profile-username"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder="your new username"
                                />
                            ) : (
                                <Input id="profile-username" value={username || ''} readOnly />
                            )}
                            <Button
                                type="button"
                                variant={writeName ? 'default' : 'outline'}
                                disabled={isSavingName}
                                onClick={() => {
                                    if (writeName) {
                                        void handleSaveName();
                                        return;
                                    }
                                    setWriteName(true);
                                }}
                            >
                                {writeName ? (isSavingName ? '保存中...' : '保存') : '修改'}
                            </Button>
                        </div>
                    </div>

                    <Separator className="bg-zinc-800" />

                    <div className="space-y-2">
                        <Label htmlFor="profile-phone">手机号</Label>
                        <div className="flex items-center gap-2">
                            {writeTel ? (
                                <Input
                                    id="profile-phone"
                                    type="tel"
                                    value={newPhoneNumber}
                                    onChange={(e) => setNewPhoneNumber(e.target.value)}
                                    placeholder="your new phone number"
                                />
                            ) : (
                                <Input id="profile-phone" value={phoneNumber || ''} readOnly />
                            )}
                            <Button
                                type="button"
                                variant={writeTel ? 'default' : 'outline'}
                                disabled={isSavingTel}
                                onClick={() => {
                                    if (writeTel) {
                                        void handleSaveTel();
                                        return;
                                    }
                                    setWriteTel(true);
                                }}
                            >
                                {writeTel ? (isSavingTel ? '保存中...' : '保存') : '修改'}
                            </Button>
                        </div>
                    </div>

                    {role === 'merchant' && (
                        <>
                            <Separator className="bg-zinc-800" />
                            <div className="space-y-2">
                                <Label htmlFor="merchant-code">商户编码</Label>
                                <Input id="merchant-code" value={merchantCode || '暂无代码'} readOnly />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default Me;
