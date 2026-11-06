import React from 'react';
import { Tooltip, Icon as C7nIcon } from 'choerodon-ui';
import { NumberField } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import { getToFixed } from 'utils/utils';
import { DEFAULT_MAX, SHOW_DEFAULT_MAX } from 'utils/constants';
import intl from 'utils/intl';

export default function CartCount(props) {
  const {
    item,
    renderStoreInfo,
    minLimit,
    maxLimit,
    handleProductComfirmInfo,
    setQualityChange,
    shelf,
    defaultValue,
    changeVal,
    setUpdate,
    update,
    qualityChange,
  } = props;
  const { uomPrecision } = item;
  return (
    <li className="cart-body-count">
      <div style={{ width: 90 }}>
        <NumberField
          id={`${item.cartId}-cart-input-number`}
          addonAfter={
            !!renderStoreInfo(item) ||
            minLimit > 1 ||
            item?.minPackageQuantity > 1 ||
            math.lt(maxLimit, SHOW_DEFAULT_MAX) ? (
              <Tooltip title={handleProductComfirmInfo()}>
                <C7nIcon type="error" style={{ color: '#FCA000' }} />
              </Tooltip>
            ) : null
          }
          min={minLimit}
          max={maxLimit}
          value={item.quantity}
          onChange={(v) => {
            // 总金额不能大于9个9
            if (!isNaN(v) && (v * item.latestPrice < DEFAULT_MAX || item.latestPrice === '***')) {
              setQualityChange(item.cartId);
              item.quantity = getToFixed(v, uomPrecision) || minLimit;
              setUpdate(!update);
            }
          }}
          disabled={
            (item.productSource === 'CATA' && item.stockQuantity <= 0) ||
            !shelf ||
            (item?.budgetSwitch === '1' && item?.budgetInfoList?.length > 1)
          }
          step={item.customFlag ? 1 : defaultValue}
          onBlur={() => {
            changeVal(item.quantity);
          }}
          precision={(item.customFlag !== 1 && uomPrecision) || 0}
          formatter={(value) => {
            if (!isNaN(+value) && String(value)?.endsWith('0')) {
              return +value;
            } else {
              return value;
            }
          }}
          readOnly={qualityChange && qualityChange !== item.cartId}
          onFocus={() => {
            document.getElementById(`${item.cartId}-cart-input-number`).select();
          }}
        />
      </div>
      {shelf && (
        <>
          <span style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: 10 }}>
            在途（T）：{item.attributeDecimal12 || '-'}
          </span>
          <span style={{ color: 'rgba(0, 0, 0, 0.65)', marginTop: 5 }}>
            库存（T）：{item.attributeDecimal13 || '-'}
          </span>
        </>
      )}
      {item.shipperFlag === 1 && (
        <span
          className="text-overflow"
          style={{
            position: 'absolute',
            left: 95,
            top: 21,
            width: 40,
          }}
          title={item.shipper}
        >
          {item.shipper}
        </span>
      )}
      {item.errorMessage ? (
        <Tooltip title={item.errorMessage}>
          <span className="cart-error-message text-overflow">{item.errorMessage}</span>
        </Tooltip>
      ) : (
        <>
          {!item.fullAddress && (
            <span className="cart-error-message">
              {intl.get(`mallf.cart.model.pleaseChoose.addressInfo`).d('请选择地址信息')}
            </span>
          )}
        </>
      )}
    </li>
  );
}
