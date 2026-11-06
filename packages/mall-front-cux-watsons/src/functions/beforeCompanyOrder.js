/* eslint-disable no-param-reassign */
import moment from 'moment';

import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { timestampToTime } from 'utils/utils';

export const changeOrderData = ({ setOrderData, data }) => {
  const newData = [...data];
  newData.forEach((order) => {
    order.neededDate = timestampToTime();
    order.shoppingCartDTOList.forEach((product) => {
      product.neededDate = product.deliveryCycle
        ? moment(timestampToTime())
            .add(product.deliveryCycle, 'days')
            .format(DEFAULT_DATETIME_FORMAT)
        : timestampToTime();
    });
  });
  setOrderData(newData);
};
