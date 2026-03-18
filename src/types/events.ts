import { z } from 'zod';
import { OrganizerSchema } from '@/types/organizers.ts';

export const EventsDataSchema = z.object({
    id: z.number().optional(),
    eventCode: z.string().optional(),
    eventName: z.string(),
    eventType: z.string(),
    eventTime: z.string(),
    city: z.string(),
    price: z.number(),
    stock: z.number(),
    onShelf: z.boolean().optional(),
    saleStartTime: z.string(),
    saleEndTime: z.string(),
    merchantId: z.number().optional(),
    organizers: z.union([z.array(z.number()), z.array(OrganizerSchema)]),
});

export type EventsData = z.infer<typeof EventsDataSchema>;

