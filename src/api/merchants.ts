import request from '@/api/axios.ts';
import type { Merchant } from '@/types/merchants.ts';

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
    const response = await request.post('/merchants/review', {
        merchantPhoneNumber,
        approved,
        rejectReason,
    });
    return response.data;
};

export const getMerchantById = async (id: number): Promise<Merchant> => {
    const response = await request.get(`/merchants/${id}`);
    return response.data ?? response;
};

export const patchMerchantById = async (
    id: number,
    payload: Partial<Pick<Merchant, 'phoneNumber' | 'username'> & { password: string }>,
): Promise<Merchant> => {
    const response = await request.patch(`/merchants/${id}`, payload);
    return response.data ?? response;
};

export const importMerchants = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await request.post('/api/merchants/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

export const getMerchant = async (id: number): Promise<Merchant> => {
    const response = await request.get('/api/merchants/', {
        params: id,
    });
    return response.data;
};

export const deleteMerchant = async (id: number) => {
    return request.delete(`/api/merchants/`, { params: id });
};

export const updateMerchant = async (
    id: number,
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
