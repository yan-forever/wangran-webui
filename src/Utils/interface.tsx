export interface Pannelprops {
    isOpen: boolean;
    onClose: () => void;
}
export interface AuthContextType{
    token: string | null;
    login: (newToken: string) => void;
    logout: ()=>void;
    isAuthenticated: boolean;
}