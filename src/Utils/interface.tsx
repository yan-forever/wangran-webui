export interface Pannelprops {
    isOpen: boolean;
    onClose: () => void;
}
export interface AuthContextType extends User, Merchant {
    role: 'guest' | 'user' | 'merchant' | 'admin';
    token: string | null;
    login: (newToken: string | null, account: User | Merchant | null) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
export interface User {
    id: string | null;
    username: string | null;
    phoneNumber: string | null;
}

export interface Merchant extends User {
    merchantCode: string | null;
    approvalStatus: string | null;
    rejectReason: string | null;
}
