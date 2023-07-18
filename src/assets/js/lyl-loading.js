/**
 * 定义了公共的loading样式
 */
export default class lylLoading {
  constructor() {
    this.windowDom = document.body;
    this.loadingDom = document.createElement('div');
    this.loadingDom.innerHTML = `<div class="sk-folding-cube">
                              <div class="sk-cube1 sk-cube"></div>
                              <div class="sk-cube2 sk-cube"></div>
                              <div class="sk-cube4 sk-cube"></div>
                              <div class="sk-cube3 sk-cube"></div>
                            </div>`
    this.loadingDom.setAttribute('class', 'lyl-loading');
    this.loadingDom.setAttribute('id', 'lyl-loading');
  }
  // 显示loading
  showLoading() {
    if (!document.getElementById('lyl-loading')) this.windowDom.appendChild(this.loadingDom);
  }
  // 隐藏loading
  hideLoading() {
    if (document.getElementById('lyl-loading')) this.windowDom.removeChild(this.loadingDom);
  }
}