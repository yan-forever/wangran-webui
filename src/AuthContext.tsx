import type {account, AuthContextType} from "./Utils/interface.tsx";
import {createContext, type ReactNode, useContext, useState} from "react";

const AuthContext = createContext<AuthContextType|undefined>(undefined);

export const AuthProvider = ({ children }:{children: ReactNode}) =>{
    const [token,setToken] = useState<string|null>(() => localStorage.getItem('token'));
    const [id,setId] = useState<string|null>(() => localStorage.getItem('id'));
    const [username,setUserName] = useState<string|null>(() => localStorage.getItem('username'));
    const [phoneNumber,setPhoneNumber] = useState<string|null>(() => localStorage.getItem('phoneNumber'));
    const login = (newToken: string|null,account:account) => {
        if(newToken!=null&&account.id!=null&&account.username!=null&&account.phoneNumber!=null){
            setToken(newToken);
            setId(account.id);
            setUserName(account.username);
            setPhoneNumber(account.phoneNumber);
            localStorage.setItem('token',newToken);
            localStorage.setItem('id',account.id);
            localStorage.setItem('username',account.username);
            localStorage.setItem('phoneNumber',account.phoneNumber);
        }else{
            console.error("有值为空");
            console.log('token',newToken);
            console.log('id',account.id);
            console.log('name',account.username);
            console.log('phoneNumber',account.phoneNumber);
        }
    }
    const logout = () => {
        setToken(null);
        setId(null);
        setUserName(null);
        setPhoneNumber(null);
        localStorage.removeItem('token');
        localStorage.removeItem('id');
        localStorage.removeItem('username');
        localStorage.removeItem('phoneNumber');
    }
    const isAuthenticated = !!token;
    return (
        <AuthContext.Provider value={{
            token,
            id,
            username,
            phoneNumber,
            login,
            logout,
            isAuthenticated,
        }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) throw new Error('useAuth 必须在 Auth内部使用');
    return context;
}