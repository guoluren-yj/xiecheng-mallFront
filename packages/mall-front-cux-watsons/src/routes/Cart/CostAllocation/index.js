import React, { useState, useMemo } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Tooltip } from 'choerodon-ui';

import AllocationModal from './AllocationModal';
import styles from './index.less';

export default function CostAllocation(props) {
  const { productList = [], batchFlag = false, saveCallBack } = props;
  const [costVisible, setCostVisible] = useState(false);
  const modalProps = {
    batchFlag,
    productList,
    costVisible,
    setCostVisible,
    saveCallBack,
  };

  const mixTypeDisable = useMemo(
    () =>
      (productList.some((p) => p.sourceFrom === 'CATA') &&
        productList.some((p) => p.sourceFrom !== 'CATA')) ||
      productList.some((p) => p.deliveryType !== productList[0].deliveryType),
    [productList]
  );

  return (
    <div className={styles['cost-allocation']}>
      <div className={`${batchFlag ? 'cost-allocation-batch' : 'cost-allocation-item'}`}>
        <Tooltip
          title={
            mixTypeDisable
              ? intl
                  .get('mallf.common.view.mixTypeDisable.warning')
                  .d(
                    '不同的送货方式不能统一填写批量费用分配，需勾选相同送货方式商品进行批量费用分配'
                  )
              : null
          }
        >
          <div>
            <a
              onClick={() => {
                setCostVisible(true);
              }}
              disabled={
                (batchFlag &&
                  (isEmpty(productList) || productList.some((n) => n.customFlag === 1))) ||
                mixTypeDisable
              }
              className={`primary-color ${batchFlag ? '' : 'cost-allocation-button'}`}
            >
              {batchFlag
                ? intl.get('mallf.common.view.batchCostAllocation').d('批量费用分配')
                : intl.get('mallf.common.view.costAllocation').d('费用分配')}
            </a>
          </div>
        </Tooltip>
      </div>
      {costVisible && <AllocationModal {...modalProps} />}
    </div>
  );
}
