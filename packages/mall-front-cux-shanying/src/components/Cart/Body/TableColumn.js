import React from 'react';
import intl from 'utils/intl';
import { Tooltip } from 'choerodon-ui/pro';
import Lov from 'components/lov';

import styles from './index.less';

function TableColumn(props) {
  const { item, updateCart = () => {}, labels = {} } = props;
  // const { productLabelDTOList = [] } = labels;
  // 当商品标签为固定资产或无形资产时，设置为必输项
  // const flag = productLabelDTOList?.some(label =>
  //   ['ZC_FIXED_ASSETS', 'ZC_INTANGIBLE_ASSETS'].includes(label?.labelCode)
  // );
  return (
    <>
      <li className={styles['cart-body-project']}>
        <div>
          <span>{intl.get('mallf.cart.view.shanying.projectNo').d('立项单号')}:</span>
          <Tooltip title={item.attributeVarchar11 || ''}>
            <span>{item.attributeVarchar11}</span>
          </Tooltip>
        </div>
        <div>
          <span>{intl.get('mallf.cart.view.shanying.projectName').d('立项名称')}:</span>
          <Tooltip title={item.attributeVarchar12 || ''}>
            <span>{item.attributeVarchar12}</span>
          </Tooltip>
        </div>
      </li>
      <li className={styles['cart-body-mangeUnit']}>
        <div>
          <Lov
            onOkCallback={data => {
              const { costCode, costName } = data;
              // 必填情况下，没值则不继续执行后续逻辑
              // if (Boolean(flag) && !costCode) {
              //   return false;
              // }
              const params = {
                ...item,
                manageUnitCode: costCode,
                manageUnitName: costName,
              };
              updateCart(params);
            }}
            label={intl.get('mallf.common.model.mangeUnit').d('管理部门')}
            textValue={item.manageUnitName}
            lovCode="SCUX.SHANYING.COST_CENTER"
            width="100%"
          />
        </div>
      </li>
    </>
  );
}

export default TableColumn;
