import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

export function initOrderData({ data = [], setOrderData }) {
  const newDate = moment().add(10, 'days').format(DEFAULT_DATETIME_FORMAT);
  const newData = data.map((order) => {
    const newDto = order.shoppingCartDTOList.map((n) => ({
      ...n,
      neededDate: newDate,
    }));
    return {
      ...order,
      neededDate: newDate,
      shoppingCartDTOList: newDto,
    };
  });
  setOrderData(newData);
}

export function filterInvoice({ res, paramsMap }) {
  return (
    Object.keys(res)?.reduce((p, c) => {
      const arr =
        res[c]?.map((r) => {
          return {
            valueType: paramsMap[c]?.valueType,
            valueCode: r.value,
            valueName: r.meaning,
          };
        }) || [];
      return [...p, ...arr];
    }, []) || []
  ).filter((i) => !(i.valueType === 'INVOICE_TYPE' && i.valueCode === '2'));
}
