/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { addPurchaseApply, saleRecord, myComments } from 'components/Permission/permissionCode';
import { getUserConfigInfo } from '@/utils/utils';

const getList = (sortData) => {
  if (sortData?.quickLinkFlag) {
    // 配置过
    return sortData?.productQuickLinkConfigList;
  } else {
    // 没配置过
    return sortData?.quickLinkList
      ?.filter((p) => p.tag !== '-1')
      ?.map((p) => {
        return {
          ...p,
          searchType: p.value,
        };
      });
  }
};

export default function getLinkList({ isMixTenant }) {
  const {
    webConfig: { colorCode },
    mallType,
    productSearchTypeConfig = {},
  } = getUserConfigInfo();

  const imgMapping = {
    SMART_MY_ORDER: {
      imgCode: 2,
      path: `${mallType === 'sigl' ? '/sigl' : ''}/my-mall/my-order`,
      visible: true,
    }, // "我的订单"
    SMART_MY_APPLICATION: {
      imgCode: 4,
      path: `${mallType === 'sigl' ? '/sigl' : ''}/my-mall/my-request`,
      visible: isMixTenant === false && mallType !== 'sigl',
      permissionList: [addPurchaseApply],
    }, // "我的申请"
    SMART_MY_COLLECT: {
      imgCode: 5,
      path: `${mallType === 'sigl' ? '/sigl' : ''}/my-mall/my-favorite`,
      visible: true,
    }, // 我的收藏
    AFTERSALE_INFORMATION: {
      imgCode: 6,
      path: `${mallType === 'sigl' ? '/sigl' : ''}/my-mall/sale-record`,
      visible: true,
      permissionList: [saleRecord],
    }, // 我的售后
    ADDRESS_MANAGE: {
      imgCode: 1,
      path: `${mallType === 'sigl' ? '/sigl' : ''}/my-mall/address-list`,
      visible: true,
    }, // 地址管理
    MY_EVALUATION: {
      imgCode: 3,
      path: `${mallType === 'sigl' ? '/sigl' : ''}/my-mall/my-comments`,
      visible: true,
      permissionList: [myComments],
    }, // 我的评价
  };
  const { quickLinkList = [] } = productSearchTypeConfig;

  const allList = getList(productSearchTypeConfig);

  function getValueMeaning(value) {
    return quickLinkList?.find((p) => p.value === value)?.meaning;
  }
  return allList
    ?.map((p) => {
      const current = imgMapping[p.searchType];
      if (!current || !current?.visible) return null;
      return {
        ...(current || {}),
        icon: require(`${
          mallType === 'sigl'
            ? `./SiglUserInfo/siglImgs/${colorCode}/${current.imgCode}.png`
            : `./UserInfo/Imgs/${colorCode}/${current.imgCode}.svg`
        }`),
        name: getValueMeaning(p.searchType),
      };
    })
    .filter((p) => !!p);
}
