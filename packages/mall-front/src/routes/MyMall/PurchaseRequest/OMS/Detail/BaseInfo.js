import React, { useEffect, useMemo } from 'react';
import { Row, Col, Tooltip } from 'choerodon-ui';
import { Icon as HIcon } from 'hzero-ui';
import { DataSet, Form, Output, Attachment } from 'choerodon-ui/pro';

import { OMS_PURCHASE_APPLY_HEADER } from 'utils/customizeCode';
import intl from 'utils/intl';
import Tags from 'components/Tag';
import { getOrganizationId } from 'utils/utils';
import CuxFn from '@/cuxTools/cuxFn';

export default function BaseInfo(props) {
  const { custForm, dataSource, status } = props;
  const fields = [
    {
      name: 'manualRequestNum',
      type: 'string',
      disabled: true,
      label: intl.get('mallf.myRequest.model.myAppplicationNum').d('我的申请号'),
    },
    {
      name: 'prNum',
      type: 'string',
      disabled: true,
      label: intl.get('mallf.myRequest.model.purchaseApplicationNum').d('采购申请号'),
    },
    // 币种
    {
      name: 'currencyLov',
      type: 'object',
      textField: 'currencyName',
      valueField: 'currencyId',
      lovCode: 'SMDM.CURRENCY',
      lovPara: { tenantId: getOrganizationId() },
      label: intl.get('mallf.myRequest.view.feild.currency').d('币种'),
    },
    {
      bind: 'currencyLov.currencyName',
      name: 'currencyName',
      type: 'string',
    },
    {
      bind: 'currencyLov.currencyId',
      name: 'currencyId',
      type: 'string',
    },
    {
      bind: 'currencyLov.currencyCode',
      name: 'currencyCode',
      type: 'string',
    },
    // 部门
    {
      name: 'bumenLov',
      type: 'object',
      textField: 'unitName',
      valueField: 'unitId',
      lovCode: 'S2FUL.USER_UNIT',
      lovPara: { tenantId: getOrganizationId() },
      label: intl.get('mallf.myRequest.view.feild.bumen').d('部门'),
    },
    {
      bind: 'bumenLov.unitId',
      name: 'unitId',
      type: 'string',
    },
    {
      bind: 'bumenLov.unitName',
      name: 'unitName',
      type: 'string',
    },
    {
      bind: 'bumenLov.unitCode',
      name: 'unitCode',
      type: 'string',
    },
    // 公司
    {
      name: 'companyLov',
      type: 'object',
      textField: 'companyName',
      valueField: 'companyId',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      lovPara: { tenantId: getOrganizationId() },
      label: intl.get('mallf.myRequest.view.company.name').d('公司名称'),
    },
    {
      bind: 'companyLov.companyId',
      name: 'purchaseCompanyId',
      type: 'string',
    },
    {
      bind: 'companyLov.companyName',
      name: 'purchaseCompanyName',
      type: 'string',
    },
    {
      bind: 'companyLov.companyNum',
      name: 'purchaseCompanyCode',
      type: 'string',
    },
    // 业务实体
    {
      name: 'ouLov',
      type: 'object',
      textField: 'ouName',
      valueField: 'ouId',
      lovCode: 'SPFM.USER_AUTH.OU',
      label: intl.get(`mallf.myRequest.model.businessEntity`).d('业务实体'),
    },
    {
      bind: 'ouLov.ouId',
      name: 'ouId',
      type: 'string',
    },
    {
      bind: 'ouLov.ouName',
      name: 'ouName',
      type: 'string',
    },
    {
      bind: 'ouLov.ouCode',
      name: 'ouCode',
      type: 'string',
    },
    {
      name: 'purchaseOrgLov',
      type: 'object',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
      lovCode: 'HPFM.PURCHASE_ORGANIZATION_M',
      label: intl.get('mallf.myRequest.model.purchaseOrg').d('采购组织'),
    },
    {
      bind: 'purchaseOrgLov.purchaseOrgId',
      name: 'purchaseOrganizationId',
      type: 'string',
    },
    {
      bind: 'purchaseOrgLov.organizationName',
      name: 'purchaseOrganizationName',
      type: 'string',
    },
    {
      bind: 'purchaseOrgLov.organizationCode',
      name: 'purchaseOrganizationCode',
      type: 'string',
    },
    {
      name: 'purchaseAgentLov',
      type: 'object',
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovCode: 'SPUC.PURCHASE_AGENT',
      label: intl.get('mallf.myRequest.model.purchaseAgent').d('采购员'),
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentName',
      name: 'agentName',
      type: 'string',
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentId',
      name: 'agentId',
      type: 'string',
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentCode',
      name: 'agentCode',
      type: 'string',
    },
    {
      name: 'requestByLov',
      type: 'object',
      textField: 'userName',
      valueField: 'userId',
      lovCode: 'SPCM.ACCEPT_USER',
      lovPara: { tenantId: getOrganizationId() },
      label: intl.get('mallf.myRequest.model.application.person').d('申请人'),
    },
    {
      name: 'requestByName',
      bind: 'requestByLov.userName',
    },
    {
      name: 'requestBy',
      bind: 'requestByLov.userId',
    },
    {
      name: 'requestedBy',
      type: 'string',
    },
    {
      name: 'requestDate',
      type: 'date',
      label: intl.get('mallf.myRequest.model.create.time').d('创建时间'),
    },
    {
      name: 'manualRequestTypeSelect',
      type: 'object',
      label: intl.get('mallf.myRequest.model.application.type').d('申请类型'),
    },
    {
      name: 'manualRequestTypeName',
      bind: 'manualRequestTypeSelect.meaning',
    },
    {
      name: 'manualRequestTypeId',
      bind: 'manualRequestTypeSelect.value',
    },
    {
      name: 'receiverAddressId',
      type: 'string',
    },
    {
      name: 'receiverAddressName',
      type: 'string',
    },
    {
      name: 'receiverRegionId',
      type: 'string',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('mallf.myRequest.view.apply.remark').d('申请说明'),
    },

    {
      name: 'predictAmountMeaning',
      type: 'string',
      disabled: true,
      label: intl.get('mallf.myRequest.view.estimated.amount').d('预估总金额（含税）'),
      transformResponse: (val, record) => val || record.predictAmount,
    },

    {
      name: 'remark',
      type: 'string',
      label: intl.get('mallf.myRequest.view.apply.remark').d('申请说明'),
    },
    {
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('mallf.common.view.innerAttachment').d('内部附件'),
    },
    {
      name: 'outerAttachmentUuid',
      type: 'string',
      label: intl.get('mallf.common.view.outterAttachment').d('外部附件'),
    },
    {
      name: 'creationDate',
      type: 'date',
      disabled: true,
      label: intl.get('mallf.myRequest.view.submit.time').d('提交时间'),
    },
  ];
  const initFormDs = useMemo(() => new DataSet({ fields }), []);
  const otherFormDs = useMemo(() => new DataSet({ fields }), []);
  useEffect(() => {
    initFormDs.loadData([dataSource]);
    otherFormDs.loadData([dataSource]);
  }, [dataSource]);

  const attProps = {
    name: 'attachmentUuid',
    sortable: true,
    bucketName: 'private-bucket',
    bucketDirectory: 'mall-front',
    viewMode: 'list',
    onChange: () => {},
    style: { paddingLeft: 0 },
    readOnly: true,
  };
  const outAttProps = {
    name: 'outerAttachmentUuid',
    sortable: true,
    bucketName: 'private-bucket',
    bucketDirectory: 'mall-front',
    viewMode: 'list',
    onChange: () => {},
    style: { paddingLeft: 0 },
    readOnly: true,
  };
  return (
    <>
      {custForm(
        {
          code: OMS_PURCHASE_APPLY_HEADER,
          dataSource,
          readOnly: true,
        },
        <Form dataSet={initFormDs} columns={3} className="c7n-pro-vertical-form-display">
          <Output name="manualRequestTypeSelect" />
          <Output name="companyLov" />
          <Output name="ouLov" />
          <Output name="purchaseOrgLov" />
          <Output name="bumenLov" />
          <Output name="purchaseAgentLov" />
          <Output name="requestByLov" />
          <Output name="predictAmountMeaning" />
          <Output name="currencyLov" />
          <Output mode="dateTime" />
          {/* <Output name="requestDate" /> */}
          <Output mode="creationDate" />
          <Output name="remark" newLine colSpan={2} />
          <Output
            newLine
            name="attachmentUuid"
            renderer={() => {
              return <Attachment {...attProps} />;
            }}
          />
          <Output
            name="outerAttachmentUuid"
            renderer={() => {
              return <Attachment {...outAttProps} />;
            }}
          />
          {CuxFn({
            name: 'PurchaseRequest-fn-changeBaseInfoField',
            value: {},
          })()}
        </Form>
      )}
      {custForm(
        {
          code: 'MALL.APPLY.OMS.EDIT.OMS.BASICINFO.DETAIL',
          dataSource,
          readOnly: true,
        },
        <Form dataSet={otherFormDs} columns={3} className="c7n-pro-vertical-form-display" />
      )}
      <div className="content-box-form">
        <Row className="content-box-item" style={{ display: 'flex' }}>
          <Col style={{ width: 100 }} className="content-box-item-label">
            {intl.get('hzero.common.status').d('状态')}
          </Col>
          <Col style={{ flex: 1 }} className="content-box-item-content">
            <p>
              <Tags
                style={{ display: 'inline-block' }}
                type={status(dataSource.mallManualRequestStatus)}
              >
                {dataSource.mallManualRequestStatusMeaning}
              </Tags>
              {dataSource.denialReason && (
                <Tooltip
                  title={`${intl.get('mallf.myRequest.view.denial.reason').d('拒绝原因')}：${
                    dataSource.denialReason
                  }`}
                  placement="top"
                >
                  <HIcon
                    style={{ marginLeft: '6px', color: '#F56649' }}
                    type="exclamation-circle"
                    size={14}
                  />
                </Tooltip>
              )}
            </p>
          </Col>
        </Row>
      </div>
    </>
  );
}
