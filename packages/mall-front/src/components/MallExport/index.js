import React from 'react';
import { Icon } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import styles from './index.less';

export default function MallExport(props) {
  const {
    tips = intl
      .get('mallf.common.view.exportTips')
      .d('异步导出可能存在延迟，请在页面右上角【消息通知】中追踪导出进度及下载导出文件'),
    title = intl.get(`hzero.common.components.export`).d('导出Excel'),
    ...exportProps
  } = props;

  const mallExportTitle = (
    <div>
      <div>{title}</div>
      <div className={styles['mall-export-tips']}>
        <Icon type="error" />
        <span>{tips}</span>
      </div>
    </div>
  );

  return <ExcelExportPro title={mallExportTitle} {...exportProps} />;
}
