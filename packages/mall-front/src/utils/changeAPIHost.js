// 根据浏览器域名转换对应网关
export function changeAPIHOST(API_HOST) {
  const { host, hostname, protocol } = window.location;
  const ipv4Reg = /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
  const ipv6Reg = /^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$/;
  const autoApiHost = process.env.MALL_AUTO_API_HOST;
  if (
    !autoApiHost ||
    autoApiHost === 'false' ||
    hostname.includes('going-link.com') ||
    hostname.includes('going-buy.com') ||
    hostname === 'localhost' ||
    ipv4Reg.test(hostname) ||
    ipv6Reg.test(hostname)
  ) {
    return API_HOST;
  }
  return `${protocol}//gateway-${host}`;
}
