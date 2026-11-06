import { sum } from 'lodash';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

export function tableds() {
  return {
    autoCreate: true,
    paging: false,
    selection: false,
    expandField: 'expanded',
    fields: [
      {
        name: 'productInfo',
        label: intl.get('mallf.myOrder.view.purchase.productInfo').d('采购商品信息'),
      },
      {
        name: 'thisTimeReceiveQuantity',
        label: intl.get(`mallf.myMall.model.accept.quantity`).d('接收数量'),
      },
    ],
  };
}

export function embedTableds({ tableDs, consignmentEntryId }) {
  return {
    autoCreate: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'productInfo',
        label: intl.get('mallf.myOrder.view.receive.productInfo').d('领用商品信息'),
      },
      {
        name: 'skuCode',
        label: intl.get('mallf.myOrder.view.productCode').d('商品编码'),
      },
      {
        name: 'inventoryLov',
        type: 'object',
        label: intl.get(`mallf.common.model.wareHouse`).d('库房'),
        lovCode: 'SMPC.INVENTORY',
        lovPara: {
          tenantId: getCurrentOrganizationId(),
          enabledFlag: 1,
        },
        computedProps: {
          required: ({ record }) => {
            return record.get('quantity') > 0;
          },
        },
      },
      {
        name: 'inventoryId',
        bind: 'inventoryLov.inventoryId',
      },
      {
        name: 'inventoryCode',
        bind: 'inventoryLov.inventoryCode',
      },
      {
        name: 'inventoryName',
        bind: 'inventoryLov.inventoryName',
      },
      {
        name: 'quantity',
        min: 0,
        required: true,
        label: intl.get('mallf.myOrder.view.invNum').d('库存数'),
        validator: () => {
          const currentRecord = tableDs.records?.find((p) => {
            return p.get('consignmentEntryId') === consignmentEntryId;
          });
          if (!currentRecord) return;
          const embedData = currentRecord?.get('ds')?.toData() || [];
          if (
            sum(embedData?.map((p) => +p.quantity)) > currentRecord?.get('thisTimeReceiveQuantity')
          ) {
            return intl.get('mallf.myOrder.view.over.ecceptQuality').d('不能超过此次接收数量');
          } else if (currentRecord?.get('ds')) {
            currentRecord.get('ds').forEach((p) => {
              p.init('quantity', p.get('quantity'));
            });
          }
        },
      },
    ],
  };
}
