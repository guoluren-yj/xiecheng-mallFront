/**
 * 标签颜色
 * @date: 2020-11-24
 * @author: hl <li.huang04@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Tooltip } from 'choerodon-ui';
import { Icon } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import styles from './index.less';
import colors from './colors';
import { getUserConfigInfo } from '@/utils/utils';

export default function (props) {
  const { code, value, cursor, closable = false, maxWidth = 58, onChange = (e) => e, desc } = props;
  const c = colors[code] || {};
  if (code === 'JDSEND') {
    return (
      <Tooltip title={desc || intl.get('mallf.common.view.JD.send').d('京东配送')}>
        <span className={styles['label-preview-jdsend']}>
          <Icon type="local_shipping" />
          <span style={{ cursor: cursor || 'pointer' }}>
            {desc || intl.get('mallf.common.view.JD.send').d('京东配送')}
          </span>
        </span>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title={value}>
        <span
          className={styles['label-preview-container-product-list']}
          style={{
            maxWidth,
            color: c['label-preview-color'],
            borderColor: c['label-preview-border-color'],
            backgroundColor: c['label-preview-background-color'],
          }}
        >
          <span style={{ cursor: cursor || 'pointer' }}>{value}</span>
          {closable && <Icon type="close" onClick={() => onChange()} />}
        </span>
      </Tooltip>
    );
  }
}

export function SiglPrice(props) {
  const { pointPrice, style = {}, text = '' } = props;
  const { pointName } = getUserConfigInfo();
  return (
    <>
      {pointPrice || pointPrice === 0 ? (
        <div
          className={styles['sigl-price']}
          style={style}
          title={text || `${pointPrice}${pointName}`}
        >
          {text || `${pointPrice}${pointName}`}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
