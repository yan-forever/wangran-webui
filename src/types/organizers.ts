import { z } from 'zod';

export const OrganizerSchema = z.object({
    id: z.number(),
    name: z.string(),
    phoneNumber: z.string(),
    address: z.string(),
});

export type Organizer = z.infer<typeof OrganizerSchema>;
