/* eslint-disable */
import { LnFlvPlayer, LnNativePlayer } from './flv-player';
import HlsPlayer from './hls-player.js';
import './player.scss'


function createLNPlayer(mediaDataSource, optionalConfig) {
  // 对类型资源的检测
  if (mediaDataSource == null || typeof mediaDataSource !== 'object') throw String('From lnPlayer: The param of method createLNPlayer must be a javascript object!');

  if (!mediaDataSource.wrapperId) throw String('From lnPlayer: The first param of method createLNPlayer must has [wrapperId] field!')

  //vDom 必须存在
  const _id = mediaDataSource.wrapperId;
  const vDom = document.getElementById(_id);
  if (!vDom) throw String('From lnPlayer: can\'t find the div item from document base on your [wrapperId]!');
  console.log('mediaDataSource', mediaDataSource);

  if (!mediaDataSource.videoType) mediaDataSource.videoType = _getVideoType(mediaDataSource.url);

  // 如果浏览器为ie浏览器，则无法播放flv和hls视频流。
  if ((mediaDataSource.videoType === 'live' || mediaDataSource.videoType === 'hls') && !LnFlvPlayer.isSupported()) {
    const _divDom = document.createElement('div');
    const noSupportClass = mediaDataSource.noSupportClass ? mediaDataSource.noSupportClass : 'player-no-support';
    _divDom.setAttribute('class', noSupportClass);
    _divDom.innerHTML = '<div>当前浏览器不支持直播！<br/> 请更换浏览器（如谷歌、火狐等）观看！</div>';
    vDom.appendChild(_divDom);
    return false;
  }
  // 传入资源为空时，默认显示暂无资源图片
  //:TODO 检测
  if (!mediaDataSource.url) {
    return false;
  } else {
    const mark = mediaDataSource.url.indexOf('?') > -1 ? '&' : '?'; // 添加时间戳，防止浏览器缓存
    mediaDataSource.url = mediaDataSource.url + `${mark}time=${Date.now()}`;
  }

  if (!mediaDataSource.type) {
    const type = _videoType(mediaDataSource.url);
    if (!type) {
      throw String('From lnPlayer: The value of [type] from the first param of method createLNPlayer may be invalid.')
    } else {
      mediaDataSource.type = type;
    }
  }

  // 创建video标签，放在document中
  vDom.style.position = 'relative';
  // _cleanVideoDom(vDom);
  const videoDom = document.createElement('video');
  videoDom.setAttribute('id', _id + '_player');
  videoDom.addEventListener('loadedmetadata', () => {
    const ratioFlag = videoDom.videoWidth / videoDom.videoHeight > 1.78;
    const style = mediaDataSource.videoStyle ? mediaDataSource.videoStyle : ratioFlag ? 'width: 100%; height: 100%' : 'height: 100%; width: 100%;';
    videoDom.setAttribute('style', style);
  }, { once: true });
  vDom.appendChild(videoDom);

  if (mediaDataSource.autoPlay === undefined) mediaDataSource.autoPlay = true

  //创建播放器对象
  let player = null;
  switch (mediaDataSource.videoType.toLowerCase()) {
    case 'live': {
      mediaDataSource.type = 'flv';
      let retryTimes = 0;
      player = new LnFlvPlayer(mediaDataSource, optionalConfig);
      setTimeout(() => {
        player.attachMedia();
        player.load();
        if (mediaDataSource.autoPlay) {
          player.muted = true;
          player.volume = 0;
          player.play();
        }
        player.listen('media_info', mediaInfo);
        function mediaInfo() {
          const doms = vDom.getElementsByClassName('player-poster-img');
          if (doms.length > 0) {
            for (let i = 0; i < doms.length; i++) {
              vDom.removeChild(doms[i]);
            }
          }
          player.unListen('media_info', mediaInfo);
        }
        function errorSet(err) {
          if (err === 'NetworkError' && retryTimes < 6) {
            retryTimes++;
            setTimeout(() => {
              player.unload();
              player.detachMediaElement();
              setTimeout(() => {
                player.attachMedia();
                player.load();
                player.play();
              }, 5);
            }, 2000);
          } else {
            // player.addErrorStyle(mediaDataSource.errorImg);
            player.unListen('error', errorSet);
          }
        }
        player.listen('error', errorSet);
      }, 5);
      return player;
    }
    case 'hls': // 播放hls流
      player = new HlsPlayer(mediaDataSource);
      player.loadSource(mediaDataSource.url);
      player.attachMediaData();
      console.log('player', player);
      if (mediaDataSource.autoPlay) {
        player.muted = true;
        player.volume = 0;
        player.play();
      }
      break;
    case 'video': // 播放视频
      player = new LnNativePlayer(mediaDataSource, optionalConfig);
      player.load();
      player.attachMedia();
      if (mediaDataSource.autoPlay) {
        player.muted = true;
        player.volume = 0;
        player.play();
      }
      break;
    default:
      break;
  }
  return player;
}

function _videoType(url) {
  if (!url) return false;
  const type = url.split('.').pop().split('?')[0];
  return type.toLowerCase();
}

// 返回url的格式，即文件扩展名。
function _getVideoType(url) {
  if (!url) return false;
  if (url.indexOf('.m3u8') > -1) {
    return 'hls';
  }
  if (url.indexOf('flv') > -1) {
    return 'live';
  } else {
    return 'video';
  }
}

//清除传入的dom中，多余的video和不需要存在的div元素。
function _cleanVideoDom(dom) {
  const pauseDomList = dom.getElementByClassName('player-pause-button');
  if (pauseDomList.length) {
    for (let i = 0; i < pauseDomList.length; i++) {
      dom.removeChild(pauseDomList[i]);
    }
  }
  const videoDomeList = dom.getElementsByTagName('video');
  if (videoDomeList.length) {
    for (let i = 0; i < videoDomeList.length; i++) {
      dom.removeChild(videoDomeList[i]);
    }
  }
}


// interfaces
const playerjs = {};

playerjs.createPlayer = createLNPlayer;
playerjs.getVideoType = _getVideoType;

export default playerjs;
