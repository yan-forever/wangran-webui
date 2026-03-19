import '../App.css';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Login, Register } from '@/api/auth.ts';
import { useAuth } from '@/hooks/useAuth.tsx';
import useHeartCheck from '@/lib/heartCheck.ts';
import type { Merchant } from '@/types/merchants.ts';
import type { User } from '@/types/users.ts';
import {
    Button,
    Card,
    CardContent,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Separator,
    Switch,
} from '@/components/ui';

function Header() {
    const [isAuthPanel, setAuthPanel] = useState(false);
    const [authMode, setAuthMode] = useState(false);
    const { isAuthenticated, logout, role } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setMenuOpen] = useState(false);
    const serverState = useHeartCheck();
    return (
        <>
            <header className="relative top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline gap-1.5 cursor-pointer group select-none">
                        <Button
                            onClick={() => navigate('/')}
                            variant="ghost"
                            className="h-auto px-0 py-0 text-2xl font-black tracking-tight text-white group-hover:text-gray-200"
                        >
                            望冉
                        </Button>
                        <span className="bg-linear-to-br from-indigo-400 to-violet-500 bg-clip-text text-lg font-extrabold text-transparent">
                            webui
                        </span>
                        <span
                            className={`h-2 w-2 rounded-full ml-0.5 mb-1 animate-pulse transition-colors duration-300 ${
                                serverState
                                    ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]'
                                    : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                            }`}
                            title={serverState ? '服务运行正常' : '服务已断开连接'}
                        ></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="default">Click me</Button>

                        {isAuthenticated ? (
                            <div className="relative inline-block text-left">
                                <Button
                                    onClick={() => setMenuOpen(!isMenuOpen)}
                                    variant="outline"
                                    className="rounded-full bg-zinc-800 border-zinc-700 px-5 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600"
                                >
                                    我的
                                </Button>
                                <AnimatePresence>
                                    {isMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setMenuOpen(false)}
                                            ></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                                className="absolute right-0 z-50 mt-2 w-52 origin-top-right"
                                            >
                                                <Card className="border-zinc-700 bg-zinc-900/95 py-2">
                                                    <CardContent className="px-2">
                                                        <Button
                                                            onClick={() => {
                                                                navigate('/Me');
                                                                setMenuOpen(false);
                                                            }}
                                                            variant="ghost"
                                                            className="w-full justify-start text-zinc-200"
                                                        >
                                                            个人中心
                                                        </Button>

                                                        <Separator className="my-1 bg-zinc-800" />

                                                        <Button
                                                            onClick={() => {
                                                                if (role === 'admin')
                                                                    navigate('/console/admin');
                                                                if (role === 'merchant')
                                                                    navigate('/console/merchant');
                                                                if (role == 'user')
                                                                    navigate('/console/user');
                                                                setMenuOpen(false);
                                                            }}
                                                            variant="ghost"
                                                            className="w-full justify-start text-zinc-200"
                                                        >
                                                            {role == 'user' ? '订单' : '控制台'}
                                                        </Button>

                                                        <Separator className="my-1 bg-zinc-800" />

                                                        <Button
                                                            onClick={() => {
                                                                logout();
                                                                navigate('/');
                                                                setMenuOpen(false);
                                                            }}
                                                            variant="ghost"
                                                            className="w-full justify-start text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                                        >
                                                            退出登录
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <>
                                <Button
                                    onClick={() => {
                                        setAuthMode(true);
                                        setAuthPanel(true);
                                    }}
                                    variant="outline"
                                    className="rounded-full bg-zinc-800 border-zinc-700 px-5 text-zinc-100 hover:bg-zinc-700 hover:border-zinc-600"
                                >
                                    登录
                                </Button>
                                <Button
                                    onClick={() => {
                                        setAuthMode(false);
                                        setAuthPanel(true);
                                    }}
                                    className="rounded-full px-5 font-bold"
                                >
                                    注册
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </header>
            <AuthPanel
                isOpen={isAuthPanel}
                onClose={() => setAuthPanel(false)}
                authMode={authMode}
            />
        </>
    );
}

export function AuthPanel({
    isOpen,
    onClose,
    authMode,
}: {
    isOpen: boolean;
    onClose: () => void;
    authMode: boolean;
}) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md border-zinc-800 bg-zinc-950" showCloseButton={true}>
                <DialogHeader>
                    <DialogTitle className="text-zinc-100">
                        {authMode ? '登录望冉' : '注册望冉'}
                    </DialogTitle>
                    <DialogDescription>立即订票</DialogDescription>
                </DialogHeader>
                <AuthFormContent initialMode={authMode} onClose={onClose} />
            </DialogContent>
        </Dialog>
    );
}

