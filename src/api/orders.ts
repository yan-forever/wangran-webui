import request from '@/api/axios.ts';
import type { MerchantOrders, Order } from '@/types/orders.ts';

export const getOrders = async (
    page?: number,
    pageSize?: number,
    refunded?: boolean,
): Promise<Order[]> => {
    const response = await request.get('/orders', {
        params: {
            page: page,
            pageSize: pageSize,
            refunded: refunded,
        },
    });
    return response.data.data;
};

export const createOrder = async (eventId: number): Promise<Order> => {
    const response = await request.post('/api/orders', { params: { eventId } });
    return response.data;
};

export const refundOrder = async (id: number) => {
    return request.post(`/orders/${id}/refund`);
};

export const getOrder = async (id: number): Promise<Order> => {
    const response = await request.get(`/api/orders`, { params: { id } });
    return response.data;
};

export const getOrdersMerchant = async (
    page?: number,
    pageSize?: number,
    refunded?: boolean | null,
): Promise<MerchantOrders[]> => {
    const response = await request.get('/orders/merchant', {
        params: {
            page: page,
            pageSize: pageSize,
            refunded: refunded,
        },
    });
    return response.data.data;
};

export const getOrdersAdmin = async (
    page?: number,
    pageSize?: number,
    refunded?: boolean | null,
): Promise<Order[]> => {
    const response = await request.get('/orders/admin', {
        params: {
            page,
            pageSize,
            refunded,
        },
    });
    return response.data.data;
};
