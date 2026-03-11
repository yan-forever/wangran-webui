import axios from 'axios';

const request = axios.create({
    baseURL: '/api',
    timeout: 5000,
    headers: {
        'Content-Type':'application/json',
    }
})
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token && token !== 'undefined' && token !== 'null') {
            // 拼接 Bearer 前缀，符合 JWT 标准
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('token is ',token);
        }else{
            console.log('token is null!!');
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);
request.interceptors.response.use(
    response => {
      console.log('成功', JSON.parse(JSON.stringify(response)));
      return response.data;
    },
    error => {
        console.error('后端响应出错:', {...error});
        return Promise.reject(error);
    }
);
export default request;