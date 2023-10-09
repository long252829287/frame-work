/* eslint-disable */
import flvjs from 'flv.js';
// 创建新的类来继承flv.js定义的类，继承原有功能，并且覆盖和自定义一些新的功能。
class LnFlvPlayer extends flvjs.FlvPlayer {
  constructor(mediaDataSource, config) {
    super(mediaDataSource, config);
    this._wrapperId = mediaDataSource.wrapperId;
    this._divDom = document.getElementById(mediaDataSource.wrapperId);
    this._videoDom = document.getElementById(mediaDataSource.wrapperId + '_player')
  }

  // 静态方法：判断是否支持播放Flv格式，以及是否IE11浏览器。
  static isSupported() {
    return flvjs.isSupported() && !(!!window.ActiveXObject || "ActiveXObject" in window);
  }

  resetDom(id) {
    this._divDom = document.getElementById(id);
    this._videoDom = document.getElementById(id + '_player');
  }

  // 事件监听
  listen(event, listener) {
    // 父类的事件监听
    let _event = flvjs.Events;
    let playerFlag = false;
    let _vDom = this._videoDom;
    if (event === 'fullScreen') { // 监听全屏事件
      window.addEventListener('resize', function () {
        let flag = _isFullscreenEnabled(_vDom);
        listener(flag);
      });
      return false;
    }
    for (let e in _event) {
      if (event === _event[e]) {
        playerFlag = true;
        break;
      }
    }
    playerFlag ? super.on(event, listener) : _vDom.addEventListener(event, listener);
  }

  // 取消事件监听
  unListen(event, listener) {
    if (event === 'exitFullScreen') { // 全屏监听
      window.onresize = null;
    }
    let _event = flvjs.Events;
    let playerFlag = false;
    let _vDom = this._videoDom;
    for (let e in _event) {
      if (event === _event[e]) {
        playerFlag = true;
        break;
      }
    }
    playerFlag ? super.off(event, listener) : _vDom.removeEventListener(event, listener);
  }

