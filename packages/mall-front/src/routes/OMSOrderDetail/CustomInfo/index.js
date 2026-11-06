import React, { useState } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import CustomModal from './CostomModal';
import style from './index.less';

export default function CustomInfo(props) {
  const { openMoadlIcon, product, showCustomItem = true, onCustomOk, disabled } = props;

  const [costomVisible, setCostomVisible] = useState(false);
  const { customizedProductLineList } = product;

  const customProps = {
    product,
    costomVisible,
    setCostomVisible,
    onCustomOk,
    disabled,
  };

  function handleCustomValue(item) {
    const { componentType, cpValue, cpValueName } = item;
    let value = '';
    switch (componentType) {
      case 'IMAGE':
        value = '';
        break;
      case 'UPLOAD':
        value = '';
        break;
      case 'LOV':
        value = cpValueName;
        break;
      case 'SELECT':
        value = cpValueName;
        break;
      default:
        value = cpValue;
        break;
    }
    return value;
  }

  return (
    <div className={style['custom-info']}>
      {showCustomItem ? (
        <div className="custom-content">
          <div className="custom-label">
            {intl.get('mallf.orderDetail.view.customProduct').d('定制品')}：
          </div>
          {!isEmpty(customizedProductLineList) && (
            <div className="custom-item">
              {customizedProductLineList[0].customizedProductValueList?.map((item) => (
                <span>
                  {item.componentName}:{handleCustomValue(item)};
                </span>
              ))}
            </div>
          )}
          <span onClick={() => setCostomVisible(true)}>{openMoadlIcon}</span>
        </div>
      ) : (
        <span onClick={() => setCostomVisible(true)}>{openMoadlIcon}</span>
      )}
      {costomVisible && <CustomModal {...customProps} />}
    </div>
  );
}
