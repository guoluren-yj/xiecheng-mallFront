import React, { useMemo } from 'react';

import intl from 'utils/intl';
import { SupplierComponent } from 'utils/renderer';

export default function Header(props) {
  const { item } = props;

  const { orderEntryVOS = [] } = item;
  const poLineList = useMemo(() => orderEntryVOS.filter((p) => p.freightFlag !== 1), [
    orderEntryVOS,
  ]); // 过滤掉运费行

  return (
    <ul className="apply-header">
      <li>
        <span className="header-label">
          {intl.get('mallf.myRequest.view.order.srmPoNum').d('商城订单号')}：
        </span>
        <span className="header-content">{item.orderCode}</span>
      </li>
      <SupplierComponent>
        <li>
          <span className="header-label">
            {intl.get('mallf.myRequest.view.supplier').d('供应商')}：
          </span>
          <span className="header-content">{item.supplierCompanyName}</span>
        </li>
      </SupplierComponent>
      {poLineList?.[0].srmOrderCode && (
        <li>
          <span className="header-label">
            {intl.get('mallf.myRequest.view.catalog.purchaseOrderNum').d('采购订单号')}：
          </span>
          <span className="header-content">{poLineList?.[0].srmOrderCode}</span>
        </li>
      )}
      <li>{item.creationDate}</li>
    </ul>
  );
}
