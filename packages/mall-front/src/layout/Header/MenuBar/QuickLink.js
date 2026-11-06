import React, { useState, useEffect } from 'react';
import qs from 'qs';

import {
  getAccessToken,
  getUserConfigInfo,
  getProductLinkParams,
  openPage,
  getOnlyInStock,
} from 'utils/utils';
import { fetchZhuanqu } from 'services/headerService';
import intl from 'utils/intl';
import cuxComonent from 'cuxTools/cuxComponent';

export function getLinkUrl(data, { mallType }) {
  if (data.pickSupplierFlag) {
    // 跳转甄选专区
    return '/zone-supplier-list?blockId=zxzq';
  }
  const { productGroup, productGroupId, bannerName, blockId } = data || {}; // 商品组信息
  const { productGroupAssignList = [], groupType, groupTypeName, orderType, includeNoStockFlag } =
    productGroup || {}; // 商品组行信息
  const params = {
    blockId,
    bannerName,
    onlyInStock: getOnlyInStock(includeNoStockFlag),
  };
  const newParams = getProductLinkParams({
    param: params,
    orderType,
    groupType,
    groupTypeName,
    productGroupId,
    productGroupAssignList,
    isLink: true,
  });
  return `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(newParams)}`;
}

function QuickLink() {
  const [quickLinkList, setQuickLinkList] = useState([]);
  const { pickSupplierFlag } = getUserConfigInfo();
  const { unitId = null, mallType } = getUserConfigInfo();
  const { blockId } = qs.parse(window.location.search.split('?')[1]) || {};
  useEffect(() => {
    if (unitId || mallType === 'sigl') {
      fetchZhuanqu({
        belongType: 0,
        channel: mallType === 'sigl' ? 1 : 0,
        filterLabelFlag: 1, // 过滤会员标签
        shelfFlag: 1,
        unitId,
      }).then((res) => {
        const zhenxuanObj = {
          blockId: 'zxzq',
          blockTitle: intl.get(`mallf.header.view.zhenxuanzhuanqu`).d('甄选专区'),
          boldFlag: 1,
          pickSupplierFlag: 1,
        };
        const linkArr =
          pickSupplierFlag && mallType !== 'sigl'
            ? [zhenxuanObj, ...(res?.content?.slice(0, 6) || [])]
            : res?.content?.slice(0, 7) || [];
        setQuickLinkList(linkArr);
      });
    }
  }, [unitId]);

  function getLink(item) {
    return (
      <a
        onClick={() =>
          openPage(
            +item.blockType === 2
              ? item.quickUrl?.replace('{access_token}', getAccessToken())
              : getLinkUrl(item, { mallType })
          )
        }
        style={{
          color: item.fontColor || '#191919',
          fontWeight: +item.boldFlag === 1 ? 600 : 'none',
          fontStyle: +item.slantFlag === 1 ? 'italic' : 'normal',
        }}
      >
        {item.blockTitle}
      </a>
    );
  }
  return (
    <>
      {quickLinkList.map((link) => {
        return (
          <li className={`quick-link ${blockId === link.blockId ? 'activeLink' : ''}`}>
            {getLink(link)}
          </li>
        );
      })}
    </>
  );
}
export const QuickLinkCom = QuickLink;

export default cuxComonent({ path: 'layout/Header/MenuBar/QuickLink' })(QuickLink);
