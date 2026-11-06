import React, { useEffect, useMemo } from 'react';
import { Row, Col } from 'choerodon-ui';
import { DataSet, Form, Output, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import Tags from 'components/Tag';
import { getOrganizationId } from 'utils/utils';

export default function BaseInfo(props) {
  const { custForm, dataSource, status } = props;
  const fields = [
    {
      name: 'purchaseHeaderNum',
      type: 'string',
      label: intl.get('mallf.myRequest.view.mallRequset.number').d('商城申请号'),
    },
    {
      name: 'prNum',
      type: 'string',
      label: intl.get('mallf.myRequest.model.purchaseApplicationNum').d('采购申请号'),
    },
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
      name: 'companyId',
      type: 'string',
    },
    {
      bind: 'companyLov.companyName',
      name: 'companyName',
      type: 'string',
    },

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
      name: 'purchaseOrgLov',
      type: 'object',
      textField: 'organizationName',
      valueField: 'purchaseOrgId',
      lovCode: 'HPFM.PURCHASE_ORGANIZATION_M',
      label: intl.get('mallf.myRequest.model.purchaseOrg').d('采购组织'),
    },
    {
      bind: 'purchaseOrgLov.purchaseOrgId',
      name: 'purchaseOrgId',
      type: 'string',
    },
    {
      bind: 'purchaseOrgLov.organizationName',
      name: 'purchaseOrgName',
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
      name: 'purchaseAgentName',
      type: 'string',
    },
    {
      bind: 'purchaseAgentLov.purchaseAgentId',
      name: 'purchaseAgentId',
      type: 'string',
    },

    {
      name: 'prRequestedName',
      type: 'string',
      label: intl.get('mallf.myRequest.model.application.person').d('申请人'),
    },
    {
      name: 'requestedBy',
      type: 'string',
    },
    {
      name: 'requestDate',
      type: 'date',
      label: intl.get('mallf.myRequest.model.application.date').d('申请日期'),
    },
    {
      name: 'manualRequestTypeSelect',
      type: 'object',
      label: intl.get('mallf.myRequest.model.application.type').d('申请类型'),
    },
    {
      name: 'prTypeCode',
      bind: 'manualRequestTypeSelect.prTypeCode',
    },
    {
      name: 'prTypeName',
      bind: 'manualRequestTypeSelect.meaning',
    },
    {
      name: 'prTypeId',
      bind: 'manualRequestTypeSelect.value',
    },
    {
      name: 'receiverAddressId',
      type: 'string',
    },
    {
      name: 'addressLov',
      type: 'object',
      valueField: 'addressId',
      textField: 'address',
      label: intl.get(`mallf.myRequest.model.receive.info`).d('收货信息'),
      lovCode: '',
    },
    {
      name: 'receiverAddressId',
      type: 'string',
      bind: 'addressLov.addressId',
    },
    {
      name: 'receiverAddressName',
      type: 'string',
      bind: 'addressLov.address',
    },
    {
      name: 'receiverRegionId',
      type: 'string',
      bind: 'addressLov.regionId',
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
      name: 'attachmentUuid',
      type: 'string',
      label: intl.get('mallf.common.view.attachment.info').d('附件信息'),
    },
  ];
  const initFormDs = useMemo(() => new DataSet({ fields }), []);
  useEffect(() => {
    initFormDs.loadData([dataSource]);
  }, [dataSource]);

  const attProps = {
    newLine: true,
    name: 'attachmentUuid',
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
          code: 'MALL.APPLY.EDIT.BASICINFO',
          dataSource,
          readOnly: true,
        },
        <Form dataSet={initFormDs} columns={3} className="c7n-pro-vertical-form-display">
          <Output name="manualRequestTypeSelect" />
          <Output name="companyLov" />
          <Output name="ouLov" />
          <Output name="purchaseOrgLov" />
          <Output name="purchaseAgentLov" />
          <Output name="requestDate" />
          <Output name="prRequestedName" />
          <Output name="addressLov" />
          <Output name="remark" newLine colSpan={2} />
          <Output
            newLine
            name="attachmentUuid"
            renderer={() => {
              return <Attachment {...attProps} />;
            }}
          />
        </Form>
      )}
      <div className="content-box-form">
        <Row className="content-box-item" style={{ display: 'flex' }}>
          <Col style={{ width: 100 }} className="content-box-item-label">
            {intl.get('hzero.common.status').d('状态')}
          </Col>
          <Col style={{ flex: 1 }} className="content-box-item-content">
            <p>
              <Tags style={{ display: 'inline-block' }} type={status(dataSource.prStatusCode)}>
                {dataSource.prStatusMeaning}
              </Tags>
            </p>
          </Col>
        </Row>
      </div>
    </>
  );
}
