import React, { useState, useEffect, useRef, useMemo } from 'react';

import intl from 'utils/intl';
import Swal from 'components/swal';
import HmallConfig from 'utils/api-config';
import { getUserConfigInfo } from '@/utils/utils';

let timer; // 定时器索引
export default function TimeGoBack(props) {
  const constTime = useMemo(() => {
    const { preReturnTime } = getUserConfigInfo();
    if (preReturnTime && parseInt(preReturnTime, 10) > 0) {
      if (preReturnTime?.includes('s')) {
        return parseInt(preReturnTime, 10);
      } else if (preReturnTime?.includes('m')) {
        return parseInt(preReturnTime, 10) * 60;
      } else {
        return 300; // 300s后回退购物车
      }
    } else {
      return 300; // 300s后回退购物车
    }
  }, []);
  const { clearAllData, orderType } = props;
  const countdownClock = useRef();

  const [countdown, setCountdown] = useState(constTime); // 倒计时

  useEffect(() => {
    countdownClock.current = setInterval(() => {
      setCountdown((counts) => counts - 1);
    }, 1000);
    clearTimeout(timer);
    // 停留当前页面300s后回退购物车
    timer = setTimeout(onEndStayTime, constTime * 1000);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      clearTimeout(countdownClock.current);
    }
  }, [countdown]);

  const onEndStayTime = () => {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.querySelector('.gb-wrapper').scrollTop = 0;
    document.querySelector('.gb-wrapper').style.overflow = 'hidden';
    const overdueInfo =
      orderType === 'centralized'
        ? `${intl
            .get(`mallf.companyOrder.model.companyOrder.infoOverReturnCentralize`)
            .d('该页面信息已过期，所有商品已退回至拼单列表，请您重新提交')}!`
        : `${intl
            .get(`mallf.companyOrder.model.companyOrder.infoOverReturn`)
            .d('该页面信息已过期，所有商品已退回至购物车，请您重新提交')}!`;
    Swal(overdueInfo).then(() => {
      document.querySelector('.gb-wrapper').style.overflow = 'auto';
      clearAllData();
      props.history.push({
        pathname: `${HmallConfig.contextPath}${
          orderType === 'centralized' ? '/my-mall/centralize-list' : '/cart'
        }`,
      });
    });
  };

  return <span>({countdown}s)</span>;
}
