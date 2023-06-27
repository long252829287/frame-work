## zqPlayer Api
===========

该文档用于描述zqPlayer插件的接口Api。

## interfaces

##接口函数：

```javascript 
createPlayer(mediaDataSource, config);
```

说明：创建播放器实例，并返回该实例。
参数：[参数详解可看最下边]
* mediaDataSource : 必传，[Object]， 媒体资源数据 
* config: 非必传，[Object]， 播放器配置信息
返回：
播放器对象

### For example:

```javascript 
import playerjs from './zq-player.js';

let mediaDataSource = {
    wrapperId: 'divId', // video的容器元素的ID，必传
    url: 'http://192.168.12.219:81/srs/live/kenan.flv', // 资源路径，必传
    type: 'flv', // 非必传，视频类型
    autoPlay: true, // 非必传，是否自动播放
    isLive: true // 非必传，是否直播
};
let config = { // 非必传
    lazyLoad: true,
    lazyLoadMaxDuration: 5 * 60
};
let player = playerjs.createPlayer(mediaDataSource, config);
```

描述：用法简单，url是必传的，但可以为空；type不传的时候，会自动根据传入的url去辨别视频类型，默认会自动播放。
*该播放器目前只支持flv,hls,mp4三种类型！*


## 播放器对象de属性详解：

```javascript 
// 举个例子
let mediaDataSource = {
    wrapperId: 'divId', // video的容器元素的ID，必传
    url: 'http://192.168.12.219:81/srs/live/kenan.flv' // 资源路径，必传
};
let player = playerjs.createPlayer(mediaDataSource);

// get
console.log(player.muted); // 是否静音
console.log(player.volume); // 当前音量
console.log(player.currentTime); // 当前播放时间（单位：秒）
console.log(player.duration); // 视频总时长

// set
player.muted = false; // 布尔型
player.volume = 0.25; // 取值0-1之间，建议保留小数点后面两位
player.currentTime = 3.25658; // 跳转进度播放，（单位：秒）

```

## 播放器对象de方法详解：

```javascript 
// 举个例子
let mediaDataSource = {
    wrapperId: 'divId', // video的容器元素的ID，必传
    url: 'http://192.168.12.219:81/srs/live/kenan.flv' // 资源路径，必传
};
let player = playerjs.createPlayer(mediaDataSource);

player.play(); // 播放
player.pause(); // 暂停
player.dispose(); // 注销
player.setCurrentTime(time); // 跳转到某时间播放。 参数：数值型，例如：3.2654
player.setPlayBackRate(rate); // 倍速播放。参数：数值型，例如： 3.0
player.goFullScreen(); // 全屏
player.exitFullScreen(); // 退出全屏

```

## 播放器对象de事件监听：

```javascript 
// 举个例子
let mediaDataSource = {
    wrapperId: 'divId', // video的容器元素的ID，必传
    url: 'http://192.168.12.219:81/srs/live/kenan.flv' // 资源路径，必传
};
let player = playerjs.createPlayer(mediaDataSource);

// player.listen(event, listener);
player.listen('play', function () { // 开始播放
    console.log('play');
});
player.listen('error', function () { // 播放出错
    console.log('error');
});
player.listen('media_info', function () { // 获取媒体信息完成
    console.log('metadata_arrived');
});
player.listen('fullScreen', this.fullScreen);;
});

fullScreen(flag) {
    if(flag) {
        // 全屏
    } else {
        // 退出全屏
    }
}

// player.unListen(event,listener); 取消已绑定的事件监听

```
说明：(以下事件均可以使用listen方法监听)
所有H5原生的video事件都可以监听，包括：play,pause,error,seeking,playing,waiting,abort……等等
有一些针对flv的事件监听，可以注意下。包括：loading_complete,media_info,metadata_arrived,recovered_early_eof,scriptdata_arrived,ended



## 参数详解

播放FLV直播流的参数详解如下：

* mediaDataSource：

