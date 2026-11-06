import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { getUserConfigInfo, filterNullValueObject } from 'utils/utils';
import MallExport from 'components/MallExport';
import HeaderOther from 'mall-front/lib/routes/MyMall/AddressList/HeaderOther.js';

export default function AddressBtnsWrapper(props) {
  const { tableDs, displayBlock, searchBarRef, customizeUnitCode, operateBtns } = props;
  const { companyId, organizationId } = getUserConfigInfo();
  const getExportQueryParams = () => {
    return filterNullValueObject({
      companyId,
      mallFlag: 1,
      addressList: tableDs.selected.map((record) => record.get('addressId')).join(),
      customizeUnitCode,
      ...(filterNullValueObject(searchBarRef.current?.getQueryParameter()) || {}),
    });
  };
  const [newOprateBtns, setNewOprateBtns] = useState([]);

  useEffect(() => {
    setNewOprateBtns([
      ...operateBtns,
      {
        hidden: !!displayBlock,
        render: () => (
          <MallExport
            exportAsync
            templateCode="SMAL.RECEIVE_ADDRESS_EXPORT"
            requestUrl={`/smal/v1/${organizationId}/addresss/receiver/export`}
            queryParams={getExportQueryParams}
            otherButtonProps={{
              type: 'c7n-pro',
              funcType: 'link',
              icon: '',
            }}
          />
        ),
        title: intl.get('hzero.common.button.export').d('导出'),
      },
    ]);
  }, [displayBlock]);

  return (
    <>
      <HeaderOther operateBtns={newOprateBtns} />
    </>
  );
}
