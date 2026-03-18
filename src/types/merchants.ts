import { z } from 'zod';
import { UserSchema } from '@/types/users.ts';

export const MerchantSchema = UserSchema.extend({
    merchantCode: z.string(),
    approvalStatus: z.string(),
    rejectReason: z.string(),
});

export type Merchant = z.infer<typeof MerchantSchema>;

