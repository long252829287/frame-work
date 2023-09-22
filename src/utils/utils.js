// 防抖函数
export const debounce = (fn, delay) => {
  let timer = null;
  return function(...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  }
}

// 节流函数
export const throttle = (fn, delay = 500) => {
  let last = 0;
  let timer = null;
  
  return function () {
    let context = this;
    let args = arguments;
    let now = +new Date();
    
    if (now - last < delay) {
      clearTimeout(timer);
      timer = setTimeout(function () {
        last = now;
        fn.apply(context, args);
      }, delay - (now - last)); // 修正延迟时间为剩余时间
    } else {
      last = now;
      fn.apply(context, args);
    }
  };
};
