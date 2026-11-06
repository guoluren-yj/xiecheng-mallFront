/* eslint-disable no-param-reassign */
import { isEmpty } from 'lodash';

import { fetchEmployeeNum, fetchUnit } from '../../services/api';

export const changeOrderData = ({ setOrderData, data }) => {
  fetchEmployeeNum()
    .then((r) => {
      if (!r?.employeeId) {
        setOrderData(data);
        return;
      }
      fetchUnit(r?.employeeId)
        .then((res) => {
          const newData = [...data];
          newData.forEach((order) => {
            console.log('res', res);
            if (!isEmpty(res)) {
              order.attributeBigint30 = res[0]?.unitId;
              order.attributeBigint30Meaning = res[0]?.unitName;
            }
          });
          setOrderData(newData);
        })
        .catch(() => {
          setOrderData(data);
        });
    })
    .catch(() => {
      setOrderData(data);
    });
};
