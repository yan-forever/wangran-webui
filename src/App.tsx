//import reactLogo from './assets/react.svg'
//import viteLogo from '/vite.svg'
import './App.css'
import * as React from 'react'
import {useState, type FC, useEffect} from 'react'
import {AnimatePresence, motion} from 'framer-motion';
import type {Pannelprops} from "./props.tsx";

function App() {
    const [isAuthPanel,setAuthPanel] = useState(false);
    const [authMode,setAuthMode] = useState(false);
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
                            onClick={()=> {
                                setAuthMode(true);
                                setAuthPanel(true);
                            }}
                            className="rounded-full bg-zinc-800 border border-zinc-700 px-5 py-2 text-sm font-medium text-zinc-100 transition-all duration-200 hover:bg-zinc-700 hover:border-zinc-600 active:scale-95">
                            登录
                        </button>
                        <button
                            onClick={()=> {
                                setAuthMode(false);
                                setAuthPanel(true);
                            }}
                            className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-all duration-200 hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95">
                            注册
                        </button>
                    </div>
                </div>
            </header>
            <AuthPanel isOpen={isAuthPanel} onClose={()=>setAuthPanel(false)} authMode={authMode} />
        </>
    )
}
const AuthPanel: FC<Pannelprops & { authMode: boolean }> = ({ isOpen, onClose, authMode }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    //onClick={onClose}//取消点击ui外的遮罩关闭
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                        className="relative w-full max-w-md overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 to-violet-600"></div>

                        <AuthFormContent initialMode={authMode} onClose={onClose} />
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
};

const AuthFormContent: FC<{ initialMode: boolean; onClose: () => void }> = ({ initialMode, onClose }) => {
    const [mode, setMode] = useState(initialMode);
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [tel, setTel] = useState("");
    const [isMerchant, setIsMerchant] = useState(false);

    const handleSubmitL = async (e:React.BaseSyntheticEvent)=>{
        e.preventDefault();
        if (identifier.length>50) return console.log("登录用户标识过长");
        if (password.length<6||password.length>50) return console.log("登录密码过长或过短");
        try{
            const response = await fetch("/api/auth/login",{
                method:'POST',
                headers:{
                    'Content-Type':'application/json',
                },
                body:JSON.stringify({
                    "identifier":identifier,
                    "password":password
                })
            });
            const originResponse = await response.text();
            const result = originResponse ? JSON.parse(originResponse):{};
            if (response.ok){
                console.log('登陆成功',result);
                onClose();
            }else {
                console.log('登陆失败',result);
            }
        }catch (error){
            console.log('网络请求错误',error);
        }
    }

    const handleSubmitR = async (e: React.BaseSyntheticEvent) => {
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
                    "merchant": isMerchant
                }),
            });
            const originResponse = await response.text();
            const result = originResponse ? JSON.parse(originResponse) : {};
            if (response.ok) {
                console.log('注册成功:', result);
                console.log('isMerchant?:', isMerchant);
                onClose();
            } else {
                console.error('注册失败:',result);
            }
        } catch (error) {
            console.error('网络请求异常:', error);
        }
    };
    return (
        <div className="px-8 py-10">
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-white">{mode ? "望冉" : "加入望冉"}</h2>
                <p className="mt-2 text-sm text-zinc-400">立即订票！</p>
            </div>

            {mode ? (
                /* ----------------- 登录表单 ----------------- */
                <form className="space-y-5" onSubmit={handleSubmitL}>
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">手机号或商户编号</label>
                        <input
                            type="text"
                            placeholder="your account identifier"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="block mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">密码</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-zinc-100 placeholder:text-zinc-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        />
                    </div>
                    <button type="submit" className="group relative w-full overflow-hidden rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]">
                        立即登陆
                    </button>
                </form>
            ) : (
                /* ----------------- 注册表单 ----------------- */
                <form className="space-y-5" onSubmit={handleSubmitR}>
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
                    <div className="flex items-center gap-3">
                        <label className="relative flex items-center cursor-pointer select-none gap-3" htmlFor="ismerchant">
                            <input
                                type="checkbox"
                                id="ismerchant"
                                checked={isMerchant}
                                onChange={(e)=> setIsMerchant(e.target.checked)}
                                className="peer sr-only"
                            />
                            <span className="flex items-center justify-center w-5 h-5 border border-zinc-800 bg-zinc-900 rounded-lg transition-all duration-200 ease-out peer-checked:bg-indigo-600 peer-checked:border-indigo-600 peer-checked:shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                                        <svg
                                            className="w-3 h-3 text-white transition-transform duration-200 ease-out scale-0 peer-checked:scale-100"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    </span>
                            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 hover:text-white transition-colors">
                                        注册为商户
                                    </span>
                        </label>
                    </div>
                    <button type="submit" className="group relative w-full overflow-hidden rounded-xl bg-white py-3 font-bold text-black transition-all hover:bg-zinc-200 active:scale-[0.98]">
                        立即创建账号
                    </button>
                </form>
            )}

            <div className="mt-8 text-center text-sm text-zinc-500">
                {mode ? "没有账户？" : "已有账号？"}
                <button onClick={() => setMode(!mode)} className="ml-1 font-semibold text-indigo-400 hover:text-indigo-300">
                    {mode ? "去注册" : "去登录"}
                </button>
            </div>
        </div>
    );
};
export default App