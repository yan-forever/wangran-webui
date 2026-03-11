import type {AuthContextType} from "./Utils/interface.tsx";
import {createContext, type ReactNode, useContext, useState} from "react";

const AuthContext = createContext<AuthContextType|undefined>(undefined);//没有懂这个东西是干什么的

export const AuthProvider = ({ children }:{children: ReactNode}) =>{//这里的children是什么？为什么和平常的组件不一样？不用FC什么的
    const [token,setToken] = useState<string|null>(() => localStorage.getItem('token'));
    const login = (newToken: string) => {
        console.log("收到新 Token:", newToken);
        setToken(newToken);
        localStorage.setItem('token',newToken);
    }
    const logout = () => {
        setToken(null);
        localStorage.removeItem('token');
    }
    const isAuthenticated = !!token;
    return (
        <AuthContext.Provider value={{ token,login,logout,isAuthenticated}}>
            {children}
        </AuthContext.Provider>
    )//这里在没有.Provider的时候好像也不报错
}
export const useAuth = () => {//这是什么东西？什么是honk？
    const context = useContext(AuthContext);
    if(!context) throw new Error('useAuth 必须在 Auth内部使用');
    return context;
}