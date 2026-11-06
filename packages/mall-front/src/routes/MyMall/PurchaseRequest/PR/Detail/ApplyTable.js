import React, { useMemo, useEffect } from 'react';
import { sum } from 'lodash';
import { DataSet, Table, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';

export default function ApplyTable(props) {
  const { dataSource, custTable } = props;
  const columns = [
    {
      width: 150,
      name: 'productName',
    },
    {
      width: 150,
      name: 'quantity',
      align: 'left',
    },
    {
      width: 150,
      name: 'itemLov',
    },
    {
      width: 150,
      name: 'itemName',
    },
    {
      width: 150,
      name: 'uomLov',
    },
    {
      width: 150,
      name: 'invOrganizationLov',
    },
    {
      width: 150,
      name: 'categoryLov',
    },

    {
      width: 150,
      name: 'costLov',
    },
    {
      width: 150,
      name: 'wbsCodeLov',
    },
    {
      width: 150,
      name: 'neededDate',
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
  ];

  const fields = [
    {
      name: 'companyName',
      type: 'string',
    },
    {
      name: 'companyId',
      type: 'string',
    },
    {
      name: 'productName',
      label: intl.get('mallf.purchaseDetail.view.goodsOfName').d('物资名称'),
    },
    {
      name: 'quantity',
      label: intl.get('mallf.purchaseDetail.view.appliNum').d('申请数量'),
    },
    {
      name: 'itemLov',
      type: 'object',
      label: intl.get('mallf.myRequest.view.item.code').d('物料编码'),
      lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
      ignore: 'always',
      valueField: 'itemCode',
      textField: 'itemCode',
    },
    {
      name: 'itemCode',
      bind: 'itemLov.itemCode',
      label: intl.get('mallf.myRequest.view.item.code').d('物料编码'),
    },
    {
      name: 'itemName',
      bind: 'itemLov.itemName',
      label: intl.get('mallf.myRequest.view.item.name').d('物料名称'),
    },
    {
      name: 'uomLov',
      type: 'object',
      label: intl.get('mallf.myRequest.view.uom').d('单位'),
      lovCode: 'SMDM.DUAL_UOM',
      ignore: 'always',
      valueField: 'uomId',
      textField: 'uomName',
    },
    {
      name: 'uomName',
      type: 'string',
      bind: 'uomLov.uomName',
    },
    {
      name: 'uomId',
      bind: 'uomLov.uomId',
    },
    {
      name: 'neededDate',
      type: 'date',
      label: intl.get(`mallf.myRequest.view.need.date`).d('需求日期'),
    },
    {
      name: 'attachmentUuid',
      label: intl.get('mallf.common.view.attachment.info').d('附件信息'),
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
      name: 'categoryLov',
      type: 'object',
      lovCode: 'SPRM.ITEM_CATEGOR',
      label: intl.get(`mallf.myRequest.view.categoryName`).d('物料分类'),
      textField: 'categoryName',
    },
    {
      bind: 'categoryLov.categoryId',
      name: 'categoryId',
    },
    {
      bind: 'categoryLov.categoryName',
      name: 'categoryName',
    },

    {
      label: intl.get(`mallf.myRequest.model.costCenter`).d('成本中心'),
      name: 'costLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SPRM.COST_CENTER',
      textField: `costName`,
    },
    {
      name: 'costCode',
      bind: 'costLov.costCode',
    },
    {
      name: 'costId',
      bind: 'costLov.costId',
    },
    {
      name: 'costName',
      bind: 'costLov.costName',
    },

    {
      label: intl.get(`mallf.myRequest.model.wbs`).d('WBS元素'),
      name: 'wbsCodeLov',
      type: 'object',
      lovCode: 'SMDM.WBS',
      ignore: 'always',
      valueField: 'wbsId',
      textField: 'wbsName',
    },
    {
      name: 'wbsCode',
      bind: 'wbsCodeLov.wbsCode',
    },
    {
      name: 'wbsId',
      bind: 'wbsCodeLov.wbsId',
    },
    {
      name: 'wbs',
      bind: 'wbsCodeLov.wbsName',
    },
  ];

  const ds = useMemo(() => new DataSet({ paging: false, fields, selection: false }), []);

  useEffect(() => {
    ds.loadData(dataSource);
  }, [dataSource]);

  return (
    <>
      {custTable(
        { code: 'MALL.APPLY.EDIT.APPLYINFO.TABLE', dataSource, readOnly: true },
        <Table scroll={{ x: sum(columns.map((n) => n.width)) }} dataSet={ds} columns={columns} />
      )}
    </>
  );
}
