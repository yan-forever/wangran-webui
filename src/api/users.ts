import request from '@/api/axios.ts';
import type { User } from '@/types/users.ts';

export const getUsers = async (page?: number, pageSize?: number): Promise<User[]> => {
    const response = await request.get('/api/users', {
        params: {
            page,
            pageSize,
        },
    });
    return response.data.data;
};

export const createUser = async (phoneNumber: number, password?: string): Promise<User> => {
    const response = await request.post(`/api/users`, {
        phoneNumber,
        password,
    });
    return response.data;
};

export const importUsers = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return request.post(`/api/users/import`, formData);
};

export const getUser = async (id: string): Promise<User> => {
    const response = await request.get('/api/users/', { params: id });
    return response.data;
};

export const deleteUser = async (id: string) => {
    return request.delete(`/api/users/`, { params: { id } });
};

export const upDataUser = async (
    id: string,
    phoneNumber?: number,
    password?: string,
    username?: string,
): Promise<User> => {
    const response = await request.patch(`/api/users/`, {
        params: { id },
        phoneNumber,
        password,
        username,
    });
    return response.data;
};
