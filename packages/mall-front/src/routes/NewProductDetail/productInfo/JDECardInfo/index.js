import React, { useRef } from 'react';
import { getCurrentLanguage } from '@/utils/utils';
import { NumberField } from 'choerodon-ui/pro';
import intl from 'utils/intl';

function JDECardInfo(props) {
  const { dataSet } = props;
  const isHaveValue = useRef(dataSet.getField('otherFaceValue').get('defaultValue'));
  return (
    <div className="product-attr" style={{ alignItems: 'center' }}>
      <div className={`p-label ${getCurrentLanguage() === 'zh_CN' ? 'p-label-width' : ''}`} r-title>
        {intl.get('mallf.productDetail.common.view.otherFaceInfo').d('其他面值')}
      </div>
      <div className={`p-content ${isHaveValue.current ? 'p-number-focus' : ''}`}>
        <NumberField
          dataSet={dataSet}
          name="otherFaceValue"
          showValidation="newLine"
          placeholder={intl
            .get('mallf.productDetail.common.view.otherFaceValueVaild')
            .d('请输入1-5000的整数')}
          validationRenderer={() =>
            intl.get('mallf.productDetail.common.view.otherFaceValueVaild').d('请输入1-5000的整数')
          }
        />
      </div>
    </div>
  );
}

export default JDECardInfo;
