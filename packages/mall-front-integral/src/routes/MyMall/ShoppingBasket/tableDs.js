import intl from 'utils/intl';

const tableDs = () => ({
  autoQuery: false,
  autoCreate: true,
  selection: 'multiple',
  fields: [
    {
      name: 'basketName',
      label: intl.get('mallf.common.model.basketName').d('购物篮名称'),
    },
    {
      name: 'purchaseQuantity',
      label: intl.get('mallf.common.model.purchaseQuantity').d('商品种数'),
    },
    {
      name: 'productTotalNum',
      label: intl.get('mallf.common.model.productTotalNum').d('商品数量'),
    },
    {
      name: 'marketBasketQuantity',
      type: 'number',
      label: intl.get('mallf.common.model.marketBasketQuantity').d('加购数量'),
      required: true,
      min: 1,
      max: 999999999,
      dynamicProps: {
        disabled: ({ record }) => {
          return !record.selectable;
        },
      },
    },
    {
      name: 'shoppingCartList',
      type: 'object',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        const selectable = record.get('shoppingCartList').every((p) => p.productFlag === 0);
        // eslint-disable-next-line no-param-reassign
        record.selectable = !selectable;
      });
    },
  },
});

export { tableDs };
