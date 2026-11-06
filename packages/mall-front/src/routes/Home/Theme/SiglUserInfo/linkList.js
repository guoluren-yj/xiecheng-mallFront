/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import intl from 'utils/intl';

// import SVG_A from '@/assets/images/home/icon_order.svg';
// import SVG_B from '@/assets/images/home/icon_application.svg';
// import SVG_C from '@/assets/images/home/icon_collection.svg';
// import SVG_D from '@/assets/images/home/icon_comments.svg';
// import SVG_E from '@/assets/images/home/icon_after_sales.svg';
// import SVG_F from '@/assets/images/home/icon_address.svg';
import { getUserConfigInfo } from '@/utils/utils';

export default function getLinkList() {
  const {
    webConfig: { colorCode },
    hideMenuList,
  } = getUserConfigInfo();
  return [
    {
      icon: require(`./siglImgs/${colorCode}/2.png`),
      name: intl.get(`mallf.common.view.myOrder`).d('我的订单'),
      path: '/sigl/my-mall/my-order',
      visible: true,
    },
    {
      icon: require(`./siglImgs/${colorCode}/5.png`),
      name: intl.get(`mallf.common.view.myFavorite`).d('我的收藏'),
      path: '/sigl/my-mall/my-favorite',
      visible: true,
    },
    {
      icon: require(`./siglImgs/${colorCode}/3.png`),
      name: intl.get(`mallf.common.view.myComment`).d('我的评价'),
      path: '/sigl/my-mall/my-comments',
      visible: hideMenuList && !hideMenuList.includes('MY_EVALUATION'),
    },
    {
      icon: require(`./siglImgs/${colorCode}/6.png`),
      name: intl.get(`mallf.common.view.mySaleRecord`).d('我的售后'),
      path: '/sigl/my-mall/sale-record',
      visible: true,
    },
    {
      icon: require(`./siglImgs/${colorCode}/1.png`),
      name: intl.get(`mallf.common.view.receiveAddress`).d('收货地址'),
      path: '/sigl/my-mall/address-list',
      visible: true,
    },
  ];
}
