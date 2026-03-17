import request from '@/api/axios.ts';
import type { Merchant } from '@/types/interface.ts';

export const getMerchants = async (page?: number, pageSize?: number): Promise<Merchant[]> => {
    const response = await request.get('/api/merchants', {
        params: {
            page,
            pageSize,
        },
    });
    return response.data.data;
};

export const createMerchant = async (phoneNumber: number, password?: string): Promise<Merchant> => {
    const response = await request.post('/api/merchants', {
        phoneNumber,
        password,
    });
    return response.data;
};

export const reviewMerchant = async (
    merchantPhoneNumber: number,
    approved: boolean,
    rejectReason?: string,
): Promise<Merchant> => {
    const response = await request.post('/api/merchants/review', {
        merchantPhoneNumber,
        approved,
        rejectReason,
    });
    return response.data;
};

export const importMerchants = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await request.post('/api/merchants/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getMerchant = async (id: string): Promise<Merchant> => {
    const response = await request.get('/api/merchants/', {
        params: id,
    });
    return response.data;
};

export const deleteMerchant = async (id: string) => {
    return request.delete(`/api/merchants/`, { params: id });
};

export const updateMerchant = async (
    id: string,
    phoneNumber: number,
    password: string,
    username: string,
): Promise<Merchant> => {
    const response = await request.put(`/api/merchants/`, {
        params: { id },
        phoneNumber,
        password,
        username,
    });
    return response.data;
};
