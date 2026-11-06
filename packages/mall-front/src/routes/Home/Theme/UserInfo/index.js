import React, { useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import { Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { PermissionWrapper } from 'components/Permission';
import Image from 'components/Image';
import { getUserConfigInfo } from 'utils/utils';
import Icons from 'components/Icons';
import Link from 'components/Link';
import intl from 'utils/intl';
import { fetchOrderStatusCount, fetchOmsOrderStatusCount } from 'services/orderCenterService';
import defaultImg from '@/assets/images/default/touxiang.png';
import styles from './index.less';
import useOmsFlag from '@/hooks/useOmsFlag';
import getLinkList from '../linkList';
import ChooseUnit from './ChooseUnit';

function UserInfo(props) {
  const { hideMenuList, gonggaoData, isMixTenant } = props;
  const isOMS = useOmsFlag();

  const gonggaoList = useMemo(() => {
    return gonggaoData?.content || [];
  }, [gonggaoData]);

  const {
    userInfo: { currentRoleName = '', realName = '', imageUrl },
    unReadCount,
  } = getUserConfigInfo();

  useEffect(() => {
    if (isOMS !== undefined) {
      fetchUnreadCount(isOMS);
    }
  }, [isOMS]);

  useEffect(() => {
    const notice = document.querySelector('.scroll-notice');
    const noticeSecond = document.querySelector('.scroll-notice-second');
    const times = Math.ceil(gonggaoList.length / 2);
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
    if (isOMS) {
      fetchOmsOrderStatusCount().then((res) => {
        changeCount(res);
      });
    } else {
      fetchOrderStatusCount().then((res) => {
        changeCount(res);
      });
    }
  }

  const linkList = getLinkList({ hideMenuList, isMixTenant });

  return (
    <>
      <div
        className={styles['top-box']}
        style={{
          marginBottom: isEmpty(gonggaoList) ? 10 : 0,
          height: isEmpty(gonggaoList) ? 122 : 107,
        }}
      >
        <div className={styles['top-user']}>
          <div className={styles['top-user-touxiang']}>
            <Image width={35} height={35} value={imageUrl || defaultImg} />
          </div>
          <div
            className={styles['top-user-userName']}
            onClick={() => {
              props.history.push('/my-mall/user-center');
            }}
          >
            <p>
              Hi！ <span>{`${realName}`}</span>
              <Icons size={12} type="right" />
            </p>
            <div className="currentRoleName text-overflow" title={currentRoleName}>
              {currentRoleName}
            </div>
          </div>
        </div>
        <ChooseUnit />
      </div>
      <div
        className={styles['bottom-box']}
        style={{
          height: isEmpty(gonggaoList) ? 270 : 293,
          paddingTop: 0,
        }}
      >
        <div className="order-info">
          <Link to="/my-mall/my-order">
            <div className="order-num">
              <div id="home-theme-order-info-allOrder" className="num">
                0
              </div>
              <div
                className="desc text-overflow"
                title={intl.get('mallf.home.view.order.allOrders').d('全部订单')}
              >
                {intl.get('mallf.home.view.order.allOrders').d('全部订单')}
              </div>
            </div>
          </Link>
          <Link to="/my-mall/my-order?displayStatus=WAITING_SENT">
            <div className="order-num">
              <div id="home-theme-order-info-waitSent" className="num">
                0
              </div>
              <div
                className="desc text-overflow"
                title={intl.get('mallf.home.view.order.willdeliver').d('待发货')}
              >
                {intl.get('mallf.home.view.order.willdeliver').d('待发货')}
              </div>
            </div>
          </Link>
          <Link to="/my-mall/my-order?displayStatus=WAITING_RECEIVE">
            <div className="order-num">
              <div id="home-theme-order-info-waitReceive" className="num">
                0
              </div>
              <div
                className="desc text-overflow"
                title={intl.get('mallf.home.view.order.pendingReceipt').d('待收货')}
              >
                {intl.get('mallf.home.view.order.pendingReceipt').d('待收货')}
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
                  to="/bulletin-boards"
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
                    to={`/bulletin-boards?bulletinId=${item.bulletinId}`}
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
                    to={`/bulletin-boards?bulletinId=${gonggaoList[0].bulletinId}`}
                    className="gonghgao-info-item text-overflow"
                    title={gonggaoList[0].bulletinTitle}
                  >
                    <Icon type="volume_up" />
                    {gonggaoList[0].bulletinTitle}
                  </Link>
                  <Link
                    to={`/bulletin-boards?bulletinId=${gonggaoList[1].bulletinId}`}
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
              <div
                style={{
                  textAlign: 'center',
                  color: '#666666',
                  marginTop: 15,
                  wordBreak: 'break-word',
                }}
              >
                {intl.get('mallf.common.view.no.quicklink').d('暂无快速链接')}
              </div>
            ) : (
              linkList.map(
                (item, index) =>
                  item.visible && (
                    <PermissionWrapper permissionList={item.permissionList}>
                      <li
                        onClick={() => {
                          props.history.push(item.path);
                        }}
                        title={item.name}
                        style={{
                          paddingTop: index > 2 ? 0 : 15,
                        }}
                      >
                        <div style={{ width: 24, height: 25, margin: '0 auto 5px' }}>
                          <img style={{ width: '100%', height: '100%' }} src={item.icon} alt="" />
                        </div>
                        <div className="desc text-overflow">{item.name}</div>
                      </li>
                    </PermissionWrapper>
                  )
              )
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default connect(({ global }) => ({
  hideMenuList: global.hideMenuList,
  isMixTenant: global.isMixTenant,
}))(withRouter(UserInfo));
