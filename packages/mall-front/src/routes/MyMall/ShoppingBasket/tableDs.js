import intl from 'utils/intl';
import { DEFAULT_MAX } from 'utils/constants';

const tableDs = () => ({
  autoQuery: false,
  autoCreate: true,
  selection: false,
  paging: false,
  fields: [
    {
      name: 'shoppingBarName',
      label: intl.get('mallf.shoppingBasket.model.basketName').d('购物篮名称'),
    },
    {
      name: 'purchaseQuantity',
      label: intl.get('mallf.shoppingBasket.model.purchaseQuantity').d('商品种数'),
    },
    {
      name: 'productTotalNum',
      label: intl.get('mallf.shoppingBasket.model.productTotalNum').d('商品数量'),
    },
    {
      name: 'marketBasketQuantity',
      type: 'number',
      label: intl.get('mallf.shoppingBasket.model.marketBasketQuantity').d('加购数量'),
      required: true,
      min: 1,
      max: DEFAULT_MAX,
      computedProps: {
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
