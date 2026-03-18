import { z } from 'zod';
import { EventsDataSchema } from '@/types/events.ts';

const BaseOrderSchema = z.object({
    id: z.number(),
    ticketCode: z.string(),
    refunded: z.boolean(),
    userId: z.number(),
    eventId: z.number(),
    createTime: z.string(),
    eventObject: EventsDataSchema,
});

export const MerchantOrdersSchema = BaseOrderSchema;
export type MerchantOrders = z.infer<typeof MerchantOrdersSchema>;

export const OrderSchema = BaseOrderSchema;
export type Order = z.infer<typeof OrderSchema>;

