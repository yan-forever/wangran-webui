import request from '@/api/axios.ts';

export const Login = async (identifier: string, password: string) => {
    return request.post(`/auth/login`, {
        identifier,
        password,
    });
};

export const Register = async (
    phoneNumber: string,
    password?: string,
    merchant: boolean = false,
) => {
    return request.post(`/auth/register`, {
        phoneNumber,
        password,
        merchant,
    });
};
