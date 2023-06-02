const utilsTime = {
    formatTime: function(time) {
        const _time = parseInt(time);
        if (_time) {
            let _s = _time; // 秒
            let _m = '0'; // 分
            let _h = '0'; // 小时
            let _result = ''; // 结果
            if (_s > 59) { // 如果秒数大于59，则将秒数转换为整数
                _m = parseInt(_s / 60); // 获取分钟，除以60取整数，得到整数分钟
                _s = parseInt(_s % 60); // 获取秒钟，秒数取余，得到整秒数
                if (_m > 60) { // 如果分钟大于60，将分数转换成小时
                    _h = parseInt(_m / 60); // 大于60的分钟转换为小时
                    _m = parseInt(_m % 60); // 得到小时后，取余得到多余的分
                }
            }
            if (_m >= 0) _result = (_s < 10 ? _s === 0 ? '00' : `0${_s}` : _s);
            if (_m >= 0) _result = (_m < 10 ? _m === 0 ? '00:' : `0${_m}:` : `${_m}:`) + _result;
            if (_h >= 0) _result = (_h < 10 ? _h === 0 ? '' : `0${_h}:` : `${_h}:`) + _result;

            return _result;
        } else {
            return '00:00';
        }
    }
};
export { utilsTime };
