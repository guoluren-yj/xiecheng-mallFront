import { lazy } from 'react';

import { addPurchaseApply, myInvoice, userCenter } from 'components/Permission/permissionCode';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

export default function getMallRouter() {
  const { isMixTenant, hideMenuList } = getUserConfigInfo(); // enablePointMenu, pointName
  const router = {
    myMall: {
      name: intl.get(`mallf.common.view.myMall`).d('我的商城'),
      children: [
        {
          name: intl.get(`mallf.common.view.myOrder`).d('我的订单'),
          path: '/my-order',
          component: lazy(() => import('mall-front/lib/routes/MyMall/OMSOrder')),
          visible: true,
          icon: 'assignment',
        },
        {
          name: intl.get(`mallf.common.view.myRequest`).d('我的申请'),
          path: '/my-request',
          component: lazy(() => import('mall-front/lib/routes/MyMall/PurchaseRequest')),
          permissionList: [addPurchaseApply],
          visible: isMixTenant === false,
          icon: 'library_books',
        },
        {
          name: intl.get(`mallf.common.view.mySaleRecord`).d('我的售后'),
          path: '/sale-record',
          component: lazy(() => import('mall-front/lib/routes/MyMall/MySaleRecord')),
          visible: hideMenuList && !hideMenuList.includes('AFTERSALE_INFORMATION'),
          icon: 'headset_mic',
        },
        {
          name: intl.get(`mallf.common.view.myInvoice`).d('我的发票'),
          path: '/my-invoice',
          component: lazy(() => import('mall-front/lib/routes/MyMall/MyInvoice')),
          permissionList: [myInvoice],
          visible: true,
          icon: 'receipt',
        },
        {
          name: intl.get(`mallf.common.view.myFavorite`).d('我的收藏'),
          path: '/my-favorite',
          component: lazy(() => import('mall-front/lib/routes/MyMall/MyFavorite')),
          visible: true,
          icon: 'star',
        },
        {
          name: intl.get(`mallf.common.view.viewHistory`).d('浏览记录'),
          path: '/view-history',
          component: lazy(() => import('mall-front/lib/routes/MyMall/ViewHistory')),
          visible: true,
          icon: 'pets',
        },
        {
          name: intl.get(`mallf.common.view.myComment`).d('我的评价'),
          path: '/my-comments',
          component: lazy(() => import('mall-front/lib/routes/MyMall/MyComments')),
          visible: true,
          icon: 'textsms',
        },
        {
          name: intl.get(`mallf.common.view.buyPackage`).d('采购套餐'),
          path: '/shopping-basket',
          component: lazy(() => import('mall-front/lib/routes/MyMall/ShoppingBasket')),
          visible: hideMenuList && !hideMenuList.includes('SMART_SHOPPING_BASKET'),
          icon: 'shopping_basket',
        },
      ].filter((p) => p.visible),
    },
    account: {
      name: intl.get(`mallf.common.view.accountConfig`).d('账户设置'),
      children: [
        {
          name: intl.get(`mallf.common.view.userCenter`).d('个人中心'),
          path: '/user-center',
          component: lazy(() => import('mall-front/lib/routes/MyMall/UserCenter')),
          visible: hideMenuList && !hideMenuList.includes('SMART_PERSONAL_CENTER'),
          permissionList: [userCenter],
          icon: 'person',
        },
        // { // 二开取消地址
        //   name: intl.get(`mallf.common.view.receiveAddress.manage`).d('地址管理'),
        //   path: '/address-list',
        //   component: lazy(() => import('mall-front/lib/routes/MyMall/AddressManage')),
        //   visible: true,
        //   icon: 'room',
        // },
      ].filter((p) => p.visible),
    },
  };
  return router;
}