  // 关联video对象
  attachMedia() {
    let _vDom = this._videoDom;
    // 双击视频，切换全屏
    let v = this;
    _vDom.addEventListener('click', function () { v._togglePlayStatus() });
    _vDom.addEventListener('dblclick', function () { v._toggleFullScreen() });

    super.attachMediaElement(_vDom);
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

  // 是否全屏
  isFullScreen() {
    let _vDom = this._videoDom;
    return _isFullscreenEnabled(_vDom);
  }

  // 添加出错样式
  addErrorStyle(imgUrl) {
    if (this._mediaDataSource.errorImg) { // 已设置出错图片
      let errorImgs = this._divDom.getElementsByClassName('player-error-img');
      if (!errorImgs.length) {
        let _errorDom = document.createElement('img');
        _errorDom.setAttribute('class', 'player-error-img');
        _errorDom.setAttribute('src', imgUrl);
        this._divDom.appendChild(_errorDom);
      }
    } else { // 未设置默认出错图片
      let errorImgs = this._divDom.getElementsByClassName('player-error-default');
      if (!errorImgs.length) {
        let _errorDom = document.createElement('div');
        _errorDom.setAttribute('class', 'player-error-default');
        _errorDom.innerHTML = '<span>抱歉，当前视频资源无法加载！</span>';
        _errorDom.setAttribute('style', 'font-size: ' + this._divDom.clientHeight * 0.05 + 'px');
        this._divDom.appendChild(_errorDom);
      }
    }
  }

  // 取消出错样式
  removeErrorStyle() {
    let className = this._mediaDataSource.errorImg ? 'player-error-img' : 'player-error-default';
    let errorDoms = this._divDom.getElementsByClassName(className);
    for (let i = 0; i < errorDoms.length; i++) {
      this._divDom.removeChild(errorDoms[i]);
    }
  }

  // 获取出错的样式图片；
  getErrorImg() {
    return this._mediaDataSource.errorImg;
  }

  isError() {
    let className = this._mediaDataSource.errorImg ? 'player-error-img' : 'player-error-default';
    let errorDoms = this._divDom.getElementsByClassName(className);
    return errorDoms.length > 0;
  }

  get muted() {
    return this._videoDom.muted;
  }

  set muted(muted) {
    this._videoDom.muted = muted;
  }
  // 设置音量 volume
  get volume() {
    return this._videoDom.volume;
  }

  set volume(value) {
    this._videoDom.volume = value;
  }

  // 播放 play()
  play() {
    this._videoDom.play();
  }

  // 暂停 pause()

  pause() {
    super.pause();
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

  get paused() {
    return this._videoDom.paused;
  }

  // 进度跳转
  _toggleFullScreen() {
    _isFullscreenEnabled() ? this.exitFullScreen() : this.goFullScreen();
  }
  // 单机切换暂停、播放
  _togglePlayStatus() {
    if (this._videoDom.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  // 单机切换暂停、播放
};

class LnNativePlayer {
  // Just for defining our own function.
  constructor(mediaDataSource, config) {
    this._mediaDataSource = mediaDataSource;
    this._config = config;
    this._divDom = document.getElementById(mediaDataSource.wrapperId);
    this._videoDom = document.getElementById(mediaDataSource.wrapperId + '_player');
  }

  resetDom(id) {
    this._divDom = document.getElementById(id);
    this._videoDom = document.getElementById(id + '_player');
  }

  load() {
    this._videoDom.setAttribute('src', this._mediaDataSource.url);
  }

  play() {
    this._videoDom.play();
  }

  pause() {
    this._videoDom.pause();
  }
  // 设置播放进度
  setCurrentTime(time) {
    if (this._videoDom) {
      this._videoDom.currentTime = time;
    }
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

  // 关联video对象
  attachMedia() {
    let _vDom = this._videoDom;
    // 双击视频，切换全屏
    let v = this;
    _vDom.addEventListener('click', function () { v._togglePlayStatus() });
    _vDom.addEventListener('dblclick', function () { v._toggleFullScreen() });
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

  // 是否全屏
  isFullScreen() {
    let _vDom = this._videoDom;
    return _isFullscreenEnabled(_vDom);
  }

  // 事件监听
  listen(event, listener) {
    // 父类的事件监听
    // let _event = flvjs.Events;
    let _vDom = this._videoDom;
    if (event === 'fullScreen') { // 监听全屏事件
      window.addEventListener('resize', listener);
      return false;
    }
    if (event === 'videoError') { // 监听全屏事件
      event = 'error';
    }
    _vDom.addEventListener(event, listener);
  }

  // 取消事件监听
  unListen(event, listener) {
    if (event === 'fullScreen') { // 全屏监听
      window.removeEventListener('resize', listener);
      return false;
    }
    let _event = flvjs.Events;
    let playerFlag = false;
    let _vDom = this._videoDom;
    for (let e in _event) {
      if (event === _event[e]) {
        playerFlag = true;
        break;
      }
    }
    _vDom.removeEventListener(event, listener);
  }

  // 添加出错样式
  addErrorStyle(imgUrl) {
    if (this._mediaDataSource.errorImg) { // 已设置出错图片
      let errorImgs = this._divDom.getElementsByClassName('player-error-img');
      if (!errorImgs.length) {
        let _errorDom = document.createElement('img');
        _errorDom.setAttribute('class', 'player-error-img');
        _errorDom.setAttribute('src', imgUrl);
        this._divDom.appendChild(_errorDom);
      }
    } else { // 未设置默认出错图片
      let errorImgs = this._divDom.getElementsByClassName('player-error-default');
      if (!errorImgs.length) {
        let _errorDom = document.createElement('div');
        _errorDom.setAttribute('class', 'player-error-default');
        _errorDom.innerHTML = '<span>抱歉，当前视频资源无法加载！</span>';
        _errorDom.setAttribute('style', 'font-size: ' + this._divDom.clientHeight * 0.05 + 'px');
        this._divDom.appendChild(_errorDom);
      }
    }
  }

  // 取消出错样式
  removeErrorStyle() {
    let className = this._mediaDataSource.errorImg ? 'player-error-img' : 'player-error-default';
    let errorDoms = this._divDom.getElementsByClassName(className);
    for (let i = 0; i < errorDoms.length; i++) {
      this._divDom.removeChild(errorDoms[i]);
    }
  }

  // 获取出错的样式图片；
  getErrorImg() {
    return this._mediaDataSource.errorImg;
  }
  isError() {
    let className = this._mediaDataSource.errorImg ? 'player-error-img' : 'player-error-default';
    let errorDoms = this._divDom.getElementsByClassName(className);
    return errorDoms.length > 0;
  }

  // 注销
  dispose() {
    let _v = this;
    if (_v._videoDom) {
      _v._divDom.removeChild(_v._videoDom);
      try {
        _v._videoDom.pause();
      } catch (e) {
        _v._videoDom.destroy();
        _v._videoDom.setAttribute('src', '');
      }
    }
    let dom = _v._divDom.getElementsByClassName('player-poster-img');
    if (dom.length > 0) {
      _v._divDom.removeChild(dom[0]);
    }
  }

  destroy() {
    let _v = this;
    if (_v._videoDom) {
      try {
        _v._divDom.removeChild(_v._videoDom);
        _v._videoDom.setAttribute('src', '');
      } catch (e) {
        console.log(e);
      }
    }
    let dom = _v._divDom.getElementsByClassName('player-poster-img');
    if (dom.length > 0) {
      _v._divDom.removeChild(dom[0]);
    }
  }

  // 切换全屏
  _toggleFullScreen() {
    _isFullscreenEnabled(this._videoDom) ? this.exitFullScreen() : this.goFullScreen();
  }

  // 单机切换暂停、播放
  _togglePlayStatus() {
    if (this._videoDom.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  get paused() {
    return this._videoDom.paused;
  }

  get playbackRate() {
    return this._videoDom.playbackRate;
  }

  set playbackRate(rate) {
    this._videoDom.playbackRate = rate;
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
}

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

export { LnFlvPlayer, LnNativePlayer };
