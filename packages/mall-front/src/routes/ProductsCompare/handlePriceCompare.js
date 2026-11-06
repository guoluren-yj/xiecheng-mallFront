import qs from 'qs';

import { getUserConfigInfo } from 'utils/utils';
import { addNewCareParams, validAddress } from 'utils/addNewCart';
import { getUserCustomDimension, getOpenCartFlag } from 'utils/configUtils';
import { fetchAddPriceCompare } from 'services/productListService';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';

async function handlePriceCompare({
  list,
  primaryProduct,
  callback,
  dimensTemplates,
  currentAddress = {},
  addressRef,
}) {
  const {
    isNewCart,
    userId,
    organizationId,
    regionId,
    companyId,
    unitId,
    invoiceOrgId,
    purchaseOrgId,
    levelPath,
  } = getUserConfigInfo();
  const customDimensionMap = getUserCustomDimension();
  const productCompare = {
    userId,
    regionId: currentAddress.regionId || regionId,
    addressId: currentAddress.addressId,
    unitId,
    companyId,
    levelPath,
    ...primaryProduct,
    tenantId: organizationId,
    productCompareAssignList: list.map((n) => {
      const { deliveryCycle, ...other } = n;
      return other;
    }),
  };
  const params = {
    productCompare, // 比价单参数
    shoppingCart: {}, // 老加入购物车参数
    cart: {}, // 新加入购物车参数
    isNewCartFlag: !!isNewCart, // 是否新购物车 true是 false否
    customDimensionMap,
  };
  const addressFlag = validAddress({ currentAddress, addressRef, product: primaryProduct });
  if (!addressFlag) return;
  if (isNewCart) {
    const paramsdata = addNewCareParams({
      product: primaryProduct,
      dimensTemplates,
      currentAddress,
      supplierCompanyId: primaryProduct?.supplierCompanyId,
      tmpQuantity: 1,
      cartSource: 'COMPARE',
      openCartFlag: getOpenCartFlag() ? 1 : 0,
    });
    if (!paramsdata) return;
    params.cart = paramsdata;
  } else {
    params.shoppingCart = {
      tenantId: organizationId,
      addressId: currentAddress?.addressId,
      unitId,
      companyId,
      levelPath,
      skuType: 0,
      quantity: 1,
      organizationId,
      ownerId: userId,
      invOrganizationId: currentAddress?.invOrganizationId || invoiceOrgId,
      purOrganizationId: purchaseOrgId,
      productId: primaryProduct.productId,
      productSource: primaryProduct.sourceFrom,
      unitPrice: primaryProduct.price,
      latestPrice: primaryProduct.price,
      purchaseType: 'COMPANY',
      cartSource: 'COMPARE',
      openCartFlag: getOpenCartFlag() ? 1 : 0,
    };
  }
  delete params.deliveryCycle;
  await fetchAddPriceCompare(params);
  const query = {
    productId: primaryProduct.productId,
    regionId: currentAddress.regionId || regionId,
    addressId: currentAddress.addressId,
    levelPath,
  };
  if (callback) {
    callback(query);
  } else {
    getDvaApp()._history.push(`/price-compare?${qs.stringify(query)}`);
  }
}

export default handlePriceCompare;
