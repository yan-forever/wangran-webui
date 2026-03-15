//未来集中request

import type { EventsData, Organizer } from './interface.tsx';
import request from './requestDeal.ts';
import { formatToDatetimeLocal, formatToInstant, isOrganizerArray } from './tool.ts';

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
    return response.data.data.map((event: EventsData) => ({
        ...event,
        eventTime: formatToDatetimeLocal(event.eventTime),
        saleStartTime: formatToDatetimeLocal(event.saleStartTime),
        saleEndTime: formatToDatetimeLocal(event.saleEndTime),
        organizers: isOrganizerArray(event.organizers)
            ? event.organizers
                  .map((org) => Number(org.id))
                  .filter((id: number) => !Number.isNaN(id))
            : [],
    }));
};

export const createEvent = async (event: EventsData) => {
    const { id, eventCode, ...rest } = event;
    const payload = {
        ...rest,
        eventTime: formatToInstant(rest.eventTime),
        saleStartTime: formatToInstant(rest.saleStartTime),
        saleEndTime: formatToInstant(rest.saleEndTime),
    };

    return request.post('/events', payload);
};

export const upDataEvent = async (event: EventsData) => {
    const { id, eventCode, ...rest } = event;
    const payload = {
        ...rest,
        eventTime: formatToInstant(rest.eventTime),
        saleStartTime: formatToInstant(rest.saleStartTime),
        saleEndTime: formatToInstant(rest.saleEndTime),
    };
    return request.patch(`/events/${id}`, payload);
};
