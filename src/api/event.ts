import request from '@/api/axios.ts';
import type { EventsData } from '@/types/interface.ts';
import { formatToDatetimeLocal, formatToInstant, isOrganizerArray } from '@/lib/tool.ts';

export const getMerchantEvents = async (
    page: number = 1,
    pageSize: number = 10,
): Promise<EventsData[]> => {
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
export const getPublicEvents = async (
    eventType?: string,
    city?: string,
    startTime?: string,
    endTime?: string,
    page?: number,
    pageSize?: number,
): Promise<EventsData[]> => {
    const response = await request.get('/events/public', {
        params: {
            eventType: eventType,
            city: city,
            startTime: startTime,
            endTime: endTime,
            page: page,
            pageSize: pageSize,
        },
    });
    return response.data.data;
};
export const bookEvent = async (eventId: string) => {
    return request.post(`/orders`, {
        eventId: eventId,
    });
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
export const upDataEvent = async (
    id: string,
    event: Partial<Omit<EventsData, 'id' | 'eventCode'>>,
) => {
    const rest = event;
    const payload: Partial<EventsData> = { ...rest };

    if ('eventTime' in rest) {
        const eventTime = formatToInstant(rest.eventTime ?? null);
        if (eventTime) {
            payload.eventTime = eventTime;
        }
    }

    if ('saleStartTime' in rest) {
        const saleStartTime = formatToInstant(rest.saleStartTime ?? null);
        if (saleStartTime) {
            payload.saleStartTime = saleStartTime;
        }
    }

    if ('saleEndTime' in rest) {
        const saleEndTime = formatToInstant(rest.saleEndTime ?? null);
        if (saleEndTime) {
            payload.saleEndTime = saleEndTime;
        }
    }

    return request.patch(`/events/${id}`, payload);
};
export const deleteEvent = async (id: string) => {
    return request.delete(`/events/${id}`);
};
