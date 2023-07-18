import fetch from "../fetch"

export default {
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
    return fetch.post('douyu/room', params)
  },
  // 获取huya直播流地址
  postHuyaLiveStream(params) {
    return fetch.post('huya/room', params)
  },
  // chat
  postChat(params) {
    return fetch.post('chat', params)
  },
  // chat
  test(params) {
    return fetch.post('test', params)
  }
}