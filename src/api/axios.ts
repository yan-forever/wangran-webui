import axios from 'axios';

const whiteList = ['/auth/login', '/auth/register', '/events/public', '/actuator/health'];

const request = axios.create({
    baseURL: '/api',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});
request.interceptors.request.use((config) => {
    const isPublicApi = whiteList.some((path) => config.url?.includes(path));
    if (!isPublicApi) {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // 拼接 Bearer 前缀，符合 JWT 标准
            console.log('token is ', token);
            console.log(config.data);
        } else {
            console.log('token is null!!');
        }
    }
    return config;
});
request.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        if (error.response) {
            const status = error.response.status;
            switch (status) {
                case 401:
                    console.error('Token 过期或无效');
                    localStorage.clear();
                    break;
                case 403:
                    console.error('无权限');
                    break;
                case 404:
                    console.error('页面不存在');
                    break;
                case 500:
                    console.error('服务器内部错误');
                    break;
                default:
                    console.error(error);
                    break;
            }
            return Promise.reject(error);
        }
    },
);
export default request;
