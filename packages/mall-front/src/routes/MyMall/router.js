import { lazy } from 'react';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import { getOpenCartFlag } from 'utils/configUtils';
import cuxComponent from 'cuxTools/cuxComponent';
import {
  addPurchaseApply,
  myInvoice,
  shoppingBasket,
  userCenter,
  saleRecord,
  myComments,
} from 'components/Permission/permissionCode';
import useOmsFlag from '@/hooks/useOmsFlag';

function getMallRouter() {
  const {
    hideMenuList,
    // pickSupplierFlag,
    // centralizedFlag,
    // orderFlag,
    isMixTenant,
  } = getUserConfigInfo();
  const isOmsFlag = useOmsFlag();
  const router = {
    myMall: {
      name: intl.get(`mallf.myMall.view.myMall`).d('我的商城'),
      children: [
        {
          name: intl.get(`mallf.myMall.view.myOrder`).d('我的订单'),
          path: '/my-order',
          component: lazy(() => import(/* webpackChunkName: 'myMall/OMSOrder' */ './OMSOrder')),
          visible: true,
          icon: 'assignment',
          searchType: 'SMART_MY_ORDER',
        },
        // 不展示 心愿单/我的拼单/拼单列表 入口
        {
          name: intl.get(`mallf.common.view.myWishList`).d('我的心愿单'),
          path: '/my-wishList',
          component: lazy(() => import(/* webpackChunkName: 'myMall/MyWishList' */ './MyWishList')),
          // visible: !!pickSupplierFlag,
          icon: 'favorite',
        },
        {
          name: intl.get(`mallf.common.view.myRequest`).d('我的申请'),
          path: '/my-request',
          permissionList: [addPurchaseApply],
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/PurchaseRequest' */ './PurchaseRequest')
          ),
          visible: !getOpenCartFlag() && isMixTenant === false,
          icon: 'library_books',
          searchType: 'SMART_MY_APPLICATION',
        },
        {
          name: intl.get(`mallf.common.view.myRequest`).d('我的申请'),
          path: '/my-request',
          permissionList: [addPurchaseApply],
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/PurchaseRequest' */ './OpenCartMyRequest')
          ),
          visible: !!getOpenCartFlag(),
          icon: 'library_books',
          searchType: 'SMART_MY_APPLICATION',
        },
        {
          name: intl.get(`mallf.myMall.view.mySaleRecord`).d('我的售后'),
          path: '/sale-record',
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/MySaleRecord' */ './MySaleRecord')
          ),
          permissionList: [saleRecord],
          visible: true,
          icon: 'headset_mic',
          searchType: 'AFTERSALE_INFORMATION',
        },
        {
          name: intl.get(`mallf.myMall.view.myInvoice`).d('我的发票'),
          path: '/my-invoice',
          component: lazy(() => import(/* webpackChunkName: 'myMall/MyInvoice' */ './MyInvoice')),
          permissionList: [myInvoice],
          visible: !isOmsFlag,
          icon: 'receipt',
          searchType: 'MY_INVOICE',
        },
        {
          name: intl.get(`mallf.myMall.view.myInvoice`).d('我的发票'),
          path: '/my-invoice-list',
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/MyInvoice' */ './MyInvoiceList')
          ),
          permissionList: [myInvoice],
          visible: isOmsFlag,
          icon: 'receipt',
          searchType: 'MY_INVOICE',
        },
        {
          name: intl.get(`mallf.myMall.view.myFavorite`).d('我的收藏'),
          path: '/my-favorite',
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/MyFavorite' */ './MyFavoriteList')
          ),
          visible: true,
          icon: 'star',
          searchType: 'SMART_MY_COLLECT',
        },
        {
          name: intl.get(`mallf.myMall.view.viewHistory`).d('浏览记录'),
          path: '/view-history',
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/ViewHistory' */ './ViewHistory')
          ),
          visible: true,
          icon: 'pets',
          searchType: 'BROWSE_RECORDS',
        },
        {
          name: intl.get(`mallf.myMall.view.myComment`).d('我的评价'),
          path: '/my-comments',
          component: lazy(() => import(/* webpackChunkName: 'myMall/MyComments' */ './MyComments')),
          permissionList: [myComments],
          visible: hideMenuList && !hideMenuList.includes('MY_EVALUATION'),
          icon: 'textsms',
          searchType: 'MY_EVALUATION',
        },
        {
          name: intl.get(`mallf.myMall.view.buyPackage`).d('采购套餐'),
          path: '/shopping-basket',
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/ShoppingBasket' */ './ShoppingBasket')
          ),
          visible: hideMenuList && !hideMenuList.includes('SMART_SHOPPING_BASKET'),
          permissionList: [shoppingBasket],
          icon: 'shopping_basket',
          searchType: 'SMART_SHOPPING_BASKET',
        },
      ].filter((p) => p.visible),
    },
    account: {
      name: intl.get(`mallf.myMall.view.accountConfig`).d('账户设置'),
      children: [
        {
          name: intl.get(`mallf.myMall.view.userCenter`).d('个人中心'),
          path: '/user-center',
          component: lazy(() => import(/* webpackChunkName: 'myMall/UserCenter' */ './UserCenter')),
          visible: hideMenuList && !hideMenuList.includes('SMART_PERSONAL_CENTER'),
          permissionList: [userCenter],
          icon: 'person',
        },
        {
          name: intl.get(`mallf.myMall.view.receiveAddress.manage`).d('地址管理'),
          path: '/address-list',
          component: lazy(() =>
            import(/* webpackChunkName: 'myMall/AddressManage' */ './AddressManage')
          ),
          visible: true,
          icon: 'room',
        },
      ].filter((p) => p.visible),
    },
  };
  return router;
}

export default cuxComponent({ path: 'MyMall/router', isFn: true })(getMallRouter);
