import React from 'react';
import { Lov, message } from 'choerodon-ui/pro';
import { getUserConfigInfo } from 'utils/utils';

export function getUnit({ formDs }) {
  const {
    userConfig: { unitId, unitName, unitCode },
  } = getUserConfigInfo();
  formDs.current.set('unitId', unitId);
  formDs.current.set('unitName', unitName);
  formDs.current.set('unitCode', unitCode);
}

export function fetchCurrency({ fn, formDs }) {
  const {
    userConfig: { ouId, ouName, invoiceOrgId, invoiceOrgName, invoiceOrgCode },
  } = getUserConfigInfo();
  formDs.current.set('ouLov', {
    ouId,
    ouName,
    invOrganizationId: invoiceOrgId,
    invOrganizationName: invoiceOrgName,
    invOrganizationCode: invoiceOrgCode,
  });
  fn('C001');
}

export function cuxAddLine({ addLine, initDs, headerDs }) {
  const { ouLov } = headerDs.toData()?.[0] || {};
  const { invOrganizationName, invOrganizationCode, invOrganizationId } = ouLov || {};
  addLine();
  initDs.current.set({
    ouId: headerDs.current.get('ouId'),
    invOrganizationName,
    invOrganizationCode,
    invOrganizationId,
  });
}

export function renderItemLov({ onChange }) {
  return (
    <Lov
      onChange={onChange}
      onBeforeSelect={(record) => {
        const flag = +record.get('shelfFlag') !== 1;
        if (!flag) {
          message.error('已上架物料不允许选择', 3, undefined, 'bottomRight');
        } else {
          message.destroy();
        }
        return flag;
      }}
    />
  );
}