function AuthFormContent({ initialMode, onClose }: { initialMode: boolean; onClose: () => void }) {
    const [mode, setMode] = useState(initialMode);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [tel, setTel] = useState('');
    const [isMerchant, setIsMerchant] = useState(false);
    const { login } = useAuth();
    type LoginPayload = {
        token?: string;
        account?: User | Merchant | null;
    };

    useEffect(() => {
        setMode(initialMode);
        setIdentifier('');
        setPassword('');
        setTel('');
        setIsMerchant(false);
    }, [initialMode]);

    const handleSubmitL = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (identifier.length > 50) return console.log('登录用户标识过长');
        if (password.length < 6 || password.length > 50) return console.log('登录密码过长或过短');
        try {
            const response = await Login(identifier, password);
            const payload = ((response as { data?: LoginPayload })?.data ??
                response) as LoginPayload;
            if (payload?.token !== undefined) {
                login(payload.token, payload.account ?? null);
            }
            onClose();
        } catch (error) {
            console.error('错误：', error);
        }
    };

    const handleSubmitR = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (tel.length < 11) return console.log('手机号错误');
        if (password.length < 6) return console.log('密码位数不足');
        try {
            await Register(tel, password, isMerchant);
            onClose();
        } catch (error) {
            console.error('错误', error);
        }
    };
    return (
        <div className="space-y-6">
            {mode ? (
                <form className="space-y-5" onSubmit={handleSubmitL}>
                    <div className="space-y-2">
                        <Label htmlFor="identifier">手机号或商户编号</Label>
                        <Input
                            id="identifier"
                            type="text"
                            placeholder="your account identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-login">密码</Label>
                        <Input
                            id="password-login"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <Button type="submit" className="w-full font-bold">
                        立即登陆
                    </Button>
                </form>
            ) : (
                <form className="space-y-5" onSubmit={handleSubmitR}>
                    <div className="space-y-2">
                        <Label htmlFor="register-phone">手机号</Label>
                        <Input
                            id="register-phone"
                            type="tel"
                            placeholder="your phone number"
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password-register">设置密码</Label>
                        <Input
                            id="password-register"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between rounded-md border border-zinc-800 px-3 py-2">
                        <Label htmlFor="ismerchant" className="cursor-pointer text-zinc-200">
                            注册为商户
                        </Label>
                        <Switch
                            id="ismerchant"
                            checked={isMerchant}
                            onCheckedChange={(checked) => setIsMerchant(Boolean(checked))}
                        />
                    </div>
                    <Button type="submit" className="w-full font-bold">
                        立即创建账号
                    </Button>
                </form>
            )}

            <Separator className="bg-zinc-800" />

            <div className="text-center text-sm text-zinc-500">
                {mode ? '没有账户？' : '已有账号？'}
                <Button
                    onClick={() => setMode(!mode)}
                    variant="link"
                    className="ml-1 h-auto p-0 font-semibold text-indigo-400 hover:text-indigo-300"
                >
                    {mode ? '去注册' : '去登录'}
                </Button>
            </div>
        </div>
    );
}
export default Header;
