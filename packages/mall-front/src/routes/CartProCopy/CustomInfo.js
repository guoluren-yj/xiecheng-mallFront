import React, { useState, useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import CustomModal from 'components/CustomInfo/CostomModal';
import style from './renderer.less';

export default function CustomInfo(props) {
  const { product, onCustomOk, disabled } = props;
  const [costomVisible, setCostomVisible] = useState(false);

  const customValueRender = useMemo(() => {
    const { customizedProductLineList } = product || {};
    return (
      !isEmpty(customizedProductLineList) && (
        <span className="custom-item" r-title>
          {customizedProductLineList[0].customizedProductValueList?.map(
            (item) => `${item.componentName}:${handleCustomValue(item) || '-'};`
          )}
        </span>
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
  const custFlag = +product.customFlag && +product.invalidFlag;
  return (
    <>
      <div className={style['custom-info']} r-if={custFlag}>
        <div className="custom-content" style={props.style || {}}>
          <span className="custom-label text-overflow" r-title>
            {intl.get('mallf.common.view.customProduct').d('定制品')}：
          </span>
          {customValueRender}
        </div>
        <span className="custom-edit-icon" onClick={() => setCostomVisible(true)}>
          <Icon className="detail-info-update" type="mode_edit" />
        </span>
        {costomVisible && <CustomModal {...customProps} />}
      </div>
      <div r-if={custFlag} style={{ height: 5 }} />
      <div className={style['custom-info']} r-if={!isEmpty(product.productAttributeDTOList)}>
        <div className="custom-content" style={props.style || {}}>
          <span className="custom-label text-overflow" r-title>
            {intl.get('mallf.cart.view.spec').d('规格')}：
          </span>
          {product.productAttributeDTOList
            ?.map(({ pValue, pName }) => `${pName}: ${pValue}`)
            .join(`;\xa0\xa0\xa0`)}
        </div>
      </div>
    </>
  );
}