| Field              | Type                  | Description                              |
| ------------------ | --------------------- | ---------------------------------------- |
| `wrapperId?`       | `string`              | video的容器div的ID，必须传 |
| `url?`             | `string`              | 媒体流地址，允许https协议和ws协议 |
| `type`             | `string`              | 媒体类型： `'flv'` or `'mp4'` |
| `isLive?`          | `boolean`             | 是否是直播流 |
| `cors?`            | `boolean`             | Indicates whether to enable CORS for http fetching |
| `withCredentials?` | `boolean`             | 跨域是否携带cookie |
| `hasAudio?`        | `boolean`             | Indicates whether the stream has audio track |
| `hasVideo?`        | `boolean`             | Indicates whether the stream has video track |
| `duration?`        | `number`              | Indicates total media duration, in **milliseconds** |
| `filesize?`        | `number`              | Indicates total file size of media file, in bytes |
| `segments?`        | `Array<MediaSegment>` | Optional field for multipart playback, see **MediaSegment** |

If `segments` field exists, transmuxer will treat this `MediaDataSource` as a **multipart** source.

In multipart mode, `duration` `filesize` `url` field in `MediaDataSource` structure will be ignored.

* MediaSegment：

| Field       | Type     | Description                              |
| ----------- | -------- | ---------------------------------------- |
| `duration`  | `number` | Required field, indicates segment duration in **milliseconds** |
| `filesize?` | `number` | Optional field, indicates segment file size in bytes |
| `url`       | `string` | Required field, indicates segment file URL |


* Config

| Field                            | Type      | Default                      | Description                              |
| -------------------------------- | --------- | ---------------------------- | ---------------------------------------- |
| `enableWorker?`                  | `boolean` | `false`                      | Enable separated thread for transmuxing (unstable for now) |
| `enableStashBuffer?`             | `boolean` | `true`                       | Enable IO stash buffer. Set to false if you need realtime (minimal latency) for live stream playback, but may stalled if there's network jittering. |
| `stashInitialSize?`              | `number`  | `384KB`                      | Indicates IO stash buffer initial size. Default is `384KB`. Indicate a suitable size can improve video load/seek time. |
| `isLive?`                        | `boolean` | `false`                      | Same to `isLive` in **MediaDataSource**, ignored if has been set in MediaDataSource structure. |
| `lazyLoad?`                      | `boolean` | `true`                       | Abort the http connection if there's enough data for playback. |
| `lazyLoadMaxDuration?`           | `number`  | `3 * 60`                     | Indicates how many seconds of data to be kept for `lazyLoad`. |
| `lazyLoadRecoverDuration?`       | `number`  | `30`                         | Indicates the `lazyLoad` recover time boundary in seconds. |
| `deferLoadAfterSourceOpen?`      | `boolean` | `true`                       | Do load after MediaSource `sourceopen` event triggered. On Chrome, tabs which be opened in background may not trigger `sourceopen` event until switched to that tab. |
| `autoCleanupSourceBuffer`        | `boolean` | `false`                      | Do auto cleanup for SourceBuffer         |
| `autoCleanupMaxBackwardDuration` | `number`  | `3 * 60`                     | When backward buffer duration exceeded this value (in seconds), do auto cleanup for SourceBuffer |
| `autoCleanupMinBackwardDuration` | `number`  | `2 * 60`                     | Indicates the duration in seconds to reserve for backward buffer when doing auto cleanup. |
| `fixAudioTimestampGap`           | `boolean` | `true`                       | Fill silent audio frames to avoid a/v unsync when detect large audio timestamp gap. |
| `accurateSeek?`                  | `boolean` | `false`                      | Accurate seek to any frame, not limited to video IDR frame, but may a bit slower. Available on `Chrome > 50`, `FireFox` and `Safari`. |
| `seekType?`                      | `string`  | `'range'`                    | `'range'` use range request to seek, or `'param'` add params into url to indicate request range. |
| `seekParamStart?`                | `string`  | `'bstart'`                   | Indicates seek start parameter name for `seekType = 'param'` |
| `seekParamEnd?`                  | `string`  | `'bend'`                     | Indicates seek end parameter name for `seekType = 'param'` |
| `rangeLoadZeroStart?`            | `boolean` | `false`                      | Send `Range: bytes=0-` for first time load if use Range seek |
| `customSeekHandler?`             | `object`  | `undefined`                  | Indicates a custom seek handler          |
| `reuseRedirectedURL?`            | `boolean` | `false`                      | Reuse 301/302 redirected url for subsequence request like seek, reconnect, etc. |
| `referrerPolicy?`                | `string`  | `no-referrer-when-downgrade` | Indicates the [Referrer Policy][] when using FetchStreamLoader |
| `headers?`                       | `object`  | `undefined`                  | Indicates additional headers that will be added to request |