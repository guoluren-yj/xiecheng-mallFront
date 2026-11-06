import React from 'react';
import Lov from 'components/lov';
import intl from 'utils/intl';
import * as HmallConfig from 'utils/api-config';
import { getUserConfigInfo } from 'utils/utils';

export default function AddressLov(props) {
  const { purOrganizationId, addressColumns, setFieldsValue, address } = props;
  const { organizationId, companyId, userId } = getUserConfigInfo();
  return (
    <>
      <Lov
        key={purOrganizationId}
        notAllowClear
        c7n
        label={intl.get(`mallf.common.model.receive.info`).d('收货信息')}
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
        textValue={address}
        onOkCallback={({ addressId: id }) => {
          setFieldsValue({
            addressId: id,
          });
        }}
        width={300}
        height={35}
      />
    </>
  );
}
