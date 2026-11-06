import React from 'react';
import EcServiceLink from './index';
import styles from './styles.less';

export default function OtherInfo(props) {
  const { data } = props;

  if (data?.sourceFrom !== 'JD') {
    return <></>;
  }

  return (
    <div className={styles['product-other-info']}>
      <span>客服：</span>
      <EcServiceLink
        params={{
          platformType: 'PC',
          purchaseCompanyId: data?.companyId,
          orderSourceFrom: data?.sourceFrom,
          thirdSkuCode: data?.thirdSkuCode,
        }}
      />
    </div>
  );
}
