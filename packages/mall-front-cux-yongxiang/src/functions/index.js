import React from 'react';
import qs from 'querystring';
import { Tooltip } from 'choerodon-ui';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import { openComfirmModal } from 'utils/modals';

export function cuxClassName({ item }) {
  if (item.attrName === '规格型号' || item.attrCode === '000000000002') {
    return 'des-row-attr-cux';
  }
  return '';
}

export function productSkuAttr({ productSkuAttrDTOS }) {
  const guige = productSkuAttrDTOS.find((n) => n.attrName === '规格型号') || {};
  const caizhi = productSkuAttrDTOS.find((n) => n.attrCode === '000000000002') || {};
  const newSkuAttrDTOS = productSkuAttrDTOS.filter(
    (n) => !(n.attrName === '规格型号' || n.attrCode === '000000000002')
  );
  newSkuAttrDTOS.unshift(guige, caizhi);
  return newSkuAttrDTOS;
}

export function cuxDeliveryDate({ item }) {
  return (
    <Tooltip
      placement="bottom"
      title={`${intl.get('mallf.myOrder.view.subOrderLine.deliveryDate').d('交期')}：${
        item.orderEntryVOS?.[0]?.deliveryDate
      }`}
    >
      <p r-if={item.orderEntryVOS?.[0]?.deliveryDate}>
        {intl.get('mallf.myOrder.view.subOrderLine.deliveryDate').d('交期')}：
        {item.orderEntryVOS?.[0]?.deliveryDate}
      </p>
    </Tooltip>
  );
}

export function setAddress({
  itemCode,
  currentAddress = {},
  addressRef,
  companyId,
  userId,
  setCurrentAddress = (e) => e,
}) {
  if (itemCode && currentAddress.belongType === 2) {
    setCurrentAddress({});
  }
  addressRef.current.dataSet.current.set('lovPara', {
    companyId,
    userId,
    belongType: itemCode ? 1 : 2,
  });
}

// 先清空预采的收单地址
export function beforeClearInvoice({ setAddress: setAcAddressList, setOrderData }) {
  setAcAddressList([]);
  setOrderData((OrderData) => {
    return OrderData.map((p) => ({ ...p, invoiceAddressId: null, fullInvoiceAddress: null }));
  });
}

export function getECInvoiceParams({ order }) {
  const { itemId, itemCode } = order?.shoppingCartDTOList[0] || {};
  return qs.stringify({
    addressType: 'INVOICE',
    enabledFlag: 1,
    companyId: order?.proxySupplierCompanyId || order?.companyId,
    isFlag: order?.proxySupplierCompanyId ? 1 : 0,
    belongType: itemId && itemCode ? 1 : 2,
  });
}

export async function submitValid({ params, setSubmitLoading, setOrderData }) {
  setSubmitLoading(true);
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/OOeQfvYHjn8Izibe4D1gT8ysziaA3LP87LXD6JcgAqFXs`;
  try {
    const res = await request(url, {
      method: 'POST',
      body: JSON.stringify(params),
    });
    const errFlag = res.some((n) => n.orderInfo?.flag === '1');
    if (errFlag) {
      // 标准else里面有个setOrderData
      setTimeout(() => {
        setOrderData((data) => {
          return data.map((m, index) => {
            const { message } = res[index]?.orderInfo || {};
            return {
              ...m,
              message,
            };
          });
        });
      }, 500);
    }
    setSubmitLoading(false);
    return !errFlag;
  } catch {
    setSubmitLoading(false);
    return false;
  }
}

export function itemConfirm({ res, successCallback }) {
  const { cartList = [] } = res || {};
  const itemCodeList = [];
  cartList.reduce((pre, curr) => {
    const { itemCode } = curr;
    if (itemCode) {
      if (!pre.includes(itemCode)) {
        pre.push(itemCode);
      } else {
        itemCodeList.push(`【${itemCode}】`);
      }
    }
    return pre;
  }, []);
  if (itemCodeList.length > 0) {
    const list = [...new Set(itemCodeList)];
    openComfirmModal({
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      children: intl
        .get('mcux.common.view.itemCode.confirm', {
          value: list.join(','),
        })
        .d(`物料编码${list.join(',')}同时存在多个商品`),
      onOk: () => {
        successCallback(res);
      },
    });
  } else {
    successCallback(res);
  }
}
