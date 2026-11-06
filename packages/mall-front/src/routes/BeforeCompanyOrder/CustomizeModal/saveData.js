import { isEmpty } from 'lodash';
import filterProps from './filterProps';

/* eslint-disable no-param-reassign */
export default function handleOk(params) {
  const {
    type,
    orderData,
    record,
    fields: f,
    orderIndex,
    productIndex,
    setVisible,
    setOrderData,
    code,
  } = params;
  const newOrderData = [...orderData];
  record.validate().then((res) => {
    const currentData = record.toData();
    const fields = f.filter((p) => p.visible === 1);
    if (currentData.DS) delete currentData.DS;
    if (res) {
      // 保存
      newOrderData[orderIndex].shoppingCartDTOList[productIndex] = {
        ...currentData,
        ...newOrderData[orderIndex].shoppingCartDTOList[productIndex],
        DS: newOrderData[orderIndex].shoppingCartDTOList[productIndex].DS,
        error: false,
      };
      fields.forEach((config) => {
        const { fieldCode, fieldType, paramList = [] } = config;
        if (
          !(
            isEmpty(paramList) ||
            (!paramList.some((p) => p.paramType === 'self') &&
              paramList
                .filter((p) => p.paramType === 'unit')
                .every((p) => p.paramUnitCode !== code))
          )
        ) {
          if (filterProps.indexOf(fieldCode) === -1 && fieldType === 'LOV') {
            filterProps.push(fieldCode);
            filterProps.push(fieldCode.replace('Lov', ''));
            filterProps.push(fieldCode.replace('Lov', 'Meaning'));
          } else if (['TL_EDITOR', 'SELECT', 'EMPTY'].includes(fieldType)) {
            filterProps.push(fieldCode);
          }
        }
        if (newOrderData[orderIndex].shoppingCartDTOList[productIndex]?.DS) {
          newOrderData[orderIndex].shoppingCartDTOList[productIndex].DS.set(
            fieldCode,
            currentData[fieldCode]
          );
        }
      });
      if (type) {
        // 应用至全部
        newOrderData[orderIndex].shoppingCartDTOList.forEach((pro) => {
          pro.error = false;
          fields.forEach((config) => {
            const { fieldCode } = config;
            if (!filterProps.includes(fieldCode)) {
              pro[fieldCode] = currentData[fieldCode];
              if (pro.DS) {
                pro.DS.set(fieldCode, currentData[fieldCode]);
              }
            }
          });
        });
      }
      setVisible(false);
    } else {
      newOrderData[orderIndex].shoppingCartDTOList[productIndex].error = true;
    }
    setOrderData(newOrderData);
  });
}
