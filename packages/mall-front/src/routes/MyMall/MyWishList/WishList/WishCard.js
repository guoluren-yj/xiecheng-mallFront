import React from 'react';

import intl from 'utils/intl';
import { getPrimaryColor } from 'utils/utils';
import { Tooltip, Icon, Tag } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import Link from 'components/Link';
import qs from 'qs';
import Product from './Product';

export default function WishCard(props) {
  const { item, handlerRemove } = props;
  const getLinkUrl = (data) => {
    // 跳转列表查询
    const params = {
      supplierCompanyIds: JSON.stringify([data.supplierId]),
      barName: data.supplierCompanyName,
    };
    return `/product-list?${qs.stringify(params)}`;
  };

  return (
    <div className="wish-detail">
      <div className="wish-head">
        <span className="wish-head-label">
          {intl.get('mallf.common.view.supplier').d('供应商')}：
          {item.partnerFlag ? (
            <Link
              style={{ color: item.partnerFlag ? getPrimaryColor() : '' }}
              to={getLinkUrl(item)}
            >
              {item.supplierCompanyName}
            </Link>
          ) : (
            <span>{item.supplierCompanyName}</span>
          )}
        </span>
        {!!item.partnerFlag && (
          <Tag color="rgb(235, 247, 241)" className="wish-head-label wish-cooperation">
            <Icon style={{ paddingRight: '5px' }} type="supervised_user_circle" />
            <span>
              {intl.get('mallf.myOrder.view.wishHead.establishedCooperation').d('已建立合作')}
            </span>
          </Tag>
        )}
      </div>
      <div>
        {item?.productList.length > 0 &&
          item.productList.map((li) => (
            <div className="wish-info">
              <div className="wish-product">
                <Product product={li} />
              </div>
              <div className="wish-time">
                <Tooltip
                  placement="topLeft"
                  title={intl.get('mallf.myOrder.view.wishList.addTime').d('加入时间')}
                >
                  <Icon style={{ paddingRight: '5px' }} type="date_range-o" />
                  <span className="wish-creationDate">{li.creationDate || ''}</span>
                </Tooltip>
              </div>
              <div className="wish-operate">
                {!item.partnerFlag && (
                  <Button
                    funcType="flat"
                    title={intl.get('hzero.common.button.remove').d('移除')}
                    className="wish-operate-btn"
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      handlerRemove(li);
                    }}
                  >
                    {intl.get('hzero.common.button.remove').d('移除')}
                  </Button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
