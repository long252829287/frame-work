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
    if (csrfToken) {
      request.headers['X-CSRFtoken'] = csrfToken;
    }
    // 注入防注入处理（仅在有 body/params 时生效）
    if (request.data) {
      request.data = intercept.formatSql(request.data);
    }
    if (request.params) {
      request.params = intercept.formatSql(request.params);
    }
    return request;
});

instance.interceptors.response.use(response => {
    // 移除请求过程中的标记
    if (response && response.data) {
      response.data = intercept.formatRes(response.data);
    }
    return response;
});

export default {
    get(url, params) {
        return new Promise((resolve, reject) => {
            instance.get('/lyl/'+ url, {params}).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    },
    post(url, params) {
        return new Promise((resolve, reject) => {
            instance.post('/lyl/'+ url, params).then(res => {
                resolve(res);
            }).catch(err => {
                reject(err);
            })
        })
    }
}