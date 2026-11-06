import React, { useMemo } from 'react';
import intl from 'utils/intl';
import { Tooltip, Modal, Table, useDataSet } from 'choerodon-ui/pro';
import HmallConfig from 'utils/api-config';
import { getCurrentOrganizationId, getPrimaryColor } from 'utils/utils';

function ErpListModal(props) {
  const { itemCode } = props || {};
  const ds = useDataSet(
    () => ({
      autoQuery: true,
      selection: false,
      pageSize: 100,
      paging: false,
      fields: [
        {
          name: 'WERKS',
          label: '工厂代码',
        },
        {
          name: 'NAME1',
          label: '工厂名称',
        },
        {
          name: 'LGORT',
          label: '库存地点代码',
        },
        {
          name: 'LGOBE',
          label: '库存地点',
        },
        {
          name: 'LABST',
          label: '数量',
        },
      ],
      transport: {
        read: () => {
          return {
            url: `${
              HmallConfig.apiGateway
            }/marmot/v1/${getCurrentOrganizationId()}/marmot-api/uZnQns2UUEp1mExG5apBEQS4nO0gjn8Vv9bS6FPRXYM`,
            data: [{ itemCode }],
            transformResponse: (data) => JSON.parse(data)?.ITEM,
          };
        },
      },
    }),
    []
  );
  const columns = [
    {
      name: 'WERKS',
      width: 100,
    },
    {
      name: 'NAME1',
      width: 180,
    },
    {
      name: 'LGORT',
      width: 130,
    },
    {
      name: 'LGOBE',
      width: 160,
    },
    {
      name: 'LABST',
      width: 120,
    },
  ];
  return (
    <Table
      columns={columns}
      dataSet={ds}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
      customizable
      customizedCode
    />
  );
}

export default function RenderItemCode({ itemCode, itemName }) {
  const flag = useMemo(() => itemCode && itemName, [itemCode, itemName]);
  function showERPStock() {
    if (!flag) {
      return;
    }
    Modal.open({
      destroyOnClose: true,
      mask: true,
      style: { width: 742 },
      movable: false,
      closable: false,
      drawer: true,
      title: `${itemCode}-${itemName}`,
      cancelButton: false,
      okText: intl.get('hzero.common.model.button.close').d('关闭'),
      children: <ErpListModal itemCode={itemCode} />,
    });
  }

  return (
    <Tooltip
      placement="top"
      title={`${intl.get('mallf.common.view.item.code').d('物料编码')} : ${itemCode}`}
    >
      <span
        onClick={() => {
          showERPStock();
        }}
        className="cart-pro-item-code"
        style={{ cursor: 'pointer', color: flag ? getPrimaryColor() : '' }}
      >
        {itemCode}
      </span>
    </Tooltip>
  );
}
