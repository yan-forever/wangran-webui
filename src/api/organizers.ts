import request from '@/api/axios.ts';
import type { Organizer } from '@/types/organizers.ts';

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

export const createOrganizer = async (
    name: string,
    phoneNumber: number,
    address: string,
): Promise<Organizer> => {
    const response = await request.post(`/api/organizers/`, {
        name,
        phoneNumber,
        address,
    });
    return response.data;
};

export const getOrganizer = async (id: number): Promise<Organizer> => {
    const response = await request.get(`/api/organizers`, { params: { id } });
    return response.data;
};

export const deleteOrganizer = async (id: number) => {
    return request.delete(`/api/organizers`, { params: { id } });
};

export const upDataOrganizer = async (
    id: number,
    name?: string,
    phoneNumber?: number,
    address?: string,
): Promise<Organizer> => {
    const response = await request.patch(`/api/organizers`, {
        params: { id },
        name,
        phoneNumber,
        address,
    });
    return response.data;
};
