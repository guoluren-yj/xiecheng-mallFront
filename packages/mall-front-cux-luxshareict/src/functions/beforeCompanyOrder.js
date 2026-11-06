/* eslint-disable no-param-reassign */
import moment from 'moment';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { timestampToTime } from 'utils/utils';

// export function setCustomizeModalInitVal({ product }) {
//   if (product.DS) {
//     product.DS.set('attributeVarchar10', product.priceHiddenFlag === 1 ? 'Y' : 'N');
//   }
// }

export const changeOrderData = ({ setOrderData, data }) => {
  const newData = [...data];
  newData.forEach((order) => {
    order.shoppingCartDTOList.forEach((product) => {
      product.neededDate = moment(timestampToTime())
        .add(product.deliveryCycle ? Number(product.deliveryCycle) + 3 : 10, 'days')
        .format(DEFAULT_DATETIME_FORMAT);
      product.attributeVarchar10 = product.priceHiddenFlag === 1 ? 'Y' : 'N';
    });
  });
  setOrderData(newData);
};
