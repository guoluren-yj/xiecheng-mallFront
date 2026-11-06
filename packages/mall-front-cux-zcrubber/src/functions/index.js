import React from 'react';
import Swal from 'components/swal';
import { Modal, DataSet, Table } from 'choerodon-ui/pro';

function confirmSwal({ orderData, submitOrderList, confirmMessage }) {
  const stockProducts = orderData.reduce((pre, order) => {
    return [
      ...pre,
      ...order.shoppingCartDTOList.filter((product) => product.scuxTotalStockQuantity),
    ];
  }, []);
  if (!stockProducts.length) {
    Swal(confirmMessage, true).then((result) => {
      if (result.value) submitOrderList();
    });
  } else {
    const ds = new DataSet({
      data: stockProducts,
      selection: false,
      paging: false,
      fields: [
        {
          name: 'productName',
          label: '商品名称',
        },
        {
          name: 'scuxTotalStockQuantity',
          label: '库存总数',
        },
        {
          name: 'scuxStockQuantity',
          label: '仓库库存数',
        },
        {
          name: 'scuxShipQuantity',
          label: '在途库存数',
        },
      ],
    });
    const columns = [
      {
        name: 'productName',
      },
      {
        name: 'scuxTotalStockQuantity',
      },
      {
        name: 'scuxStockQuantity',
      },
      {
        name: 'scuxShipQuantity',
      },
    ];
    window.budgetWarnModal = Modal.open({
      title: '提示',
      destroyOnClose: true,
      mask: true,
      closable: true,
      style: { width: 560 },
      children: (
        <>
          <div style={{ marginBottom: 10, marginTop: -5 }}>
            以下商品存在库存，请确认是否继续购买！
          </div>
          <Table dataSet={ds} columns={columns} />
        </>
      ),
      onOk: () => {
        submitOrderList();
      },
    });
  }
}

export { confirmSwal };
