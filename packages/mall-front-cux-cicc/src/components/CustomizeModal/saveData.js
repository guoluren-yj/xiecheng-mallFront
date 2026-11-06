import { isEmpty } from 'lodash';

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
  const filterProps = [];
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
        newOrderData[orderIndex].shoppingCartDTOList[productIndex].DS.set(
          fieldCode,
          currentData[fieldCode]
        );
      });
      if (type) {
        const newFields = [
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '费用承担部门',
            fieldCode: 'attributeBigint1Lov',
            fieldType: 'LOV',
          },
          {
            aggregationFlag: 0,
            fieldName: '付款类型',
            fieldCode: 'attributeBigint10',
            fieldType: 'SELECT',
            lovCode: 'SPUC.PRFKSQ',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '结束日期',
            fieldCode: 'attributeDate2',
            fieldType: 'DATE_PICKER',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '开始日期',
            fieldCode: 'attributeDate1',
            fieldType: 'DATE_PICKER',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '成本中心',
            fieldCode: 'attributeVarchar2Lov',
            fieldType: 'LOV',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '项目信息',
            fieldCode: 'attributeVarchar3Lov',
            fieldType: 'LOV',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '组信息',
            fieldCode: 'attributeVarchar4Lov',
            fieldType: 'LOV',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '使用员工',
            fieldCode: 'attributeVarchar5Lov',
            fieldType: 'LOV',
          },
          {
            includeNowDayFlag: 0,
            aggregationFlag: 0,
            fieldName: '职能管控部门联系人',
            fieldCode: 'attributeVarchar6Lov',
            fieldType: 'LOV',
          },
        ];
        // 应用至全部
        newOrderData[orderIndex].shoppingCartDTOList.forEach((pro) => {
          pro.error = false;
          newFields.forEach((config) => {
            const { fieldCode } = config;
            if (!filterProps.includes(fieldCode)) {
              pro[fieldCode] = currentData[fieldCode];
              pro.DS.set(fieldCode, currentData[fieldCode]);
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
