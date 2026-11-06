/* eslint-disable no-useless-escape */
// 获取浏览器信息
export default function getBrowserInfo() {
  const ua = window.navigator.userAgent;
  if (/trident.+rv[: ]([\w\.]{1,9})\b.+like Gecko/i.test(ua)) {
    return {
      browser: 'IE',
      version: 11,
      standard: false,
    };
  } else if (/MicroMessenger\/(\S+)/i.test(ua)) {
    return {
      browser: 'WeChart',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.0,
    };
  } else if (/metasr[\s|\/]([\w\.]+)/i.test(ua)) {
    if (/SE[\s|\/](\w)/i.test(ua)) {
      return {
        browser: 'Sougou',
        version: RegExp.$1,
        standard: parseFloat(RegExp.$1) >= 2,
      };
    }
  } else if (/QQBrowser\/(\S+)/i.test(ua)) {
    return {
      browser: 'QQBrowser',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 9.3,
    };
  } else if (/rv:([^)]+)\) Gecko\/\d{8}/i.test(ua)) {
    if (/Firefox\/(\S+)/.test(ua)) {
      return {
        browser: 'Firefox',
        version: RegExp.$1,
        standard: parseFloat(RegExp.$1) >= 68,
      };
    }
  } else if (/edg(?:e|ios|a)?\/(\S+)/i.test(ua)) {
    return {
      browser: 'Edge',
      version: RegExp.$1,
      standard: true,
    };
  } else if (/SLBChan\/(\S+)/i.test(ua)) {
    return {
      browser: 'Lenovo',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.0,
    };
  } else if (/OPR\/(\S+)/i.test(ua)) {
    return {
      browser: 'Opera',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 60,
    };
  } else if (/UBrowser\/(\S+)/i.test(ua)) {
    return {
      browser: 'UC',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 6.2,
    };
  } else if (
    /\(KHTML, like Gecko\) Chrome\/(\S+)/i.test(ua) ||
    /\(KHTML, like Gecko\) HeadlessChrome\/(\S+)/i.test(ua)
  ) {
    return {
      browser: 'Chrome',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 75,
    };
  } else if (/Safari\/(\S+)/i.test(ua) && /Version\/(\S+)/i.test(ua)) {
    return {
      browser: 'Safari',
      version: RegExp.$1,
      standard: parseFloat(RegExp.$1) >= 13,
    };
  }

  return {
    browser: 'unknown',
    version: 'unknown',
    standard: false,
  };
}
