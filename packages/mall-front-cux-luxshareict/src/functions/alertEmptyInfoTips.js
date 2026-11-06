import React from 'react';
import { Form, Lov, DataSet, TextField } from 'choerodon-ui/pro';
import { getCurrentUser } from 'utils/utils';
import { openComfirmModal } from 'utils/modals';
import { saveConfigInfo } from '../services';

export default function alertEmptyInfoTips({ data }) {
  if (+data.bizErrorFlag === 1) {
    const { loginName, realName, id } = getCurrentUser();
    const formDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'factoryLov',
          type: 'object',
          label: '工厂',
          lovCode: 'SCUX.LSRT.COMPANY_OU_INV_ORG',
          required: true,
        },
        {
          name: 'organizationId',
          bind: 'factoryLov.organizationId',
        },
        {
          name: 'ouId',
          bind: 'factoryLov.ouId',
        },
        {
          name: 'unitId',
          bind: 'factoryLov.unitId',
        },
        {
          name: 'companyName',
          label: '公司',
          disabled: true,
          required: true,
          bind: 'factoryLov.companyName',
        },
        {
          name: 'companyId',
          bind: 'factoryLov.companyId',
          required: true,
        },
        {
          name: 'purchaseLov',
          type: 'object',
          label: '采购组织',
          lovCode: 'SCUX.LSRT.OU_PUR_ORG',
          required: true,
          computedProps: {
            lovPara: ({ record }) => {
              return {
                ouId: record.get('ouId'),
              };
            },
            disabled: ({ record }) => {
              return !record.get('ouId');
            },
          },
        },
        {
          name: 'purchaseOrgId',
          bind: 'purchaseLov.purchaseOrgId',
        },
      ],
    });
    openComfirmModal({
      title: '个人信息确认',
      closable: false,
      cancelButton: false,
      children: (
        <>
          <p style={{ marginBottom: 5 }}>
            {realName}({loginName})，您好：
          </p>
          <p>
            请确认您的相关信息，如无法确认请联系BU采购。注意，以下信息一旦确定将无法修改，请慎重填写。
          </p>
          <div style={{ marginTop: 20 }}>
            <Form dataSet={formDs} labelLayout="float" columns={3}>
              <Lov
                name="factoryLov"
                onChange={() => {
                  formDs.current.set('purchaseLov', null);
                }}
              />
              <TextField name="companyName" />
              <Lov name="purchaseLov" />
            </Form>
          </div>
        </>
      ),
      onOk: async () => {
        const flag = await formDs.validate();
        const info = formDs.current?.toData();
        info.userId = id;
        if (flag) {
          await saveConfigInfo({ params: info });
          window.location.reload();
        }
        return flag;
      },
    });
  }
}
