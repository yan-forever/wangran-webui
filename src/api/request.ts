import type { MerchantOrders, Order, Organizer } from '../types/interface.ts';
import request from './axios.ts';

export const getOrganizers = async (
    page: number = 1,
    pageSize: number = 10,
): Promise<Organizer[]> => {
    const response = await request.get('/organizers', {
        params: {
            page: page,
            pageSize: pageSize,
        },
    });
    return response.data.data;
};

export const getMerchantOrders = async (
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

export const refundOrder = async (id: string) => {
    return request.post(`/orders/${id}/refund`);
};
