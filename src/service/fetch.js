import axios from 'axios';
import intercept from '../assets/js/intercept';

let csrfToken = sessionStorage.getItem('csrfToken');

let instance = axios.create({
    baseURL: '',
    timeout: 20000, // 请求超时时间
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
});

instance.interceptors.request.use(request => {
    csrfToken = csrfToken || sessionStorage.getItem('csrfToken');
    if (csrfToken) { // csrftoken请求头，用于放置csrf攻击
      request.headers['X-CSRFtoken'] = csrfToken;
    }
    return request;
});

instance.interceptors.response.use(response => {
    return response;
});

export default {
    get(url, params) {
        return new Promise((resolve, reject) => {
            instance.get('/api/'+ url, {params}).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    },
    post(url, params) {
        return new Promise((resolve, reject) => {
            instance.post('/api/'+ url, params).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }
}