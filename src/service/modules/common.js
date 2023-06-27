import fetch from "../fetch"

export default {
  // 获取平台授权信息
  detailLicence(params) {
    return fetch.get('api/authorize/read/license', params);
  },
  // 获取用户信息
  getUser(params) {
    return fetch.post('rights/getUser', null, true);
  },
  // 登录
  toLogin(params) {
    return fetch.post('api/login', params)
  },
  // 用户信息
  getUserInfo(params) {
    return fetch.get('api/userinfo', params)
  },
  // 获取直播流地址
  postLiveStream(params) {
    return fetch.post('/douyu', params)
  }
}