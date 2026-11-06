import React from 'react';
import { Modal, Table, useDataSet } from 'choerodon-ui/pro';
import HmallConfig from 'utils/api-config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

function SaleDetailModal(props) {
  const { skuId } = props || {};
  const ds = useDataSet(
    () => ({
      autoQuery: true,
      selection: false,
      pageSize: 20,
      fields: [
        {
          name: 'companyName',
          label: '采购公司',
        },
        {
          name: 'invOrganizationName',
          label: intl.get(`mallf.common.model.inventoryOrg`).d('库存组织'),
        },
        {
          name: 'buyerName',
          label: intl.get('mallf.common.cart.orderPerson').d('下单人'),
        },
        {
          name: 'quantity',
          label: intl.get('mallf.common.view.num').d('数量'),
        },
        {
          name: 'uomName',
          label: intl.get('mallf.common.view.uom').d('单位'),
        },
        {
          name: 'creationDate',
          label: intl.get('mallf.common.order.complete.time').d('下单时间'),
        },
        {
          name: 'itemCode',
          label: intl.get('mallf.productDetail.view.item.code').d('物料编码'),
        },
        {
          name: 'itemName',
          label: intl.get('mallf.common.view.item.name').d('物料名称'),
        },
      ],
      transport: {
        read: ({ data }) => {
          return {
            url: `${
              HmallConfig.apiGateway
            }/marmot/v1/${getCurrentOrganizationId()}/marmot-api/5MYgEVTtM62zfZMlUibu6Os0asrxDHPGh7YcDzVVVfZg`,
            data: { skuId, ...data },
          };
        },
      },
    }),
    []
  );
  const columns = [
    {
      name: 'companyName',
      width: 180,
    },
    {
      name: 'invOrganizationName',
      width: 160,
    },
    {
      name: 'buyerName',
      width: 120,
    },
    {
      name: 'quantity',
      width: 80,
    },
    {
      name: 'uomName',
      width: 120,
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'itemCode',
      width: 160,
    },
    {
      name: 'itemName',
      width: 160,
    },
  ];
  return (
    <>
      <div style={{ fontSize: '12px', margin: '8px 0' }}>
        历史销量展示数量为下单数量，列表中数量为已收货确认的订单数量
      </div>
      <Table columns={columns} dataSet={ds} style={{ maxHeight: 'calc(100vh - 256px)' }} />
    </>
  );
}

export default function SaleQuality({ productSaleQuantity, skuId }) {
  const openSaleModal = () => {
    return Modal.open({
      destroyOnClose: true,
      mask: true,
      style: { width: 780 },
      movable: false,
      autoCenter: true,
      drawer: true,
      cancelButton: false,
      okText: intl.get('hzero.common.btn.close').d('关闭'),
      title: intl.get('mcux.common.xtalpi.view.saleDetail').d('商品销量明细'),
      children: <SaleDetailModal skuId={skuId} />,
    });
  };
  const saleQuantity =
    Math.floor(productSaleQuantity / 10000) > 999 ? 999 : Math.floor(productSaleQuantity / 10000);
  return (
    <div className="buy-quality">
      <div
        className="quality-header"
        title={intl.get('mallf.productDetail.view.history.saleQuality').d('历史销量')}
      >
        {intl.get('mallf.productDetail.view.history.saleQuality').d('历史销量')}
      </div>
      <div
        className="quality-num text-overflow"
        style={{ cursor: 'pointer' }}
        title={Math.round(productSaleQuantity)}
        onClick={() => {
          openSaleModal();
        }}
      >
        {productSaleQuantity > 10000
          ? intl
              .get('mallf.productDetail.view.saleQuality.w', {
                value: saleQuantity,
              })
              .d(`${saleQuantity}万+`)
          : Math.round(productSaleQuantity || 0)}
      </div>
    </div>
  );
}
