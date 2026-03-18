import type { AuthContextType } from '@/types/auth.ts';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import type { Merchant } from '@/types/merchants.ts';
import type { User } from '@/types/users.ts';

const UseAuth = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<'guest' | 'user' | 'merchant' | 'admin'>(
        () => (localStorage.getItem('role') as never) || 'guest',
    );
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [id, setId] = useState<number | null>(() => {
        const storedId = localStorage.getItem('id');
        if (!storedId) return null;
        const parsed = Number(storedId);
        return Number.isNaN(parsed) ? null : parsed;
    });
    const [username, setUsername] = useState(() => localStorage.getItem('username') ?? '');
    const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('phoneNumber') ?? '');
    const [merchantCode, setMerchantCode] = useState(
        () => localStorage.getItem('merchantCode') ?? '',
    );
    const [approvalStatus, setApprovalStatus] = useState(
        () => localStorage.getItem('approvalStatus') ?? '',
    );
    const [rejectReason, setRejectReason] = useState(
        () => localStorage.getItem('rejectReason') ?? '',
    );
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
                localStorage.setItem('id', String(account.id));
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
                setMerchantCode('');
                setApprovalStatus('');
                setRejectReason('');

                localStorage.setItem('role', 'user');
                localStorage.setItem('token', newToken);
                localStorage.setItem('id', String(account.id));
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
                setId(0);
                setUsername('');
                setPhoneNumber('');
                setMerchantCode('');
                setApprovalStatus('');
                setRejectReason('');
                localStorage.setItem('role', 'admin');
                localStorage.setItem('token', newToken);
                localStorage.setItem('id', '0');
                localStorage.removeItem('username');
                localStorage.removeItem('phoneNumber');
                localStorage.removeItem('merchantCode');
                localStorage.removeItem('approvalStatus');
                localStorage.removeItem('rejectReason');
            }
        }
    };

    const logout = useCallback(() => {
        setRole('guest');
        setToken(null);
        setId(null);
        setUsername('');
        setPhoneNumber('');
        setApprovalStatus('');
        setMerchantCode('');
        setRejectReason('');

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
        <UseAuth.Provider
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
        </UseAuth.Provider>
    );
};
export const useAuth = () => {
    const context = useContext(UseAuth);
    if (!context) throw new Error('useAuth 必须在 Auth内部使用');
    return context;
};
