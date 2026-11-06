/* eslint-disable no-param-reassign */
import React from 'react';
import { Input, Icon as C7nIcon, Tooltip } from 'choerodon-ui';

import { getPrimaryColor } from 'utils/utils';
import intl from 'utils/intl';

export default function Remark({
  remarkConfig,
  product,
  visible,
  remark,
  remarkChange,
  currentProduct,
  setCurrentPrduct,
  productIndex,
  editRemark,
  order,
  setOrderData,
  orderIndex,
}) {
  return (
    <>
      {remarkConfig.visible !== 0 && (
        <p className="goods-remark">
          {remarkConfig.required === 1 && <span className="goods-remark-required">*</span>}
          <span className="goods-remark-label">
            {remarkConfig.fieldName ||
              intl.get('mallf.companyOrder.view.remark.info').d('备注信息')}
            ：
          </span>
          <span title={product.remark}>
            {visible ? (
              <Input
                style={{ height: 28 }}
                value={remark}
                onChange={(e) => remarkChange(e)}
                onBlur={() => {
                  setCurrentPrduct({ ...currentProduct, remarkVisible: false });
                  editRemark();
                }}
              />
            ) : product.remark?.length > 10 ? (
              `${product.remark.substring(0, 10)}...`
            ) : (
              product.remark
            )}
          </span>
          {remarkConfig.editable !== 0 && (
            <C7nIcon
              className="detail-info-update"
              type={visible ? '' : 'mode_edit'}
              onClick={() => {
                setCurrentPrduct({ ...product, productIndex, remarkVisible: true });
              }}
            />
          )}
          {order.shoppingCartDTOList?.length > 1 && !visible && (
            <Tooltip
              title={intl
                .get('mallf.companyOrder.view.neededDate.info')
                .d('可同步至该采购申请下的所有商品行')}
            >
              <C7nIcon
                onClick={() => {
                  setOrderData((data) => {
                    const newData = [...data];
                    newData[orderIndex].shoppingCartDTOList.forEach((p) => {
                      p.remark = product.remark;
                      p.productErrorFlag = false;
                      p.DS.set('remark', product.remark);
                    });
                    return newData;
                  });
                }}
                style={{ marginLeft: 12, color: getPrimaryColor() }}
                type="sync"
              />
            </Tooltip>
          )}
        </p>
      )}
    </>
  );
}
