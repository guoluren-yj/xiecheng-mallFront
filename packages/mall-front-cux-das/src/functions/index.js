import React from 'react';
import { openComfirmModal } from 'utils/modals';
import intl from 'utils/intl';
import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';

export function cuxConfirmModal({ res }) {
  const { cartList } = res;
  const flag = cartList.some((n) => n.assessmentFlag === 0);
  if (flag) {
    openComfirmModal({
      title: intl.get(`mallf.common.view.tips`).d('温馨提示'),
      okText: intl.get('mcux.common.view.das.goAssessment').d('去评价'),
      children: intl
        .get('mcux.common.view.das.cuxAssessmentConfirm')
        .d(
          '您好，您有已完成订单未评价，请点击至“订单-采购订单-评价”完成评价后再下单，请如实客观评价，感谢您的支持与反馈！'
        ),
      onOk: () => {
        window.location.replace('/my-mall/my-order');
      },
    });
  }
}

export function initHome() {
  request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/tJhEoELpB6zCjMK3AocHEeF2rmhkkHWtMBmhX4bMdYribXo3lv4L01D0eAe2xTUcA`,
    {
      method: 'POST',
    }
  ).then((res) => {
    if (res) {
      openComfirmModal({
        title: intl.get(`mallf.common.view.tips`).d('温馨提示'),
        okText: intl.get('mcux.common.view.das.goAssessment1').d('跳转至我的订单'),
        children: (
          <>
            <div>
              {intl
                .get('mcux.common.view.das.cuxAssessmentConfirm1')
                .d('您有未完成评价的订单，请先完成评价！订单号如下：')}
            </div>
            <div>【{res?.map((r) => r.orderCode)?.join('】【')}】</div>
            <div>(注：仅显示五条订单更多可在我的订单进行查看)</div>
          </>
        ),
        onOk: () => {
          window.location.replace('/my-mall/my-order');
        },
      });
    }
  });
}

export function setNewProductData({ setProductData }) {
  setProductData((data) => ({ ...data, productSaleQuantity: data.attributeVarchar10 }));
}

export function setListNewProduct({ newProduct }) {
  return {
    ...newProduct,
    quantity: newProduct?.attributeVarchar10,
  };
}

export function showSales({ product }) {
  const saleQuality = product?.attributeVarchar10;
  return (
    <span
      className="buy-quality text-overflow"
      title={`${intl.get(`mallf.common.view.productList.salesVolume`).d('销量')}:${
        saleQuality > 10000
          ? intl
              .get('mallf.common.view.saleQuality.w', {
                value:
                  math.floor(saleQuality / 10000) > 999 ? 999 : math.floor(saleQuality / 10000),
              })
              .d(
                `${
                  math.floor(saleQuality / 10000) > 999 ? 999 : math.floor(saleQuality / 10000)
                }万+`
              )
          : math.round(saleQuality || 0)
      }`}
    >
      {intl.get(`mallf.common.view.productList.salesVolume`).d('销量')}:{' '}
      <b>
        {saleQuality > 10000
          ? intl
              .get('mallf.common.view.saleQuality.w', {
                value:
                  math.floor(saleQuality / 10000) > 999 ? 999 : math.floor(saleQuality / 10000),
              })
              .d(
                `${
                  math.floor(saleQuality / 10000) > 999 ? 999 : math.floor(saleQuality / 10000)
                }万+`
              )
          : math.round(saleQuality || 0)}
      </b>
    </span>
  );
}
