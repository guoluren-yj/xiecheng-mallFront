import { useEffect } from 'react';

export default function useGreyMode({ webConfig = {}, location = {} }) {
  // 企业购 会员购 预览页
  const isHome = ['/', '/sigl', '/pub'].includes(location.pathname);
  const { greyMode, greyModeRange, greyModeFlag } = webConfig;
  // 开启灰色模式 &&  时间范围在有效期内
  const isGreyMode = greyMode && greyModeFlag;

  const allGrey = isGreyMode && greyModeRange === 'ALL';
  const homePageGrey = isGreyMode && greyModeRange === 'HOMEPAGE';

  useEffect(() => {
    //  全局置灰  allGrey 不需要判断路由
    // 首页置灰 homePageGrey &&  isHome
    if (allGrey || (homePageGrey && isHome)) {
      document.documentElement.style.filter = 'grayscale(1)';
    } else {
      document.documentElement.removeAttribute('style');
    }
  }, [allGrey, homePageGrey, isHome]);
}
