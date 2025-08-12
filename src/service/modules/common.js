import fetch from "../fetch"

export default {
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
    return fetch.post('douyu/room', params)
  },
  // 获取huya直播流地址
  postHuyaLiveStream(params) {
    return fetch.post('huya/room', params)
  }
}