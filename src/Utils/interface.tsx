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

export interface EventsData {
    id?: string | null;
    eventCode?: string | null;
    eventName: string | null;
    eventType: string | null;
    eventTime: string | null;
    city: string | null;
    price: number | null;
    stock: number | null;
    onShelf?: boolean | null;
    saleStartTime: string | null;
    saleEndTime: string | null;
    organizers: number[] | Organizer[] | null;
}

export interface Organizer {
    id: string | null;
    name: string | null;
    phoneNumber: string | null;
    address: string | null;
}

export interface MerchantOrders {
    id: string | null;
    ticketCode: string | null;
    refunded: boolean;
    userId: number | null;
    eventId: number | null;
    createTime: string | null;
    eventObject: EventsData;
}
