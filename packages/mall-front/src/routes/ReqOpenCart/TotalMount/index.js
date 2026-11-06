import React, { useMemo } from 'react';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { numberRender } from 'utils/utils';
import styles from './index.less';

export default function TotalMount({ order = {}, postage }) {
  const { pending, data } = postage;

  const totalNum = useMemo(() => {
    const { orderLineList } = order;
    const total = orderLineList.reduce((pre, curr) => {
      return math.plus(pre, curr.quantity);
    }, 0);
    return total;
  }, [order]);

  const getPriceValue = (field) => {
    if (pending) {
      return intl.get('mallf.common.view.calcProcessing').d('计算中...');
    }
    const priceVal = isNil(data?.[field])
      ? '-'
      : numberRender(data?.[field], order.financialPrecision, true);
    return `${order.currencySymbol || ''}${priceVal}`;
  };

  return (
    <div className={styles['mount-content']}>
      <div className="mount-price-col">
        <div className="mount-cell">
          {order.currencySymbol || ''}
          {order.taxIncludedAmountMeaning || order.taxIncludedAmount}
        </div>
        <div className="mount-cell">{getPriceValue('extraAmount')}</div>
        <div className="mount-total">
          {pending ? (
            intl.get('mallf.common.view.calcProcessing').d('计算中...')
          ) : (
            <>
              {order.currencySymbol || ''}
              {numberRender(
                math.plus(order.taxIncludedAmount, data?.extraAmount || 0),
                order.financialPrecision,
                true
              )}
            </>
          )}
        </div>
      </div>
      <div className="mount-label-col">
        <div className="mount-cell">
          {intl.get('mallf.common.view.productsPriceTotal').d('商品总金额(含税)')}:
        </div>
        <div className="mount-cell">
          <Tooltip
            title={
              <>
                <p style={{ marginBottom: 5 }}>
                  {intl.get(`mallf.common.model.freight`).d('运费(含税)')}:
                  {getPriceValue('freightAmount')}
                </p>
                <p style={{ marginBottom: 5 }}>
                  {intl.get(`mallf.common.model.anzhuang`).d('安装费(含税)')}:
                  {getPriceValue('installAmount')}
                </p>
                <p>{intl.get(`mallf.common.view.openReqExMoney.help`).d('暂估附加费仅供参考')}</p>
              </>
            }
          >
            <Icon
              type="help"
              style={{
                fontSize: 14,
                marginRight: 6,
                marginTop: -2,
                color: 'rgba(0,0,0,0.50)',
              }}
            />
          </Tooltip>
          {intl.get(`mallf.common.model.openReqExMoney`).d('暂估附加费(含税)')}:
        </div>
        <div className="mount-total">
          {intl.get('mallf.common.view.openCart.taxIncludedAmount').d('申请总金额')}
          {intl
            .get('mallf.common.view.products.totalNum', {
              name: totalNum,
            })
            .d(`(含税)(共${totalNum}件商品)`)}
          :
        </div>
      </div>
    </div>
  );
}
