export function changePrType({ tableDs }) {
  tableDs.forEach((record) => {
    record.set({
      itemCodeLov: null,
      categoryLov: null,
      uomLov: null,
      attributeVarchar1: null,
    });
  });
}
