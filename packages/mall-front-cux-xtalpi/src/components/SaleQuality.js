import React from 'react';
import { Modal, Table, useDataSet } from 'choerodon-ui/pro';
import HmallConfig from 'utils/api-config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import moment from 'moment';

function SaleDetailModal(props) {
  const { skuId } = props || {};
  const ds = useDataSet(
    () => ({
      autoQuery: true,
      selection: false,
      pageSize: 20,
      queryFields: [
        {
          name: 'unit',
          type: 'object',
          lovCode: 'SMAL.UNIT',
          label: intl.get('mcux.common.xtalpi.view.unitName').d('部门名称'),
          ignore: 'always',
        },
        { name: 'purSpuId', bind: 'unit.purUnitId' },
        {
          name: 'orderPerson',
          type: 'object',
          lovCode: 'HIAM.USER_ACCOUNT',
          label: intl.get('mallf.common.cart.orderPerson').d('下单人'),
          ignore: 'always',
        },
        { name: 'buyerId', bind: 'orderPerson.id' },
        {
          name: 'time',
          type: 'dateTime',
          label: intl.get('mallf.common.order.complete.time').d('下单时间'),
          range: ['startDate', 'endDate'],
          ignore: 'always',
        },
        { name: 'startDate', bind: 'time.startDate', defaultValue: moment().subtract(1, 'year') },
        { name: 'endDate', bind: 'time.endDate', defaultValue: moment() },
      ],
      fields: [
        {
          name: 'purUnitName',
          label: intl.get('mcux.common.xtalpi.view.unit').d('下单人所属部门'),
        },
        {
          name: 'buyerName',
          label: intl.get('mallf.common.cart.orderPerson').d('下单人'),
        },
        {
          name: 'creationDate',
          label: intl.get('mallf.common.order.complete.time').d('下单时间'),
        },
        {
          name: 'quantity',
          label: intl.get('mallf.common.view.num').d('数量'),
        },
      ],
      transport: {
        read: ({ data }) => {
          return {
            url: `${
              HmallConfig.apiGateway
            }/marmot/v1/${getCurrentOrganizationId()}/marmot-api/am4RGbSebEK04IjeibviaNicM55Tb7TZatic2X4dvAiaBJKk`,
            data: { skuId, ...data },
          };
        },
      },
    }),
    []
  );
  const columns = [
    {
      name: 'purUnitName',
      width: 160,
    },
    {
      name: 'buyerName',
      width: 160,
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'quantity',
      width: 180,
    },
  ];
  return <Table columns={columns} dataSet={ds} style={{ maxHeight: 'calc(100vh - 256px)' }} />;
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
                value:
                  Math.floor(productSaleQuantity / 10000) > 999
                    ? 999
                    : Math.floor(productSaleQuantity / 10000),
              })
              .d(
                `${
                  Math.floor(productSaleQuantity / 10000) > 999
                    ? 999
                    : Math.floor(productSaleQuantity / 10000)
                }万+`
              )
          : Math.round(productSaleQuantity || 0)}
      </div>
    </div>
  );
}
