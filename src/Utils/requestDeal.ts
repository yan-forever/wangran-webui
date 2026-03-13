import axios from 'axios';

const whiteList = ['/auth/login', '/auth/register', '/events/public', '/actuator/health'];

const request = axios.create({
    baseURL: '/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});
request.interceptors.request.use(
    (config) => {
        const isPublicApi = whiteList.some((path) => config.url?.includes(path));
        if (!isPublicApi) {
            const token = localStorage.getItem('token');
            if (token && token !== 'undefined' && token !== 'null') {
                // 拼接 Bearer 前缀，符合 JWT 标准
                config.headers['Authorization'] = `Bearer ${token}`;
                console.log('token is ', token);
                console.log(config.data);
            } else {
                console.log('token is null!!');
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);
request.interceptors.response.use(
    (response) => {
        //if (response.data.status != 'UP')
        //    console.log(response.config.url + ':', Object.freeze({ ...response.data }));
        return response.data;
    },
    (error) => {
        ///console.error(error.config.url + ':', Object.freeze({ ...error }));
        return Promise.reject(error);
    },
);
export default request;
