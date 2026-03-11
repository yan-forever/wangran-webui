export interface Pannelprops {
    isOpen: boolean;
    onClose: () => void;
}
export interface AuthContextType{
    token: string | null;
    id: string | null;
    username: string | null;
    phoneNumber: string | null;
    login: (newToken: string,account:account) => void;
    logout: ()=>void;
    isAuthenticated: boolean;
}

export interface account {
    id: string | null;
    username: string | null;
    phoneNumber: string | null;
}