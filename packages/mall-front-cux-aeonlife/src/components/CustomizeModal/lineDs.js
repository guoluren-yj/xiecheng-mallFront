export default function lineDs() {
  return {
    fields: [
      {
        name: 'attributeVarchar1Lov',
        type: 'object',
        lovCode: 'SCUX.AEONLIFE.CHARGE_DETAILS',
        textField: 'expenseDetailCode',
        valueField: 'expenseDetailCode',
        dynamicProps: {
          lovPara: ({ record }) => {
            return { skuId: record.get('productId') };
          },
        },
      },
      {
        name: 'attributeVarchar1',
        bind: 'attributeVarchar1Lov.expenseDetailCode',
      },
      {
        name: 'attributeVarchar1Meaning',
        bind: 'attributeVarchar1Lov.expenseDetailName',
      },
      {
        name: 'attributeVarchar2',
        bind: 'attributeVarchar1Lov.expenseDetailName',
      },
    ],
  };
}
