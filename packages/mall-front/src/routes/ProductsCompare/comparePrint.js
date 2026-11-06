import React, { useMemo, useEffect } from 'react';
import { Modal, DataSet, Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import PrintProButton from 'components/PrintProButton';
import { getCurrentOrganizationId } from 'utils/utils';

function ComparePrintDoc({ data }) {
  const initTableDs = useMemo(() => {
    return new DataSet({
      selection: false,
      paging: false,
      fields: [
        {
          label: intl.get('mallf.myOrder.view.productCode').d('商品编码'),
          name: 'productNum',
        },
        {
          label: intl.get('mallf.myOrder.view.productName').d('商品名称'),
          name: 'productName',
        },
        {
          label: intl.get(`mallf.common.model.unitPrice`).d('单价(含税)'),
          name: 'priceMeaning',
        },
        {
          label: intl.get('mallf.common.view.uom').d('单位'),
          name: '000000000005',
        },
        {
          label: intl.get('mallf.myOrder.view.supplier').d('供应商'),
          name: 'supplierCompanyName',
        },
        {
          label: intl.get(`mallf.productDetail.view.brand`).d('品牌'),
          name: '000000000001',
        },
        {
          label: intl.get(`mallf.productAccept.model.productAccept.model`).d('型号'),
          name: '000000000002',
        },
        {
          label: intl.get(`mallf.productDetail.view.taxRate`).d('税率'),
          name: '000000000008',
        },
      ],
    });
  }, []);

  useEffect(() => {
    // 处理规格属性字段
    const newData = data.map((d) =>
      d?.productSkuAttrDTOS.reduce((pre, cur) => ({ [cur.attrCode]: cur.description, ...pre }), d)
    );
    initTableDs.loadData(newData);
  }, []);

  const tableColumns = [
    {
      name: 'productNum',
      width: 140,
    },
    {
      name: 'productName',
      width: 250,
    },
    {
      name: 'priceMeaning',
      width: 100,
      align: 'right',
      renderer: ({ record }) =>
        record.get('currencySymbol') + (record.get('priceMeaning') || record.get('price')),
    },
    {
      name: '000000000005',
      width: 90,
    },
    {
      name: 'supplierCompanyName',
      width: 190,
    },
    {
      name: '000000000001',
      width: 90,
    },
    {
      name: '000000000002',
      width: 90,
    },
    {
      name: '000000000008',
      width: 90,
      align: 'right',
    },
  ];

  return (
    <Table
      columns={tableColumns}
      dataSet={initTableDs}
      style={{ maxHeight: 'calc(100vh - 160px)' }}
    />
  );
}

export default function openPrint(props) {
  const data = props.data?.map((d) => ({
    skuId: d.productId,
    printPrice: d.currencySymbol + (d.priceMeaning || d.price),
  }));
  const modal = Modal.open({
    title: intl.get('mallf.productsCompare.view.print.comparePriceDoc').d('打印比价单'),
    destroyOnClose: true,
    mask: true,
    drawer: true,
    closable: true,
    style: { width: 1090 },
    children: <ComparePrintDoc modal={modal} {...props} />,
    footer: (okBtn, cancelBtn) => (
      <div>
        <PrintProButton
          data={data}
          buttonProps={{
            color: 'primary',
            icon: '',
            type: 'c7n-pro',
          }}
          requestUrl={`/smpc/v1/${getCurrentOrganizationId()}/sku-info-print/print-compare-sku-info/token`}
          method="POST"
        />
        {cancelBtn}
      </div>
    ),
  });
}
