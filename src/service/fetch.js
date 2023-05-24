import axios from 'axios';
import intercept from '../assets/js/intercept';

const store = {};

let instance = axios.create({
    baseURL: '',
    timeout: 20000, // 请求超时时间
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
});

let fingerPoint = store.state.canvasFingerPoint || sessionStorage.getItem('canvasFingerPoint');
let csrfToken = store.state.csrfToken || sessionStorage.getItem('csrfToken');

instance.interceptors.request.use(request => {
    fingerPoint = fingerPoint || store.state.canvasFingerPoint || sessionStorage.getItem('canvasFingerPoint');
    if (fingerPoint) { // 浏览器指纹，标识唯一用户
      request.headers['FingerPoint'] = fingerPoint;
    }
    csrfToken = csrfToken || store.state.csrfToken || sessionStorage.getItem('csrfToken');
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