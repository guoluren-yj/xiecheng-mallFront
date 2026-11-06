import React, { useState, useEffect } from 'react';

import { fetchZhuanqu } from 'services/headerService';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

export default function QuickLink({ unitId = null, mallType }) {
  const [quickLinkList, setQuickLinkList] = useState([]);
  const { pickSupplierFlag } = getUserConfigInfo();
  useEffect(() => {
    fetchZhuanqu({
      belongType: 0,
      channel: mallType === 'sigl' ? 1 : 0,
      isPreview: 1,
      filterLabelFlag: 1, // 过滤会员标签
      unitId,
    }).then((res) => {
      const zhenxuanObj = {
        blockTitle: intl.get(`mallf.header.view.zhenxuanzhuanqu`).d('甄选专区'),
        boldFlag: 1,
      };
      const linkArr =
        pickSupplierFlag && mallType !== 'sigl'
          ? [zhenxuanObj, ...(res?.content?.slice(0, 6) || [])]
          : res?.content?.slice(0, 7) || [];
      setQuickLinkList(linkArr);
    });
  }, [unitId]);

  function getLink(item) {
    return (
      <a
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
        return <li className="quick-link">{getLink(link)}</li>;
      })}
    </>
  );
}
