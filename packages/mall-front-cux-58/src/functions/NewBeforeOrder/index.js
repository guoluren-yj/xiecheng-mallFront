export function promisGetInvoice({ orderData }) {
  return new Set(
    orderData.map((n) => n.proxySupplierCompanyId || n.attributeBigint20).filter((n) => n)
  );
}

export function getInvoice({ item, invoiceCheckData, innerCompanyInvoice }) {
  const flag = item?.proxySupplierCompanyId || item?.attributeBigint20;
  return (
    (flag ? invoiceCheckData : innerCompanyInvoice)?.find(
      (n) => n.proxySupplierCompanyId === (flag || item.companyId)
    ) || {}
  );
}
