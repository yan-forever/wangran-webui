//未来集中request

import type { EventsData, Organizer } from './interface.tsx';
import request from './requestDeal.ts';

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

export const getEvents = async (page: number = 1, pageSize: number = 10): Promise<EventsData[]> => {
    const response = await request.get('/events', {
        params: {
            page: page,
            pageSize: pageSize,
        },
    });
    console.log(response.data.data);
    return response.data.data;
};

export const updataEvent = async (event: EventsData) => {
    const response = await request.patch(`/events/${event.id}`, {
        body: JSON.stringify(event),
    });
};
