import React from 'react';
import { Form, TextField, Select, Lov, NumberField, DatePicker, Output } from 'choerodon-ui/pro';

import { OMS_PURCHASE_APPLY_HEADER } from 'utils/customizeCode';
import intl from 'utils/intl';
import UploadFile from './UploadFile';

export default function BaseInfoForm(props) {
  const { ds: initDs, setState, custForm, manualRequestId } = props; // custForm

  return (
    <div style={{ marginBottom: 10 }}>
      <p className="addPurchase-apply-title">
        {intl.get(`mallf.purchaseDetail.view.baseInfo`).d('基本信息')}
      </p>
      {custForm(
        { code: OMS_PURCHASE_APPLY_HEADER, enableEmpty: true, maxCol: 4 },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          <Select name="manualRequestTypeSelect" clearButton={false} />
          <Lov
            name="companyLov"
            clearButton={false}
            onChange={(e) => {
              const { companyId } = e || {};
              setState({ companyId });
              initDs.current.set('ouId', null);
              initDs.current.set('ouName', null);
              initDs.current.set('purchaseOrgId', null);
              initDs.current.set('purchaseOrgName', null);
            }}
          />
          <Lov
            name="ouLov"
            clearButton={false}
            onChange={() => {
              initDs.current.set('purchaseOrgId', null);
              initDs.current.set('purchaseOrgName', null);
            }}
          />
          <Lov name="purchaseOrgLov" />
          <Lov name="bumenLov" />
          <Lov name="purchaseAgentLov" />
          <Lov name="requestByLov" disabled={!!manualRequestId} />
          <NumberField name="predictAmount" min={0} />
          <Lov
            name="currencyLov"
            onChange={(lovValue) => {
              const { financialPrecision, defaultPrecision } = lovValue || {};
              setState({ financialPrecision, defaultPrecision });
            }}
          />
          {/* <DatePicker mode="dateTime" name="requestDate" /> */}
          <DatePicker name="creationDate" />
          <TextField name="remark" />
          <Output
            label={intl.get('mallf.purchaseDetail.view.apply.titlePre').d('标题预览')}
            name="titlePre"
            renderer={({ record }) => {
              const { attributeLongtext12 = '', ouName = '', prNum = '' } =
                record?.get(['attributeLongtext12', 'ouName', 'prNum']) || {};
              return (
                <>
                  {attributeLongtext12}
                  {attributeLongtext12 ? '-' : ''}
                  {ouName}
                  {prNum || 'REQ20XXXXXX00005'}
                </>
              );
            }}
          />
        </Form>
      )}
      <UploadFile
        newLine
        maxSize={20}
        bucketName="private-bucket"
        directory="mall-front"
        attachmentUuid={initDs?.current?.toData().attachmentUuid}
      />
    </div>
  );
}
