import React, { useState, useMemo } from 'react';

// import cuxComponent from 'cuxTools/cuxComponent';
import AllocationModal from './AllocationModal';
import styles from './index.less';
import { isNil } from 'lodash';
import intl from 'utils/intl';

export default function ProductAllocation(props) {
  const { product = {}, dimensionTemplates = {}, title, children, centralizedUserType, readOnly } = props;
  const { dimensionTemplateDTO, productName } = product;
  const [visible, setVisible] = useState(false);
  const { dimensionTemplate = {} } = dimensionTemplateDTO || dimensionTemplates;
    // 单行展示样式标识 - 拼单
  const singleLineFlag = useMemo(()=>
    !isNil(centralizedUserType)
  , [centralizedUserType])
  const allocationModalProps = {
    ...props,
    visible,
    setVisible,
    title: title ? title : (singleLineFlag ? `${readOnly ? intl.get(`mallf.common.view.look`).d('查看') : ''}${dimensionTemplate?.templateName}` : productName),
    dimensTemplates: dimensionTemplateDTO || dimensionTemplates,
    singleLineFlag,
  };

  return (
    <>
      <div className={styles['allocation-item']}>
        <a
          onClick={() => {
            setVisible(true);
          }}
          className="primary-color"
        >
          { readOnly && singleLineFlag ? intl.get(`mallf.common.view.look`).d('查看') : ''}{ children || dimensionTemplate?.templateName}
        </a>
      </div>
      {visible && <AllocationModal {...allocationModalProps} />}
    </>
  );
}

// export default cuxComponent({ path: 'routes/CartPro/ProductAllocation' })(ProductAllocation);
