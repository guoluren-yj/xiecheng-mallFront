import uuid from 'uuid/v4';
import { math } from 'choerodon-ui/dataset';

import { getIsNewCartFlag, getDoubleUomFlag, hasDoubleUomFlag } from 'utils/configUtils';
import { omsServiceName } from 'utils/api-config';
import { getOrganizationId, getPrecision } from 'utils/utils';
import { numberChange } from 'utils/precision';
import intl from 'utils/intl';
import cuxFn from '@/cuxTools/cuxFn';

export default function ds({ asnLineIds }) {
  const doubleUomFlag = getDoubleUomFlag();
  const organizationId = getOrganizationId();
  return {
    autoQuery: true,
    selection: false,
    paging: false,
    forceValidate: true,
    fields: [
      {
        name: 'srmConsignmentCode',
        label: intl.get('mallf.myOrder.view.delivery.noteNo').d('送货单号'),
      },
      {
        name: 'productInfo',
        label: intl.get(`mallf.myOrder.view.productInformation`).d('商品信息'),
      },
      {
        name: 'sentQuantity',
        label: intl.get('mallf.myOrder.view.delivery.number').d('发货数量'),
      },
      {
        name: 'sentPackageQuantity',
        label: intl.get('mallf.myOrder.view.delivery.number').d('发货数量'),
      },
      {
        name: 'receiveQuantity',
        label: intl.get('mallf.myOrder.view.received.several').d('已接收数'),
      },
      {
        name: 'receivePackageQuantity',
        label: intl.get('mallf.myOrder.view.received.several').d('已接收数'),
      },
      {
        name: 'waitingReceiveQuantityMeaning',
        label: intl.get('mallf.myOrder.view.residual.reception').d('剩余接收数'),
      },
      {
        name: 'waitingReceivePackageQuantityMeaning',
        label: intl.get('mallf.myOrder.view.residual.reception').d('剩余接收数'),
      },
      {
        name: 'quantity',
        required: true,
        label: doubleUomFlag
          ? intl.get('mallf.myOrder.view.incoming.quantity').d('此次接收基本数量')
          : intl.get('mallf.myOrder.view.incoming.packageQuantity').d('此次接收数量'),
        computedProps: {
          min: ({ record }) => {
            return getPrecision(record.get('uomPrecision') || 0);
          },
          max: ({ record }) => {
            return record.get('waitingReceiveQuantity');
          },
        },
      },
      {
        name: 'packageQuantity',
        required: doubleUomFlag,
        label: intl.get('mallf.myOrder.view.incoming.packageQuantity').d('此次接收数量'),
        dynamicProps: {
          min: ({ record }) => {
            const { uomId, customUomId, customQuantity, skuType } = record.get([
              'uomId',
              'customUomId',
              'customQuantity',
              'skuType',
            ]);
            const flag =
              hasDoubleUomFlag({ uomId, customUomId, customQuantity }) && skuType !== 'CUSTOM';
            return (
              doubleUomFlag && (flag ? 0 : getPrecision(record.get('customUomPrecision') || 0))
            );
          },
          max: ({ record }) => {
            return doubleUomFlag && record.get('waitingReceivePackageQuantity');
          },
        },
      },
      {
        name: 'inventory',
        type: 'object',
        label: intl.get(`mallf.common.model.wareHouse`).d('库房'),
        lovCode: 'SPFM.USER_AUTH.INVORG',
      },
      {
        bind: 'inventory.inventoryId',
        name: 'inventoryId',
      },
      {
        bind: 'inventory.inventoryName',
        name: 'inventoryName',
      },
      {
        bind: 'inventory.inventoryCode',
        name: 'inventoryCode',
      },
      {
        name: 'creationDate',
        label: intl.get('mallf.myOrder.view.orderoftime').d('下单时间'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('mallf.myOrder.view.supplier').d('供应商'),
      },
      {
        name: 'remark',
        rows: 1,
        label: intl.get('hzero.common.button.remark').d('备注'),
      },
      {
        name: 'attachmentUuid',
        type: 'attachment',
        label: intl.get(`mallf.myOrder.view.common.annex`).d('附件'),
      },
    ],
    transport: {
      read: () => ({
        url: `/${omsServiceName}/v1/${organizationId}/consignment-entrys/confirm-consignment`,
        method: 'POST',
        data: asnLineIds,
        transformResponse: (data) => {
          try {
            return JSON.parse(data)
              .map((product, index) => ({
                ...product,
                quantity: product.waitingReceiveQuantity,
                packageQuantity: product.waitingReceivePackageQuantity,
                trxLineNum: index + 1,
                checked: true,
                attachmentUuid: product.attachmentUuid || uuid(),
              }))
              .filter((p) => p.waitingReceiveQuantity !== 0);
          } catch (e) {
            return [];
          }
        },
      }),
    },
    events: {
      load({ dataSet }) {
        const hasReceiveProduct = cuxFn({
          name: 'OmsAcceptModal-fn-hasReceiveProduct',
        })(
          () => getIsNewCartFlag() && dataSet.toData().some((p) => p.receiveAndStorageFlag === 1)
        )();
        dataSet.setState('hasReceiveProduct', hasReceiveProduct);
        if (hasReceiveProduct) {
          dataSet.setState('checkReceive', true);
        }
      },
      update: ({ record, name, value }) => {
        if (name === 'quantity' && !doubleUomFlag) {
          record.set('packageQuantity', value);
        }
        if (name === 'packageQuantity' && +value !== 0 && doubleUomFlag) {
          const customQuantity = +record.get('customQuantity');
          const quantity = math.multipliedBy(+value, customQuantity);
          const newQuantity = numberChange({
            value: quantity,
            name: 'quantity',
            record,
            precision: +record.get('uomPrecision'),
          });
          record.set('quantity', newQuantity);
        }
      },
    },
  };
}
