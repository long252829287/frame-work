/**
 * @description A H5 player for showing HLS stream.
 * Thanks for hls.js plugin.
 * @Date 2020-11-03
 * @author Ding.
 */

/* eslint-disable */
// import { Hls } from './hls.light.js';
import Hls from 'hls.js';

class HlsPlayer extends Hls {
  constructor(mediaDataSource) {
    super();
    this._divDom = document.getElementById(mediaDataSource.wrapperId);
    this._videoDom = document.getElementById(mediaDataSource.wrapperId + '_player');
  }
  // 设置播放进度
  setCurrentTime(time) {
    this._videoDom.currentTime = time;
  }
  // 获取播放进度
  getCurrentTime() {
    return this._videoDom.currentTime;
  }
  // 倍速播放
  setPlayBackRate(rate) {
    this._videoDom.playbackRate = rate;
  }
  // 部分浏览器（例如谷歌）设置的没有用户交互时（比如刷新页面）不允许自动播放，除非视频静音。
  showRestart(vDom, listener) {
    let _this = this;
    let dom = document.createElement('div');
    dom.setAttribute('class', 'player-pause-button');
    dom.innerHTML = '<div class="inner-pause-button"></div>';
    dom.addEventListener('click', function () {
      vDom.removeChild(dom);
      if (listener) {
        listener();
      } else {
        _this.play();
      }
    });
    vDom.appendChild(dom);
  }

  // 清除restart样式
  cleanRestart(vDom) {
    let dom = document.getElementsByClassName('player-pause-button');
    for (let i = 0; i < dom.length; i++) {
      vDom.removeChild(dom[i]);
    }
  }

  // 是否全屏
  isFullScreen() {
    let _vDom = this._videoDom;
    return _isFullscreenEnabled(_vDom);
  }

  // 进入全屏
  goFullScreen() {
    let _vDom = this._divDom;
    // 判断各种浏览器，找到正确的方法
    let requestMethod = _vDom.requestFullScreen || //W3C
      _vDom.webkitRequestFullScreen || //FireFox
      _vDom.mozRequestFullScreen; //Chrome等
    if (requestMethod) {
      requestMethod.call(_vDom);
    } else if (!!window.ActiveXObject || "ActiveXObject" in window) { //for Internet Explorer
      if (_vDom.msRequestFullscreen) { // IE11
        this._videoDom.msRequestFullscreen();
      } else {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
          wscript.SendKeys("{F11}");
        }
      }
    }
  }

  // 退出全屏
  exitFullScreen() {
    // 判断各种浏览器，找到正确的方法
    let exitMethod = document.exitFullscreen || //W3C
      document.mozCancelFullScreen || //FireFox
      document.webkitCancelFullScreen; //Chrome等
    if (exitMethod) {
      exitMethod.call(document);
    } else if (!!window.ActiveXObject || "ActiveXObject" in window) { //for Internet Explorer
      if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
      } else {
        var wscript = new ActiveXObject("WScript.Shell");
        if (wscript !== null) {
          wscript.SendKeys("{F11}");
        }
      }
    }
  }
  // 事件监听
  listen(event, listener) {
    // 父类的事件监听
    let _vDom = this._videoDom;
    if (event === 'fullScreen') { // 监听全屏事件
      window.addEventListener('resize', function () {
        let flag = _isFullscreenEnabled(_vDom);
        listener(flag);
      });
      return false;
    }
    _vDom.addEventListener(event, listener);
  }

  // 取消事件监听
  unListen(event, listener) {
    let _vDom = this._videoDom;
    if (event === 'exitFullScreen') { // 全屏监听
      window.onresize = null;
    }
    _vDom.removeEventListener(event, listener);
  }

  attachMediaData() {
    let _v = this;
    _v._videoDom.addEventListener('dblclick', function () { _v._toggleFullScreen() });
    super.attachMedia(_v._videoDom);
  }
  // 注销
  dispose() {
    let _v = this;
    if (_v._videoDom) {
      _v._videoDom.pause();
      _v._divDom.removeChild(_v._videoDom);
    }
    let dom = _v._divDom.getElementsByClassName('player-poster-img');
    if (dom.length > 0) {
      _v._divDom.removeChild(dom[0]);
    }
    super.destroy();
  }
  // 进度跳转
  _toggleFullScreen() {
    _isFullscreenEnabled() ? this.exitFullScreen() : this.goFullScreen();
  }
  // 播放
  play() {
    this._videoDom.play();
  }
  // 暂停
  pause() {
    this._videoDom.pause();
  }

  getDuration() {
    return this._videoDom.duration;
  }

  get volume() {
    return this._videoDom.volume;
  }

  set volume(value) {
    this._videoDom.volume = value;
  }

  get muted() {
    return this._videoDom.muted;
  }

  set muted(muted) {
    this._videoDom.muted = muted;
  }

  get currentTime() {
    if (this._videoDom) {
      return this._videoDom.currentTime;
    }
    return 0;
  }

  set currentTime(seconds) {
    if (this._videoDom) {
      this._videoDom.currentTime = seconds;
    }
  }
};

// 判断当前是否处于全屏状态
function _isFullscreenEnabled(dom) {
  if (!!window.ActiveXObject || "ActiveXObject" in window) {
    return document.body.scrollWidth === dom.scrollWidth;
  } else {
    return window.fullScreen ||
      document.webkitIsFullScreen ||
      document.msFullscreenEnabled || false;
  }
}

export default HlsPlayer;
