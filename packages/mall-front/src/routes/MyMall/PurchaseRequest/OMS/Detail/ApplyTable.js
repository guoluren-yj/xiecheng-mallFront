import React, { useMemo, useEffect } from 'react';
import { sum } from 'lodash';
import { DataSet, Table, Attachment } from 'choerodon-ui/pro';

import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';

export default function ApplyTable(props) {
  const { dataSource, custTable } = props;
  const { doubleUomFlag } = getUserConfigInfo();
  const columns = [
    {
      name: 'entryCode',
      width: 50,
    },
    {
      name: 'goodsName',
      width: 80,
    },
    doubleUomFlag && {
      name: 'packageQuantity',
      width: 80,
    },
    {
      name: 'requestQuantity',
      width: 80,
    },
    {
      name: 'itemCodeLov',
      width: 100,
    },
    {
      name: 'itemName',
      width: 100,
    },
    {
      name: 'categoryLov',
      width: 100,
    },
    doubleUomFlag && {
      name: 'customUomLov',
      width: 80,
    },
    {
      name: 'uomLov',
      width: 80,
    },
    {
      name: 'needByDate',
      width: 120,
    },
    doubleUomFlag && {
      name: 'packageUnitPrice',
      width: 100,
    },
    {
      name: 'predictUnitPrice',
      width: 100,
    },
    {
      name: 'predictEntryAmount',
      width: 100,
    },
    {
      name: 'addressLov',
      width: 240,
    },
    {
      name: 'remark',
      width: 100,
    },
    {
      name: 'invOrganizationLov',
      width: 100,
    },
    {
      name: 'purchaseAgentName',
      width: 100,
    },
    {
      name: 'attachmentUuid',
      width: 150,
      renderer: ({ record }) => {
        const attProps = {
          newLine: true,
          name: 'attachmentUuid',
          sortable: true,
          bucketName: 'private-bucket',
          bucketDirectory: 'mall-front',
          viewMode: 'popup',
          value: record.get('attachmentUuid'),
          onChange: () => {},
          style: { paddingLeft: 0 },
          readOnly: true,
        };
        return <Attachment {...attProps} />;
      },
    },
  ].filter((n) => !!n);

  const fields = [
    {
      name: 'entryCode',
      type: 'string',
      label: intl.get('mallf.myRequest.view.lineNum').d('行号'),
    },
    {
      name: 'companyName',
      type: 'string',
    },
    {
      name: 'companyId',
      type: 'string',
    },
    {
      name: 'goodsName',
      label: intl.get('mallf.purchaseDetail.view.goodsOfName').d('物资名称'),
    },
    {
      name: 'packageQuantity',
      label: intl.get('mallf.purchaseDetail.view.quantity').d('数量'),
    },
    {
      name: 'requestQuantity',
      label: intl.get('mallf.purchaseDetail.view.basicNum').d('基本数量'),
      computedProps: {
        label: () =>
          doubleUomFlag
            ? intl.get('mallf.purchaseDetail.view.basicNum').d('基本数量')
            : intl.get('mallf.purchaseDetail.view.quantity').d('数量'),
      },
    },
    {
      name: 'customUomLov',
      label: intl.get('mallf.purchaseDetail.view.uom').d('单位'),
      type: 'object',
      required: true,
      ignore: 'always',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      textField: 'uomCodeAndName',
    },
    {
      name: 'customUom',
      bind: 'customUomLov.uomCodeAndName',
    },
    {
      name: 'customUomId',
      bind: 'customUomLov.uomId',
    },
    {
      name: 'customUomCode',
      bind: 'customUomLov.uomCode',
    },
    {
      name: 'customUomName',
      bind: 'customUomLov.uomName',
    },
    {
      name: 'uomLov',
      type: 'object',
      label: intl.get('mallf.purchaseDetail.view.basicUom').d('基本单位'),
      lovCode: 'SMDM.DUAL_UOM',
      ignore: 'always',
      valueField: 'uomId',
      textField: 'uomCodeAndName',
      computedProps: {
        label: () =>
          doubleUomFlag
            ? intl.get('mallf.purchaseDetail.view.basicUom').d('基本单位')
            : intl.get('mallf.purchaseDetail.view.uom').d('单位'),
      },
    },
    {
      name: 'uomCodeAndName',
      type: 'string',
      bind: 'uomLov.uomCodeAndName',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
    },
    {
      name: 'uomCode',
      bind: 'uomLov.uomCode',
    },
    {
      name: 'needByDate',
      type: 'date',
      min: moment(new Date()).format(DEFAULT_DATE_FORMAT),
      defaultValue: moment(new Date()),
      label: intl.get(`mallf.myRequest.view.need.date`).d('需求日期'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('mallf.common.view.attachment.info').d('附件信息'),
    },
    {
      name: 'packageUnitPrice',
      label: intl.get('mallf.purchaseDetail.view.estimated.unit.price').d('预估单价（含税）'),
    },
    {
      name: 'predictUnitPrice',
      label: intl
        .get('mallf.purchaseDetail.view.estimated.unit.priceBasic')
        .d('预估单价（含税）- 基本单位'),
      computedProps: {
        label: () =>
          doubleUomFlag
            ? intl
                .get('mallf.purchaseDetail.view.estimated.unit.priceBasic')
                .d('预估单价（含税）- 基本单位')
            : intl.get('mallf.purchaseDetail.view.estimated.unit.price').d('预估单价（含税）'),
      },
    },
    {
      name: 'predictEntryAmount',
      disabled: true,
      label: intl.get('mallf.myRequest.view.line.amount.price').d('行金额（含税）'),
    },
    {
      name: 'receiverAddressId',
    },
    {
      name: 'addressLov',
      type: 'object',
      valueField: 'addressId',
      textField: 'address',
      label: intl.get(`mallf.myRequest.model.receive.info`).d('收货信息'),
      lovCode: '',
      ignore: 'always',
    },
    {
      name: 'addressId',
      bind: 'addressLov.addressId',
    },
    {
      name: 'address',
      bind: 'addressLov.address',
    },
    {
      name: 'regionId',
      bind: 'addressLov.regionId',
    },
    {
      name: 'mobilePhone',
      bind: 'addressLov.mobilePhone',
    },
    {
      name: 'email',
      bind: 'addressLov.email',
    },
    {
      name: 'telphone',
      bind: 'addressLov.telphone',
    },
    {
      name: 'contactName',
      bind: 'addressLov.contactName',
    },
    {
      name: 'belongType',
      bind: 'addressLov.belongType',
    },
    {
      name: 'invOrganizationLov',
      type: 'object',
      label: intl.get('mallf.myRequest.model.inventoryOrg').d('库存组织'),
      lovCode: 'SPFM.USER_AUTH.INVORG',
      textField: 'organizationName',
    },
    {
      bind: 'invOrganizationLov.organizationName',
      name: 'invOrganizationName',
    },
    {
      bind: 'invOrganizationLov.organizationId',
      name: 'invOrganizationId',
    },
    {
      bind: 'invOrganizationLov.organizationCode',
      name: 'invOrganizationCode',
    },
    {
      name: 'purchaseAgentName',
      label: intl.get('mallf.myRequest.model.purchaseAgent').d('采购员'),
    },
    {
      name: 'remark',
      type: 'object',
      label: intl.get(`mallf.myRequest.model.remark`).d('备注'),
    },
    {
      name: 'operate',
      label: intl.get('hzero.common.action').d('操作'),
    },
    {
      name: 'companyId',
    },
    {
      name: 'itemCodeLov',
      type: 'object',
      label: intl.get(`mallf.myRequest.view.item.code`).d('物料编码'),
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      ignore: 'always',
      valueField: 'itemCode',
      textField: 'itemCode',
    },
    {
      name: 'itemName',
      label: intl.get('mallf.myRequest.view.item.name').d('物料名称'),
      bind: 'itemCodeLov.itemName',
    },
    {
      name: 'itemCode',
      bind: 'itemCodeLov.itemCode',
    },
    {
      name: 'itemId',
      bind: 'itemCodeLov.itemId',
    },

    {
      name: 'categoryLov',
      type: 'object',
      label: intl.get('mallf.myRequest.view.item.categoryName').d('物料分类'),
      lovCode: 'SPRM.ITEM_CATEGOR',
      ignore: 'always',
      valueField: 'categoryId',
      textField: 'categoryName',
    },
    {
      name: 'categoryId',
      bind: 'categoryLov.categoryId',
    },
    {
      name: 'categoryName',
      bind: 'categoryLov.categoryName',
    },
  ];

  const ds = useMemo(() => new DataSet({ paging: false, fields, selection: false }), []);

  useEffect(() => {
    ds.loadData(dataSource);
  }, [dataSource]);

  return (
    <>
      {custTable(
        { code: 'MALL.APPLY.OMS.EDIT.APPLYINFO', dataSource, readOnly: true },
        <Table scroll={{ x: sum(columns.map((n) => n.width)) }} dataSet={ds} columns={columns} />
      )}
    </>
  );
}
