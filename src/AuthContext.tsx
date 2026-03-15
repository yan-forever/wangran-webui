import type { AuthContextType, Merchant, User } from './Utils/interface.tsx';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<'guest' | 'user' | 'merchant' | 'admin'>(
        () => (localStorage.getItem('role') as never) || 'guest',
    );
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [id, setId] = useState(() => localStorage.getItem('id'));
    const [username, setUsername] = useState(() => localStorage.getItem('username'));
    const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('phoneNumber'));
    const [merchantCode, setMerchantCode] = useState(() => localStorage.getItem('merchantCode'));
    const [approvalStatus, setApprovalStatus] = useState(() =>
        localStorage.getItem('approvalStatus'),
    );
    const [rejectReason, setRejectReason] = useState(() => localStorage.getItem('rejectReason'));
    const login = (newToken: string | null, account: User | Merchant | null) => {
        if (account) {
            if ('merchantCode' in account && newToken) {
                console.log('商户登陆');
                setRole('merchant');
                setToken(newToken);
                setId(account.id);
                setUsername(account.username);
                setPhoneNumber(account.phoneNumber);
                setMerchantCode(account.merchantCode);
                setApprovalStatus(account.approvalStatus);
                setRejectReason(account.rejectReason || '');

                localStorage.setItem('role', 'merchant');
                localStorage.setItem('token', newToken);
                localStorage.setItem('id', account.id!);
                localStorage.setItem('username', account.username!);
                localStorage.setItem('phoneNumber', account.phoneNumber!);
                localStorage.setItem('merchantCode', account.merchantCode!);
                localStorage.setItem('approvalStatus', account.approvalStatus!);
                localStorage.setItem('rejectReason', account.rejectReason || '');
            } else if (account.id && newToken) {
                setRole('user');
                setToken(newToken);
                setId(account.id);
                setUsername(account.username);
                setPhoneNumber(account.phoneNumber);
                setMerchantCode(null);
                setApprovalStatus(null);
                setRejectReason(null);

                localStorage.setItem('role', 'user');
                localStorage.setItem('token', newToken);
                localStorage.setItem('id', account.id);
                localStorage.setItem('username', account.username!);
                localStorage.setItem('phoneNumber', account.phoneNumber!);
                localStorage.removeItem('merchantCode');
                localStorage.removeItem('approvalStatus');
                localStorage.removeItem('rejectReason');
            }
        } else {
            console.log('管理员登录');
            if (newToken) {
                setRole('admin');
                setToken(newToken);
                setId('0');
                localStorage.setItem('role', 'admin');
                localStorage.setItem('token', newToken);
                localStorage.setItem('id', '0');
            }
        }
    };

    const logout = useCallback(() => {
        setRole('guest');
        setToken(null);
        setId(null);
        setUsername(null);
        setPhoneNumber(null);
        setApprovalStatus(null);
        setMerchantCode(null);
        setRejectReason(null);

        localStorage.removeItem('role');
        localStorage.removeItem('token');
        localStorage.removeItem('id');
        localStorage.removeItem('username');
        localStorage.removeItem('phoneNumber');
        localStorage.removeItem('merchantCode');
        localStorage.removeItem('approvalStatus');
        localStorage.removeItem('rejectReason');
    }, []);

    useEffect(() => {
        const timer = setTimeout(logout, 3600000);
        return () => clearTimeout(timer);
    }, [logout, token]);

    const isAuthenticated = !!token;
    return (
        <AuthContext.Provider
            value={{
                role,
                token,
                id,
                username,
                phoneNumber,
                merchantCode,
                approvalStatus,
                rejectReason,
                login,
                logout,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth 必须在 Auth内部使用');
    return context;
};
