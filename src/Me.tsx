import {useEffect, useState} from "react";
import {useAuth} from "./AuthContext.tsx";
import request from "./Utils/request.ts";
import {useNavigate} from "react-router-dom";

function Me(){
    const {isAuthenticated,login,logout,token,username,id,phoneNumber} = useAuth();
    const navigate = useNavigate();
    const [writeName,setWriteName]=useState(false);
    const [writeTel,setWriteTel]=useState(false);
    const [newUsername,setNewUsername]=useState<string>(username||"加载中");
    const [newPassword,setNewPassword]=useState("");//TODO 修改密码
    const [newPhoneNumber,setNewPhoneNumber]=useState<string>(phoneNumber||"加载中");
    useEffect(()=>{
        if(id=="undefined") {
            logout();
            navigate('/');
        }
        const getData = async () =>{
            if (isAuthenticated) {
                try{
                    const response = await request.get(`/users/${id}`);
                    return response;
                }catch (error){
                    logout();
                    navigate('/')
                }
            }
        }
        getData().then(res => {
            if(res&&token!=null){
                login(token,res.data);
            }
        });
    },[id, isAuthenticated, login, logout, navigate, token])

    const changeUserData = async (mode:"phoneNumber"|"username"|"password",newData:string) => {
        const patchData = {
            [mode]: newData //ES6 动态键名
        };
        //TODO 校验修改的合法性
        try
        {
            const response = await request.patch(`/users/${id}`, patchData)
            if(token!=null){
                login(token,response.data)
            }else logout();
        }catch (error){
            console.error(error);
        }
    }
    //TODO 输入信息错误时ui变红提示
    return (
        <>
            <div className="flex flex-col w-full min-h-screen p-4">
                <div className="flex w-full">
                    <div className="max-w-md w-full bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="h-10 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                            <h3 className="text-xl font-bold text-white tracking-tight">个人信息</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 group-hover:text-indigo-400 transition-colors">Username</label>
                                <div className="text-lg font-semibold text-zinc-100 flex items-center w-full gap-3">
                                    <span className="bg-zinc-800 p-1.5 rounded-lg text-sm shrink-0">👤</span>
                                    <div className="flex-1 min-w-0">
                                        {writeName?(
                                            <input
                                            type="text"
                                            placeholder="your new username"
                                            value={newUsername}
                                            onChange={(e)=> setNewUsername(e.target.value)}
                                            className="w-full bg-zinc-950/40 border border-zinc-700/50 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        />):(<p
                                            className="truncate cursor-help" title={username || ""}>
                                            {username}
                                        </p>)}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (writeName) {
                                                changeUserData("username", newUsername).then(r => {
                                                    logout()
                                                    navigate('/')
                                                });
                                                setWriteName(false);
                                            } else {
                                                setWriteName(true);
                                            }
                                        }}
                                        className="btn ml-auto shrink-0 px-3 py-1 text-xs bg-zinc-800/30 border-zinc-700/50 hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                        {writeName ? "保存" : "修改"}
                                    </button>
                                    /*TODO商户信息的展示 */
                                </div>
                            </div>
                            <div className="h-px w-full bg-zinc-800/50"></div>
                            <div className="group">
                                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-1.5 group-hover:text-indigo-400 transition-colors">Phone Number</label>
                                <div className="text-lg font-semibold text-zinc-100 flex items-center w-full gap-3">
                                    <span className="bg-zinc-800 p-1.5 rounded-lg text-sm shrink-0">📞</span>
                                    {writeTel?(
                                        <input
                                        type="tel"
                                        placeholder={"your new phone number"}
                                        value={newPhoneNumber}
                                        onChange={(e)=> setNewPhoneNumber(e.target.value)}
                                        className="w-full bg-zinc-950/40 border border-zinc-700/50 rounded-xl px-4 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
                                    />):(<div className="flex-1">
                                        <p className="font-mono text-zinc-300">{phoneNumber}</p>
                                    </div>)}
                                    <button
                                        onClick={() => {
                                            if (writeTel) {
                                                changeUserData("phoneNumber", newPhoneNumber).then(r => {
                                                    logout()
                                                    navigate('/')
                                                });
                                                setWriteTel(false);
                                            } else {
                                                setWriteTel(true);
                                            }
                                        }}
                                        className="btn ml-auto shrink-0 px-3 py-1 text-xs bg-zinc-800/30 border-zinc-700/50 hover:bg-indigo-600 hover:text-white transition-colors"
                                    >
                                        {writeTel ? "保存" : "修改"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Me;