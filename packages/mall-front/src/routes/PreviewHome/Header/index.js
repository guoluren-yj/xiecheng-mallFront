/**
 * header - 商城头部
 * @date: 2019-08-28
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

import HmallConfig from 'utils/api-config';
import { HEADER_NULL_PADDING_TOP } from 'utils/constants';
import TopBar from './TopBar';
import Search from './Search';
import MenuBar from './MenuBar';
import style from './index.less';
import SiglSearch from './SiglSearch';

export default function Header(props) {
  const { mallType, unitId } = props;
  const [top, setTop] = useState(0);
  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  function handleScroll() {
    const isHome =
      location.pathname === `${HmallConfig.basePath}` ||
      location.pathname === `${HmallConfig.basePath}/` ||
      location.pathname === `${HmallConfig.basePath}/sigl` ||
      location.pathname === `${HmallConfig.basePath}/pub`;
    const targetHeight = isHome ? 570 : 30;
    const scrollTop =
      document.body.scrollTop ||
      document.documentElement.scrollTop ||
      document.querySelector('.gb-wrapper').scrollTop;
    if (scrollTop >= targetHeight) {
      document.querySelector('#header + div').style.paddingTop = `${HEADER_NULL_PADDING_TOP}px`;
      document.querySelector('#header').style.width = `${
        document.querySelector('.gb-wrapper')?.offsetWidth
      }px`;
      document.querySelector('#header').style.boxShadow = '0 1px 3px rgba(26, 26, 26, 0.1)';
      document.querySelector('#header').style.position = 'fixed';
      document.querySelector('#header').style.paddingBottom = '5px';
      document.querySelector('#topDom').style.display = 'none';
      if (document.querySelector('#menuDom')) {
        document.querySelector('#menuDom').style.display = 'none';
      }
      if (!window.location.pathname.includes('/my-mall/')) {
        document.querySelector('#hot-word').style.display = 'none';
      }
    } else {
      if (document.querySelector('#header + div')) {
        document.querySelector('#header + div').style.paddingTop = '0px';
      }
      document.querySelector('#topDom').style.display = 'block';
      if (document.querySelector('#menuDom')) {
        document.querySelector('#menuDom').style.display = 'block';
      }
      document.querySelector('#header').style.width = '100%';
      document.querySelector('#header').style.boxShadow = 'none';
      document.querySelector('#header').style.position = 'static';
      document.querySelector('#header').style.paddingBottom = 0;
      if (!window.location.pathname.includes('/my-mall/')) {
        document.querySelector('#hot-word').style.display = 'block';
      }
    }
    setTop(scrollTop);
  }

  return (
    <div
      id="header"
      className={classNames({
        [style['header-content']]: true,
      })}
    >
      <TopBar mallType={mallType} finish={props.finish} />
      {mallType ? <SiglSearch /> : <Search />}
      <div
        style={{
          display:
            !window.location.pathname.includes('/my-mall/') &&
            !['/product-detail', '/product-read'].includes(window.location.pathname)
              ? 'block'
              : 'none',
        }}
      >
        <MenuBar
          mallType={mallType}
          unitId={unitId}
          finish={props.finish}
          top={top - 152 > 0 ? top - 152 : 0}
        />
      </div>
    </div>
  );
}
