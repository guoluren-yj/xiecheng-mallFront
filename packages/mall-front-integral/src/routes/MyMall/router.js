import { lazy } from 'react';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

export default function getMallRouter() {
  const { hideMenuList } = getUserConfigInfo();
  const router = {
    myMall: {
      name: intl.get(`mallf.common.view.myMall`).d('我的商城'),
      children: [
        {
          name: intl.get(`mallf.common.view.myOrder`).d('我的订单'),
          path: '/my-order',
          component: lazy(() => import('./OMSOrder')),
          visible: true,
          icon: 'assignment',
        },
        {
          name: intl.get(`mallf.common.view.title.mySigl`).d(`我的积分`),
          path: '/my-sigl',
          component: lazy(() => import('./MySigl')),
          visible: true,
          icon: 'donut_small',
        },
        {
          name: intl.get(`mallf.common.view.mySaleRecord`).d('我的售后'),
          path: '/sale-record',
          component: lazy(() => import('./MySaleRecord')),
          visible: true,
          icon: 'headset_mic',
        },
        {
          name: intl.get(`mallf.common.view.myFavorite`).d('我的收藏'),
          path: '/my-favorite',
          component: lazy(() => import('mall-front/lib/routes/MyMall/MyFavoriteList')),
          visible: true,
          icon: 'star',
        },
        {
          name: intl.get(`mallf.common.view.viewHistory`).d('浏览记录'),
          path: '/view-history',
          component: lazy(() => import('./ViewHistory')),
          visible: true,
          icon: 'pets',
        },
        {
          name: intl.get(`mallf.common.view.myComment`).d('我的评价'),
          path: '/my-comments',
          component: lazy(() => import('./MyComments')),
          visible: hideMenuList && !hideMenuList.includes('MY_EVALUATION'),
          icon: 'textsms',
        },
      ].filter((p) => p.visible),
    },
    account: {
      name: intl.get(`mallf.common.view.accountConfig`).d('账户设置'),
      children: [
        {
          name: intl.get(`mallf.common.view.userCenter`).d('个人中心'),
          path: '/user-center',
          component: lazy(() => import('./UserCenter')),
          visible: true,
          icon: 'person',
        },
        {
          name: intl.get(`mallf.common.view.receiveAddress.manage`).d('地址管理'),
          path: '/address-list',
          component: lazy(() => import('./AddressManage')),
          visible: true,
          icon: 'room',
        },
      ].filter((p) => p.visible),
    },
  };
  return router;
}
