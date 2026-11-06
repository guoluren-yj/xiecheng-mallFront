import { getStorage } from './utils';
/**
 * 获取选买配置信息
 */
export default function userConfigInfo() {
  const store = window.dvaApp._store;
  const { userInfo, userConfig, defaultAddress: defaultAddressDetail } = store.getState().global;

  // 获取地址信息
  const { first, second, third, fourth } = getStorage(`${userInfo.id}_region`) || {};
  const { shengId, shengName, sheng } = first || {};
  const { shiId, shiName, shi, isNAFlag } = second || {};
  const { xianId, xianName, xian } = third || {};
  const { xiangzhenName } = fourth || {};
  const defaultCodeList = defaultAddressDetail?.regionCodeList || [];
  const defaultIdList = defaultAddressDetail?.regionIdList || [];
  const defaultAddress = defaultAddressDetail?.regionNameList || [];
  const firstRegionId = sheng || defaultIdList?.[0];
  const secondRegionId = shi || defaultIdList?.[1];
  const thirdRegionId = xian || defaultIdList?.[2];
  const regionId = (!shi && isNAFlag ? sheng : shi) || secondRegionId; // 为了处理海外N/A为2级但id可能不存在 故左上角选的NA使用1级地址的id，默认地址还是使用list中的2级
  let address = shengName + shiName + xianName;
  if (xiangzhenName) address += xiangzhenName;
  const addressInfo = {
    address: second ? address : defaultAddress.join(''),
    provinceId: shengId || defaultCodeList[0],
    cityId: shiId || defaultCodeList[1],
    countyId: xianId || defaultCodeList[2],
  };
  return {
    ...store.getState().global,
    userId: userInfo.id,
    userName: userInfo.realName,
    organizationId: userInfo.organizationId,
    realName: userInfo.realName,
    loginName: userInfo.loginName,
    tenantId: userInfo.tenantId,
    purchaseOrgName: userConfig.purchaseOrgName,
    purchaseOrgId: userConfig.purchaseOrgId,
    ouName: userConfig.ouName,
    ouId: userConfig.ouId,
    invoiceOrgName: userConfig.invoiceOrgName,
    invoiceOrgId: userConfig.invoiceOrgId,
    companyName: userConfig.companyName,
    companyId: userConfig.companyId,
    purchaseType: userConfig.purchaseType || 'COMPANY',
    levelPath: userConfig.levelPath,
    unitId: userConfig.unitId,
    unitName: userConfig.unitName,
    unitCode: userConfig.unitCode,
    firstRegionId,
    secondRegionId,
    thirdRegionId,
    addressInfo,
    regionId,
  };
}
