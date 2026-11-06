import React, { useMemo } from 'react';
import { isEmpty } from 'lodash';
import { Icon, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Attrs from './Attrs';
import style from './index.less';

export default function CustomInfo(props) {
  const { skuId, customList, readOnly, onOk = (e) => e } = props;

  const customValueRender = useMemo(() => {
    return (
      !isEmpty(customList) && (
        <span className="custom-item" r-title>
          {customList.map((item) => `${item.componentName}:${handleCustomValue(item) || '-'};`)}
        </span>
      )
    );
  }, [customList]);

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

  function handleOpenAttrs() {
    const modalProps = readOnly
      ? {
          okCancel: false,
          okText: intl.get('hzero.common.button.close').d('关闭'),
        }
      : {};

    Modal.open({
      title: intl.get('mallf.common.view.customInfo').d('规格定制'),
      style: { width: 380 },
      drawer: true,
      ...modalProps,
      children: <Attrs skuId={skuId} customList={customList} readOnly={readOnly} onOk={onOk} />,
    });
  }

  return (
    <div className={style['custom-info']}>
      <div className="custom-content">
        <span className="custom-label text-overflow">
          {intl.get('mallf.common.view.customProduct').d('定制品')}：
        </span>
        {customValueRender}
        <span className="custom-edit-icon" onClick={() => handleOpenAttrs()}>
          <Icon className="detail-info-update" type={readOnly ? 'find_in_page' : 'mode_edit'} />
        </span>
      </div>
    </div>
  );
}
