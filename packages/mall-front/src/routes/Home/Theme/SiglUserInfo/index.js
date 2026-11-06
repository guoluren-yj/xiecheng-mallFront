import React, { useEffect, useMemo, useState } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { Icon } from 'choerodon-ui/pro';

import Image from 'components/Image';
import { getUserConfigInfo } from 'utils/utils';
import Icons from 'components/Icons';
import Link from 'components/Link';
import intl from 'utils/intl';
import defaultImg from '@/assets/images/default/touxiang.png';
import useRequest from 'hooks/useRequest';

import styles from './index.less';
import getLinkList from '../linkList';
import { fetchOmsOrderStatusCount } from './api';
import BackgroundSvg from './BackgroundSvg';

function UserInfo(props) {
  const {
    userInfo: { currentRoleName = '', realName = '', imageUrl },
    isMixTenant,
    hideMenuList,
    unReadCount,
    organizationId,
    userId,
  } = getUserConfigInfo();

  const { gonggaoData } = props;
  const [currentPoint, setCurrentPoint] = useState({});

  const gonggaoList = useMemo(() => {
    return gonggaoData?.content || [];
  }, [gonggaoData]);

  useRequest({
    url: `/sigl/v1/${organizationId}/points-types/points-type/${userId}`,
    success: (res) => {
      const data = res.filter((n) => n.integralBalance > 0);
      setCurrentPoint(
        data[0] || {
          integralBalance: 0,
          pointsTypeName: intl.get('mallf.common.view.sigl.name').d('积分'),
        }
      );
    },
  });

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    const notice = document.querySelector('.scroll-notice');
    const noticeSecond = document.querySelector('.scroll-notice-second');
    const times = Math.ceil(gonggaoList.length / 2);
    // 大于3条才滚动
    if (notice && times > 1) {
      let currentTime = 0;
      setInterval(() => {
        ++currentTime;
        if (currentTime < times) {
          notice.style.opacity = 1;
          notice.style.translate = `0 -${currentTime * 48}px`;
          noticeSecond.style.opacity = 0;
          noticeSecond.style.translate = `0 ${48 - notice.clientHeight}px`;
        } else {
          currentTime = 0;
          notice.style.translate = 0;
          notice.style.opacity = 0;
          noticeSecond.style.opacity = 1;
          noticeSecond.style.translate = `0 -${notice.clientHeight + 6}px`; // 有个6px的外边距
        }
      }, 3250); // 跟banner默认滚动时间一样
    }
  }, [gonggaoList, document.querySelector('scroll-notice')]);

  function fetchUnreadCount() {
    const changeCount = (res) => {
      if (document.getElementById('home-theme-order-info-allOrder')) {
        document.getElementById('home-theme-order-info-allOrder').innerHTML =
          res.allNum || res.total || 0;
      }
      if (document.getElementById('home-theme-order-info-waitSent')) {
        document.getElementById('home-theme-order-info-waitSent').innerHTML =
          res.waitSent || res.unDelivered || 0;
      }
      if (document.getElementById('home-theme-order-info-waitReceive')) {
        document.getElementById('home-theme-order-info-waitReceive').innerHTML =
          res.waitReceive || res.unReceived || 0;
      }
    };
    fetchOmsOrderStatusCount().then((res) => {
      changeCount(res);
    });
  }

  const linkList = getLinkList({ hideMenuList, isMixTenant });

  return (
    <div className={styles.content}>
      <div
        className={classnames(['top-box'])}
        style={{ marginBottom: isEmpty(gonggaoList) ? 10 : 0 }}
      >
        <BackgroundSvg />
        <div className="top-user">
          <div className={styles['top-user-touxiang']}>
            <Image width={35} height={35} value={imageUrl || defaultImg} />
          </div>
          <div
            className={styles['top-user-userName']}
            onClick={() => {
              props.history.push('/sigl/my-mall/user-center');
            }}
          >
            <p>
              Hi！ <span>{`${realName}`}</span>
              <Icons size={12} type="right" />
            </p>
            <div className="currentRoleName text-overflow" title={currentRoleName}>
              {intl.get('mallf.common.view.integral').d('会员')}
            </div>
          </div>
          <div
            className="user-point"
            onClick={() => {
              props.history.push('/sigl/my-mall/my-sigl');
            }}
          >
            <div className="point-label text-overflow">
              {intl.get('mallf.common.view.sigl.name').d('积分')}
            </div>
            <div className="point-content text-overflow">
              {currentPoint.integralBalance}
              {currentPoint.pointsTypeName}
              <Icon type="keyboard_arrow_right" />
            </div>
          </div>
        </div>
      </div>
      <div
        className={styles['bottom-box']}
        style={{
          height: isEmpty(gonggaoList) ? 270 : 280,
          paddingTop: isEmpty(gonggaoList) ? 14 : 0,
        }}
      >
        <div className="order-info">
          <Link to="/sigl/my-mall/my-order">
            <div className="order-num">
              <div id="home-theme-order-info-allOrder" className="num">
                0
              </div>
              <div
                className="desc text-overflow"
                title={intl.get('mallf.myMall.view.order.allOrders').d('全部订单')}
              >
                {intl.get('mallf.myMall.view.order.allOrders').d('全部订单')}
              </div>
            </div>
          </Link>
          <Link to="/sigl/my-mall/my-order?displayStatus=WAITING_SENT">
            <div className="order-num">
              <div id="home-theme-order-info-waitSent" className="num">
                0
              </div>
              <div
                className="desc text-overflow"
                title={intl.get('mallf.myMall.view.order.willdeliver').d('待发货')}
              >
                {intl.get('mallf.myMall.view.order.willdeliver').d('待发货')}
              </div>
            </div>
          </Link>
          <Link to="/sigl/my-mall/my-order?displayStatus=WAITING_RECEIVE">
            <div className="order-num">
              <div id="home-theme-order-info-waitReceive" className="num">
                0
              </div>
              <div
                className="desc text-overflow"
                title={intl.get('mallf.myMall.view.order.pendingReceipt').d('待收货')}
              >
                {intl.get('mallf.myMall.view.order.pendingReceipt').d('待收货')}
              </div>
            </div>
          </Link>
        </div>
        {!isEmpty(gonggaoList) && (
          <div className="gonghgao-info">
            <p className="gonghgao-info-title">
              <span style={{ color: '#191919', fontWeight: 600 }}>
                {intl.get('mallf.home.view.gonggao').d('公告')}
              </span>
              <span className={unReadCount ? styles.notice : ''} />
              {gonggaoData?.totalElements > 2 && (
                <Link
                  to="/sigl/bulletin-boards"
                  style={{ float: 'right', color: '#999999', cursor: 'pointer' }}
                >
                  {intl.get('hzero.common.button.more').d('更多')}
                  <Icon type="navigate_next" style={{ marginTop: -3 }} />
                </Link>
              )}
            </p>
            <div className="gonghgao-info-content">
              <div className={gonggaoList?.length > 2 ? 'scroll-notice' : ''}>
                {gonggaoList.map((item) => (
                  <Link
                    to={`/sigl/bulletin-boards?bulletinId=${item.bulletinId}`}
                    className="gonghgao-info-item text-overflow"
                    title={item.bulletinTitle}
                  >
                    <Icon type="volume_up" />
                    {item.bulletinTitle}
                  </Link>
                ))}
              </div>
              {gonggaoList?.length > 2 && (
                <div className="scroll-notice-second">
                  <Link
                    to={`/sigl/bulletin-boards?bulletinId=${gonggaoList[0].bulletinId}`}
                    className="gonghgao-info-item text-overflow"
                    title={gonggaoList[0].bulletinTitle}
                  >
                    <Icon type="volume_up" />
                    {gonggaoList[0].bulletinTitle}
                  </Link>
                  <Link
                    to={`/sigl/bulletin-boards?bulletinId=${gonggaoList[1].bulletinId}`}
                    className="gonghgao-info-item text-overflow"
                    title={gonggaoList[1].bulletinTitle}
                  >
                    <Icon type="volume_up" />
                    {gonggaoList[1].bulletinTitle}
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
        <div className="link-info">
          <ul>
            {isEmpty(linkList) ? (
              <div style={{ textAlign: 'center', color: '#666666', marginTop: 15 }}>
                {intl.get('mallf.common.view.no.quicklink').d('暂无快速链接')}
              </div>
            ) : (
              linkList.map(
                (item) =>
                  item.visible && (
                    <li
                      onClick={() => {
                        props.history.push(item.path);
                      }}
                      title={item.name}
                    >
                      <div style={{ width: 24, height: 25, margin: '6px auto' }}>
                        <img style={{ width: '100%', height: '100%' }} src={item.icon} alt="" />
                      </div>
                      <div className="desc text-overflow">{item.name}</div>
                    </li>
                  )
              )
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  unitList: global.unitList,
  purchaseUnit: global.purchaseUnit,
}))(withRouter(UserInfo));
