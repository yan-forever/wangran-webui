//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import { useState} from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import * as React from "react";

function App() {
    const [isRegisterPanel,setResisterPanel] = useState(false);
    return (
        <>
            <header className="sticky top-0 z-50 w-full bg-black/60 backdrop-blur-xl border-b border-white/10">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-baseline gap-1.5 cursor-pointer group select-none">
                        <span className="text-2xl font-black tracking-tight text-white group-hover:text-gray-200 transition-colors">
                          望冉
                        </span>
                        <span className="bg-linear-to-br from-indigo-400 to-violet-500 bg-clip-text text-lg font-extrabold text-transparent">
                          webui
                        </span>
                        <span className="h-2 w-2 rounded-full bg-indigo-500 ml-0.5 mb-1 group-hover:scale-125 transition-transform"></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            className="rounded-full bg-zinc-800 border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:bg-zinc-700 hover:border-zinc-600 active:scale-95">
                            登录
                        </button>
                        <button
                            onClick={()=>setResisterPanel(true)}
                            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all duration-200 hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95">
                            注册
                        </button>
                    </div>
                </div>
            </header>
            <RegisterPanel isOpen={isRegisterPanel} onClose={()=>setResisterPanel(false)}/>
        </>
    )
}

interface RegisterPannelprops {
    isOpen: boolean;
    onClose: () => void;
}

const RegisterPanel: React.FC<RegisterPannelprops> = ({ isOpen, onClose }) => {
    const [tel,setTel] = useState("");
    const [password,setPassword] = useState("");

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if(tel.length<11) return console.log("手机号错误")
        if(password.length<6) return console.log("密码位数不足");
        try{
            const response = await fetch(`/api/auth/register`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "phoneNumber": tel,
                    "password": password,
                    "merchant": false
                }),
            });
            const text = await response.text();
            const result = text ? JSON.parse(text) : {};
            if (response.ok) {
                console.log('注册成功:', result);
                onClose(); // 关闭弹窗
            } else {
                console.error('注册失败:', result.message);
                // 这里可以给用户展示报错信息
            }
        } catch (error) {
            console.error('网络请求异常:', error);
        }
    };
    return (
        /* AnimatePresence 允许组件在从 DOM 中移除时执行 exit 动画 */
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    // 遮罩层动画
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={onClose} // 点击遮罩关闭
                >
                    <motion.div
                        // 弹窗主体动画：从 95% 缩放并位移一点点弹出
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}

                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()} // 阻止点击弹窗内容关闭
                    >
                        {/* 顶部彩色条 */}
                        <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 to-violet-600"></div>

                        <div className="px-8 py-10">
                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-bold text-white">加入 望冉</h2>
                                <p className="mt-2 text-sm text-zinc-400">立即订票！</p>
                            </div>

                            <form className="space-y-5" onSubmit={handleSubmit}>
                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">手机号</label>
                                    <input
                                        type="tel"
                                        placeholder="your phone number"
                                        value={tel}
                                        onChange={(e) => setTel(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">设置密码</label>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                                    />
                                </div>
                                <button type="submit" className="group relative w-full overflow-hidden rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]">
                                    立即创建账号
                                </button>
                            </form>

                            <div className="mt-8 text-center text-sm text-zinc-500">
                                已有账号？
                                <button className="ml-1 font-semibold text-indigo-400 hover:text-indigo-300">去登录</button>
                            </div>
                        </div>

                        {/* 关闭按钮 */}
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-6 text-zinc-500 hover:text-white transition-colors cursor-pointer"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default App