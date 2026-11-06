import React, { useEffect } from 'react';
import { Form, Select, Lov, TextArea, Attachment } from 'choerodon-ui/pro';

import { OMS_PURCHASE_APPLY_HEADER } from 'utils/customizeCode';
import { PrecisionField } from 'utils/precision';
import { getUserConfigInfo, numberRender } from 'utils/utils';
import customizes from 'cuxTools/customizes';
import { accept } from 'utils/constants';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';
import cuxComponent from 'cuxTools/cuxComponent';
// import ds from './ds';

function BaseInfoForm(props) {
  const {
    custWebConfig: { manualFileSize = 100 },
  } = getUserConfigInfo();
  const { onDsRef, setState, manualRequestId, custForm, initDs, applyInfoTableDs } = props; // custForm

  useEffect(() => {
    onDsRef(initDs);
  }, []);

  const maxSize = `${manualFileSize}M`;
  const attProps = {
    newLine: true,
    name: 'attachmentUuid',
    sortable: true,
    bucketName: 'private-bucket',
    bucketDirectory: 'mall-front',
    viewMode: 'list',
    value: initDs.current?.get('attachmentUuid'),
    onChange: () => {},
    style: { paddingLeft: 0 },
    accept,
    help: intl
      .get('mallf.common.view.attProps.help', { accept, maxSize })
      .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
    fileSize: 1024 * 1024 * manualFileSize,
  };
  const outerAttProps = {
    name: 'outerAttachmentUuid',
    sortable: true,
    bucketName: 'private-bucket',
    bucketDirectory: 'mall-front',
    viewMode: 'list',
    value: initDs.current?.get('outerAttachmentUuid'),
    onChange: () => {},
    // style: { paddingLeft: 0 },
    accept,
    help: intl
      .get('mallf.common.view.attProps.help', { accept, maxSize })
      .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
    fileSize: 1024 * 1024 * manualFileSize,
  };
  const changeList = customizes[OMS_PURCHASE_APPLY_HEADER] || {};
  return (
    <div style={{ marginBottom: 10 }}>
      <p className="addPurchase-apply-title">
        {intl.get(`mallf.purchaseDetail.view.baseInfo`).d('基本信息')}
      </p>
      {custForm(
        {
          code: OMS_PURCHASE_APPLY_HEADER,
          changeList,
          changeParams: { tableDs: applyInfoTableDs, headerDs: initDs },
        },
        <Form dataSet={initDs} labelLayout="float" columns={3}>
          <Select
            name="manualRequestTypeSelect"
            clearButton={false}
            onChange={() => {
              CuxFn({
                name: 'OMSAddPurchaseApply-fn-changePrType',
                value: { tableDs: applyInfoTableDs },
              })();
            }}
          />
          <Lov
            name="companyLov"
            onChange={(params) => {
              const { companyId } = params || {};
              setState({ companyId });
              if (!companyId) {
                initDs.current.set({
                  ouLov: null,
                  purchaseOrgLov: null,
                  purchaseAgentLov: null,
                });
              } else {
                initDs.current.set({
                  ouLov: params.ouId
                    ? {
                        ouCode: params.ouCode,
                        ouId: params.ouId,
                        ouName: params.ouName,
                      }
                    : null,
                  purchaseOrgLov: params.purchaseOrgId
                    ? {
                        purchaseOrgId: params.purchaseOrgId,
                        organizationName: params.organizationName,
                        organizationCode: params.organizationCode,
                      }
                    : null,
                  purchaseAgentLov: params.purchaseAgentId
                    ? {
                        purchaseAgentId: params.purchaseAgentId,
                        purchaseAgentName: params.purchaseAgentName,
                        purchaseAgentCode: params.purchaseAgentCode,
                      }
                    : null,
                });
              }
            }}
          />
          <Lov
            name="ouLov"
            onChange={(params) => {
              const { ouId } = params || {};
              if (!ouId) {
                initDs.current.set({
                  purchaseOrgLov: null,
                  purchaseAgentLov: null,
                });
              } else {
                initDs.current.set({
                  purchaseOrgLov: params.purchaseOrgId
                    ? {
                        purchaseOrgId: params.purchaseOrgId,
                        organizationName: params.organizationName,
                        organizationCode: params.organizationCode,
                      }
                    : null,
                  purchaseAgentLov: params.purchaseAgentId
                    ? {
                        purchaseAgentId: params.purchaseAgentId,
                        purchaseAgentName: params.purchaseAgentName,
                        purchaseAgentCode: params.purchaseAgentCode,
                      }
                    : null,
                });
              }
              applyInfoTableDs.forEach((record) => {
                record.set('invOrganizationLov', null);
              });
            }}
          />
          <Lov
            name="purchaseOrgLov"
            onChange={(params) => {
              if (params?.purchaseOrgId) {
                initDs.current.set({
                  purchaseAgentLov: params.purchaseAgentId
                    ? {
                        purchaseAgentId: params.purchaseAgentId,
                        purchaseAgentName: params.purchaseAgentName,
                        purchaseAgentCode: params.purchaseAgentCode,
                      }
                    : null,
                });
              } else {
                initDs.current.set({
                  purchaseAgentLov: null,
                });
              }
            }}
          />
          <Lov
            name="bumenLov"
            modalProps={{ title: intl.get('mallf.purchaseDetail.view.feild.bumen').d('部门') }}
          />
          <Lov name="purchaseAgentLov" />
          <Lov
            name="requestByLov"
            disabled={!!manualRequestId}
            modalProps={{
              title: intl.get('mallf.addPurchase.model.application.person').d('申请人'),
            }}
          />
          {PrecisionField({
            name: 'predictAmount',
            precision: initDs.current?.get('financialPrecision'),
            record: initDs.current,
            renderer: ({ value }) => {
              return numberRender(value, initDs.current?.get('financialPrecision'), true);
            },
          })}
          <Lov
            name="currencyLov"
            onChange={(lovValue) => {
              const { financialPrecision, defaultPrecision } = lovValue || {};
              initDs.current.set('defaultPrecision', defaultPrecision);
              initDs.current.set('financialPrecision', financialPrecision);
              setState({ financialPrecision, defaultPrecision });
            }}
          />
          <TextArea name="remark" newLine colSpan={2} />
          <Attachment {...attProps} />
          <Attachment {...outerAttProps} />
        </Form>
      )}
    </div>
  );
}

export default cuxComponent({ path: 'AddPurchaseApply/OMS/BaseInfoForm' })(BaseInfoForm);
