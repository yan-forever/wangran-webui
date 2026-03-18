import { z } from 'zod';
import type { User } from '@/types/users.ts';
import type { Merchant } from '@/types/merchants.ts';

export const AuthContextSchema = z.object({
    role: z.enum(['guest', 'user', 'merchant', 'admin']),
    token: z.string().nullable(),
    id: z.number().nullable(),
    username: z.string(),
    phoneNumber: z.string(),
    merchantCode: z.string(),
    approvalStatus: z.string(),
    rejectReason: z.string(),
    login: z.custom<(newToken: string | null, account: User | Merchant | null) => void>(),
    logout: z.custom<() => void>(),
    isAuthenticated: z.boolean(),
});

export type AuthContextType = z.infer<typeof AuthContextSchema>;

