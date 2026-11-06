import defaultImg from '@/assets/images/no-product-img.svg';

export default class Fly {
  constructor({ startEle, endEle, imgUrl, callback = (e) => e, maxTop = [150, 10] }) {
    this.startEle = startEle;
    this.endEle = endEle;
    this.callback = callback;
    this.imgUrl = imgUrl || defaultImg;
    this.maxTop = maxTop;
  }

  init() {
    if (!this.startEle || !this.endEle) return;
    const x1 = this.startEle.getBoundingClientRect().left + 20;
    const y1 = this.startEle.getBoundingClientRect().top;
    const x2 = this.endEle.getBoundingClientRect().left;
    const y2 = this.endEle.getBoundingClientRect().top;
    const x3 = this.endEle.getBoundingClientRect().left - this.maxTop[0];
    const y3 = this.endEle.getBoundingClientRect().top + this.maxTop[1];
    // (x1,y1）----起点坐标  (x2,y2) ----终点坐标 （x3，y3）----最高点坐标
    const a =
      -((y2 - y3) * x1 - (x2 - x3) * y1 + x2 * y3 - x3 * y2) / ((x2 - x3) * (x1 - x2) * (x1 - x3));
    const b =
      ((y2 - y3) * x1 * x1 + x2 * x2 * y3 - x3 * x3 * y2 - (x2 * x2 - x3 * x3) * y1) /
      ((x2 - x3) * (x1 - x2) * (x1 - x3));
    const c =
      ((x2 * y3 - x3 * y2) * x1 * x1 -
        (x2 * x2 * y3 - x3 * x3 * y2) * x1 +
        (x2 * x2 * x3 - x2 * x3 * x3) * y1) /
      ((x2 - x3) * (x1 - x2) * (x1 - x3));
    // 求飞行物top值的，公式 ----top = a*x1*x1+b*x1+c
    const fly = document.createElement('img');
    let left = x1;
    let top = y1;
    fly.src = this.imgUrl;
    fly.style.display = 'block';
    fly.style['border-radius'] = '50%';
    fly.style.left = `${left}px`;
    fly.style.top = `${top}px`;
    fly.style.width = '30px';
    fly.style.height = '30px';
    fly.style.position = 'absolute';
    fly.style.background = '#FF0000';
    document.body.appendChild(fly);
    const tim = setInterval(() => {
      if (left > x2) {
        clearInterval(tim);
        if (isIE()) {
          fly.removeNode(true);
        } else {
          fly.remove();
        }
        this.callback();
      }
      left += 8;
      top = a * left * left + b * left + c;
      fly.style.left = `${left}px`;
      fly.style.top = `${top}px`;
    }, 10); // 还是不够丝滑
  }

  initX() {
    // 以矩形的方式
    const x1 = this.startEle.getBoundingClientRect().left + 20;
    const y1 = -this.startEle.getBoundingClientRect().top;
    const x2 = this.endEle.getBoundingClientRect().left;
    const y2 = -this.endEle.getBoundingClientRect().top;
    // (x1,y1）----起点坐标  (x2,y2) ----终点坐标
    const k = (y1 - y2) / (x1 - x2);
    const b = y1 - ((y1 - y2) * x1) / (x1 - x2);
    // 求飞行物top值的，公式 ----top = a*x1*x1+b*x1+c
    const fly = document.createElement('img');
    let left = x1;
    let top = y1;
    fly.src = this.imgUrl;
    fly.style.display = 'block';
    fly.style['border-radius'] = '50%';
    fly.style.left = `${left}px`;
    fly.style.top = `${top}px`;
    fly.style.width = '30px';
    fly.style.height = '30px';
    fly.style.position = 'absolute';
    fly.style.background = '#FF0000';
    document.body.appendChild(fly);
    const tim = setInterval(() => {
      if (top > y2) {
        clearInterval(tim);
        if (isIE()) {
          fly.removeNode(true);
        } else {
          fly.remove();
        }
        this.callback();
      }
      left += 5;
      top = k * left + b;
      fly.style.left = `${left}px`;
      fly.style.top = `${-top}px`;
    }, 10);
  }
}

function isIE() {
  if (
    !!window.ActiveXObject ||
    'ActiveXObject' in window ||
    /Trident\/7\./.test(navigator.userAgent)
  ) {
    return true;
  } else {
    return false;
  }
}
