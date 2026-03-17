export interface AuthContextType extends User, Merchant {
    role: 'guest' | 'user' | 'merchant' | 'admin';
    token: string | null;
    login: (newToken: string, account: User | Merchant) => void;
    logout: () => void;
    isAuthenticated: boolean;
}
export interface User {
    id: string;
    username: string;
    phoneNumber: string;
}

export interface Merchant extends User {
    merchantCode: string;
    approvalStatus: string;
    rejectReason: string;
}

export interface EventsData {
    id?: string;
    eventCode?: string;
    eventName: string;
    eventType: string;
    eventTime: string;
    city: string;
    price: number;
    stock: number;
    onShelf?: boolean;
    saleStartTime: string;
    saleEndTime: string;
    merchantId?: string;
    organizers: number[] | Organizer[];
}

export interface Organizer {
    id: string;
    name: string;
    phoneNumber: string;
    address: string;
}

export interface MerchantOrders {
    id: string;
    ticketCode: string;
    refunded: boolean;
    userId: number;
    eventId: number;
    createTime: string;
    eventObject: EventsData;
}

export interface Order {
    id: string;
    ticketCode: string;
    refunded: boolean;
    userId: number;
    eventId: number;
    createTime: string;
    eventObject: EventsData;
}
