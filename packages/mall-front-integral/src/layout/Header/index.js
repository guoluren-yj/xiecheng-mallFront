/**
 * header - 商城头部
 * @date: 2019-08-28
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import React, { useState, useEffect } from 'react';
import classNames from 'classnames';

import useEventListener from 'hooks/useEventListener';
import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import { getEcListService } from 'services/headerService';
import { HEADER_NULL_PADDING_TOP } from 'utils/constants';
import TopBar from '@/layout/Header/TopBar';
import Search from '@/layout/Header/Search';
import MenuBar from 'mall-front/lib/layout/Header/MenuBar';
import style from './index.less';

function Header(props) {
  const { dispatch } = props;
  const { userId, unitList } = getUserConfigInfo();
  const [ecList, setEcList] = useState([]);
  const isLogin = !!userId;
  const [top, setTop] = useState(0);

  useEventListener('scroll', handleScroll, true);

  useEffect(() => {
    if (isLogin && props.finish) {
      setTimeout(() => {
        getEcList();
      }, 1000);
    }
  }, [props.finish]);

  // 获取电商列表
  function getEcList() {
    getEcListService().then((res) => {
      setEcList(res);
      const ecServiceList = (res || []).map((m) => ({
        ecPlatformName: m.ecPlatformName,
        ecPlatformCode: m.ecPlatformCode,
      }));
      dispatch({
        type: 'global/update',
        payload: {
          ecServiceList,
        },
      });
    });
  }

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
        document.querySelector('.gb-wrapper').offsetWidth
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
      <TopBar finish={props.finish} unitList={unitList} ecList={ecList} />
      <Search ecList={ecList} />
      <div
        style={{
          display:
            !window.location.pathname.includes('/my-mall/') &&
            !['/sigl/product-detail', '/product-read'].includes(window.location.pathname)
              ? 'block'
              : 'none',
        }}
      >
        <MenuBar finish={props.finish} ecList={ecList} top={top - 152 > 0 ? top - 152 : 0} />
      </div>
    </div>
  );
}

export default Header;
