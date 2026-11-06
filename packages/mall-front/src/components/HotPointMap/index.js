import React from 'react';
import qs from 'qs';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import {
  getUserConfigInfo,
  getProductLinkParams,
  getIsJumpNewLink,
  getOnlyInStock,
} from 'utils/utils';

import './index.less';

export default function HotPointMap({
  mapId,
  hotZoneList = [],
  hotTimes = 1, // 坐标倍数
  disabled,
}) {
  const { mallType } = getUserConfigInfo();
  function getLinkUrl(data) {
    const { productGroup, productGroupId, hotZoneName } = data || {}; // 商品组信息
    const { productGroupAssignList = [], groupType, groupTypeName, orderType, includeNoStockFlag } =
      productGroup || {}; // 商品组行信息
    const params = {
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
    return `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify({
      ...newParams,
      hotZoneName,
    })}`;
  }

  const SIZE_LIST = [
    {
      hotZoneSize: 'default',
      hotContainWidth: 72, // 容器宽
      sizeStep: 5, // 热点环距
      offset: 11, // 定位偏移量(宽度的一半)
    },
    {
      hotZoneSize: 'small',
      hotContainWidth: 48,
      sizeStep: 4,
      offset: 8,
    },
  ];

  return (
    <map id={mapId} name={mapId}>
      {hotZoneList.map((hot) => {
        const { xaxis, yaxis, relationType, linkUrl, hotZoneColor, hotZoneName, hotZoneSize } = hot;
        const { hotContainWidth, sizeStep, offset } =
          SIZE_LIST.find((n) => n.hotZoneSize === hotZoneSize) || {};
        const x = Number(xaxis) * hotTimes;
        const y = Number(yaxis) * hotTimes;
        const redius = hotContainWidth / 2;
        const XY_LIST = [x - redius, y - redius, x + redius, y + redius];
        return (
          <Tooltip title={hotZoneName}>
            <div
              className={classNames({
                'hot-point': true,
                'hot-point-small': hotZoneSize === 'small',
              })}
              style={{
                left: x - offset,
                top: y - offset,
                backgroundColor: hotZoneColor,
                border: `${sizeStep}px solid ${hotZoneColor}59`,
                outline: `${sizeStep}px solid ${hotZoneColor}26`,
                pointerEvents: disabled ? 'auto' : 'none',
              }}
            >
              <area
                r-if={!disabled}
                shape="rect"
                coords={XY_LIST.join(',')}
                alt=""
                href={relationType === 3 ? linkUrl : getLinkUrl(hot)}
                target={getIsJumpNewLink() ? '_blank' : '_self'}
              />
            </div>
          </Tooltip>
        );
      })}
    </map>
  );
}
