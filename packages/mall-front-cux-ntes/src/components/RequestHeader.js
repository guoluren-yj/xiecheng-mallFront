import React, { useEffect } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import ExcelExport from 'hzero-front/lib/components/ExcelExport';

import intl from 'utils/intl';
import { getOrganizationId, getUserConfigInfo } from 'utils/utils';

export default function RequestHeader({ dataSet }) {
  const { userId } = getUserConfigInfo();
  useEffect(() => {
    dataSet.queryData({
      size: 10,
    });
  }, []);
  return (
    <div className="request-search">
      <TextField
        prefix={<Icon style={{ margin: '0 10px', cursor: 'pointer' }} type="search" />}
        clearButton
        value={dataSet.requestCode}
        onChange={(value) => {
          dataSet.queryData({
            requestCode: value,
            page: 0,
            size: 10,
          });
        }}
        style={{ width: 280 }}
        placeholder={intl.get('mallf.myRequest.view.search.mallApplyNum').d('请输入商城申请号')}
      />
      <div style={{ flex: 1, textAlign: 'right' }}>
        <ExcelExport
          defaultSelectAll
          requestUrl={`/smodr/v1/${getOrganizationId()}/mall-requests/mall-list-export`}
          queryParams={{
            userId,
            lineFlag: true,
            tenantId: getOrganizationId(),
            mallStatusGroupCode: dataSet.currentStatus,
            requestCode: dataSet.requestCode,
          }}
          otherButtonProps={{
            type: 'c7n-pro',
            color: 'primary',
            funcType: 'flat',
            icon: 'unarchive',
          }}
        />
      </div>
    </div>
  );
}
