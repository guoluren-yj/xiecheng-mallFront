import React from 'react';
import Lov from 'components/lov';
import intl from 'utils/intl';
import * as HmallConfig from 'utils/api-config';
import { getUserConfigInfo, getCookie } from 'utils/utils';

export default function AddressLov(props) {
  const { purOrganizationId, setFieldsValue, address } = props;
  const { organizationId, companyId, userId } = getUserConfigInfo();

  const DEDOUColumns = [
    {
      title: intl.get('mallf.common.view.sourceFrom').d('来源'),
      align: 'left',
      width: 120,
      dataIndex: 'addressFrom',
    },
    {
      title: intl.get(`mallf.common.view.baiyingOrderId`).d('百应工单'),
      align: 'left',
      width: 120,
      dataIndex: 'orderId',
    },
    {
      title: intl.get(`mallf.common.view.contact`).d('联系人'),
      align: 'left',
      width: 100,
      dataIndex: 'contactName',
      isQuery: true,
    },
    {
      title: intl.get(`mallf.common.view.tel`).d('电话'),
      align: 'left',
      width: 120,
      dataIndex: 'mobile',
      isQuery: true,
    },
    {
      title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      align: 'left',
      width: 240,
      isQuery: true,
      dataIndex: 'fullAddress',
    },
  ];

  const { orderId = null } = getCookie('SRM-DEDOU') || {};

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
          queryUrl: `${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}&orderId=${orderId}`,
          columns: DEDOUColumns,
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
