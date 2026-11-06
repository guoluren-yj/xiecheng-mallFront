import React from 'react';
import InitContent from 'components/lov/initContent';
import HmallConfig from 'utils/api-config';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

export default function ChangeAddressModal(props) {
  const { Initvisible, addressColumns, chooseAddress, openTable } = props;
  const { userId, companyId, organizationId } = getUserConfigInfo();
  return (
    <InitContent
      initStyle
      visible={Initvisible}
      viewInfo={{
        width: 1170,
        lovRowKey: 'addressId',
        queryUrl: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}`,
        columns: addressColumns,
        title: intl.get(`mallf.common.view.address.query`).d('地址查询'), // 地址查询
        displayField: 'fullAddress',
        valueField: 'addressId',
        otherField: 'fullAddress',
      }}
      onOkCallback={chooseAddress}
      toggle={openTable}
    />
  );
}
