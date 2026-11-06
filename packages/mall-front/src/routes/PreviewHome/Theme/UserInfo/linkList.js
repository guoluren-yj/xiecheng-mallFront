/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import intl from 'utils/intl';
import { addPurchaseApply, saleRecord, myComments } from 'components/Permission/permissionCode';
import { getUserConfigInfo } from '@/utils/utils';

export default function getLinkList({ hideMenuList, isMixTenant }) {
  const {
    webConfig: { colorCode },
  } = getUserConfigInfo();
  return [
    {
      icon: require(`./Imgs/${colorCode}/2.svg`),
      name: intl.get(`mallf.home.view.myOrder`).d('我的订单'),
      path: '/my-mall/my-order',
      visible: true,
    },
    {
      icon: require(`./Imgs/${colorCode}/4.svg`),
      name: intl.get(`mallf.home.view.myRequest`).d('我的申请'),
      path: '/my-mall/my-request',
      visible: isMixTenant === false,
      permissionList: [addPurchaseApply],
    },
    {
      icon: require(`./Imgs/${colorCode}/5.svg`),
      name: intl.get(`mallf.home.view.myFavorite`).d('我的收藏'),
      path: '/my-mall/my-favorite',
      visible: true,
    },
    {
      icon: require(`./Imgs/${colorCode}/3.svg`),
      name: intl.get(`mallf.home.view.myComment`).d('我的评价'),
      path: '/my-mall/my-comments',
      visible: hideMenuList && !hideMenuList.includes('MY_EVALUATION'),
      permissionList: [myComments],
    },
    {
      icon: require(`./Imgs/${colorCode}/6.svg`),
      name: intl.get(`mallf.home.view.mySaleRecord`).d('我的售后'),
      path: '/my-mall/sale-record',
      visible: hideMenuList && !hideMenuList.includes('AFTERSALE_INFORMATION'),
      permissionList: [saleRecord],
    },
    {
      icon: require(`./Imgs/${colorCode}/1.svg`),
      name: intl.get(`mallf.home.view.receiveAddress`).d('收货地址'),
      path: '/my-mall/address-list',
      visible: true,
    },
  ];
}
