import React, { useEffect, useMemo } from 'react';
import { connect } from 'dva';
import { withRouter } from 'react-router-dom';
import classnames from 'classnames';
import { isEmpty } from 'lodash';
import { Icon } from 'choerodon-ui/pro';

import Image from 'components/Image';
import { getUserConfigInfo } from 'utils/utils';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import defaultImg from '@/assets/images/default/touxiang.png';
import styles from './index.less';
import getLinkList from '@/routes/Home/Theme/linkList';
import { fetchOmsOrderStatusCount } from './api';

function UserInfo(props) {
  const {
    userInfo: { currentRoleName = '', realName = '', imageUrl },
    isMixTenant,
    hideMenuList,
    webConfig: { colorCode },
  } = getUserConfigInfo();

  const { gonggaoData } = props;

  const gonggaoList = useMemo(() => {
    return gonggaoData?.content || [];
  }, [gonggaoData]);

  useEffect(() => {
    fetchUnreadCount();
  }, []);

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
        className={classnames(['top-box', `top-box-${colorCode}`])}
        style={{ marginBottom: isEmpty(gonggaoList) ? 10 : 0 }}
      >
        <div className="top-user">
          <div className={styles['top-user-touxiang']}>
            <Image width={35} height={35} value={imageUrl || defaultImg} />
          </div>
          <div className={styles['top-user-userName']}>
            <p>
              Hi！ <span>{`${realName}`}</span>
              <Icons size={12} type="right" />
            </p>
            <div className="currentRoleName text-overflow" title={currentRoleName}>
              {intl.get('mallf.common.view.integral').d('会员')}
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
          <a>
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
          </a>
          <a>
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
          </a>
          <a>
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
          </a>
        </div>
        {!isEmpty(gonggaoList) && (
          <div className="gonghgao-info">
            <p className="gonghgao-info-title">
              <span style={{ color: '#191919', fontWeight: 600 }}>
                {intl.get('mallf.home.view.gonggao').d('公告')}
              </span>
              {gonggaoData?.totalElements > 2 && (
                <span style={{ float: 'right', color: '#999999', cursor: 'pointer' }}>
                  {intl.get('hzero.common.button.more').d('更多')}
                  <Icon type="navigate_next" style={{ marginTop: -3 }} />
                </span>
              )}
            </p>
            <div className="gonghgao-info-content">
              {!isEmpty(gonggaoList?.[0]) && (
                <p
                  title={gonggaoList?.[0]?.bulletinTitle}
                  className="gonghgao-info-item text-overflow"
                  style={{ margin: '5px 0' }}
                >
                  <Icon type="volume_up" />
                  {gonggaoList?.[0]?.bulletinTitle}
                </p>
              )}
              {!isEmpty(gonggaoList?.[1]) && (
                <p
                  title={gonggaoList?.[1]?.bulletinTitle}
                  className="gonghgao-info-item text-overflow"
                >
                  <Icon type="volume_up" />
                  {gonggaoList?.[1]?.bulletinTitle}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="link-info">
          <ul>
            {linkList.map(
              (item) =>
                item.visible && (
                  <li title={item.name}>
                    <div style={{ width: 24, height: 25, margin: '6px auto' }}>
                      <img style={{ width: '100%', height: '100%' }} src={item.icon} alt="" />
                    </div>
                    <div className="desc text-overflow">{item.name}</div>
                  </li>
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
