import React, { useState, useMemo } from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import CustomModal from './CostomModal';
import style from './index.less';

export default function CustomInfo(props) {
  const { openMoadlIcon, product, showCustomItem = true, onCustomOk, disabled } = props;
  const [costomVisible, setCostomVisible] = useState(false);

  const customValueRender = useMemo(() => {
    const { customizedProductLineList } = product || {};
    return (
      !isEmpty(customizedProductLineList) && (
        <div
          className="custom-item"
          title={customizedProductLineList[0].customizedProductValueList?.map(
            (n) => `${n.componentName}:${handleCustomValue(n)};`
          )}
        >
          {customizedProductLineList[0].customizedProductValueList?.map((item) => (
            <span>
              {item.componentName}:{handleCustomValue(item)};
            </span>
          ))}
        </div>
      )
    );
  }, [product]);

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
      <div className="custom-content" style={props.style || {}}>
        {showCustomItem && (
          <div
            className="custom-label text-overflow"
            title={intl.get('mallf.common.view.customProduct').d('定制品')}
          >
            {intl.get('mallf.common.view.customProduct').d('定制品')}：
          </div>
        )}
        {customValueRender}
        <span onClick={() => setCostomVisible(true)}>{openMoadlIcon}</span>
      </div>
      {costomVisible && <CustomModal {...customProps} />}
    </div>
  );
}
