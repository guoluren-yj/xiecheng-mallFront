import * as React from 'react';
import { DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { toSafeInteger } from 'lodash';

import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import Drawer from './Drawer';
import _store, { infoDS, IObjectProps, EImportType } from './stores';

const { HZERO_IMP } = getEnvConfig();

interface ImportProps {
  // sync?: boolean; // 是否同步
  // auto?: boolean; // 是否自动(同步模式下生效)
  prefixPatch: string;
  args?: any; // JSON stringify
  autoRefreshInterval?: number; // Integer
  tenantId?: number;
  action?: string; // 国际化编码(配合key使用)
  actionParams?: string; // 国际化编码参数
  buttonText?: string; // 按钮文字
  buttonProps?: IObjectProps; // 按钮属性
  modal?: any;
  businessObjectTemplateCode?: string;
  businessObjectTemplateCategory?: string;
  templateCode?: string;
  refreshButton?: boolean;
  restoreShowAllButton?: boolean;
  auto?: boolean;
  modalProps?: any;
  successCallBack?: () => any; // 导入成功的回调函数
  errorCallBack?: () => any; // 导入失败的回调函数
}

const List: React.FC<ImportProps> = observer(
  ({
    tenantId = getCurrentOrganizationId(),
    prefixPatch,
    businessObjectTemplateCode,
    businessObjectTemplateCategory,
    templateCode = '',
    args,
    autoRefreshInterval = 5000,
    modal,
    refreshButton = false,
    auto = true,
    restoreShowAllButton = false,
    modalProps = {},
    successCallBack = () => undefined,
    errorCallBack = () => undefined,
  }) => {
    const infoDs = React.useMemo(() => new DataSet(infoDS()), []);

    const { setDataSource } = React.useContext<any>(_store as any).store;
    // eslint-disable-next-line no-nested-ternary
    const importType = templateCode
      ? EImportType.templateCode
      : businessObjectTemplateCode
      ? EImportType.businessObjectTemplateCode
      : EImportType.businessObjectTemplateCategory;

    React.useEffect(() => {
      // eslint-disable-next-line no-nested-ternary

      setDataSource({
        tenantId,
        prefixPatch: prefixPatch || HZERO_IMP,
        servicePath: prefixPatch,
        importType,
        businessObjectTemplateCode,
        businessObjectTemplateCategory,
        templateCode,
        code: templateCode || businessObjectTemplateCode || businessObjectTemplateCategory,
        autoRefreshInterval: toSafeInteger(autoRefreshInterval),
        refreshButton,
        restoreShowAllButton,
        auto,
        args,
        successCallBack,
        errorCallBack,
      });
    }, []);

    return (
      <>
        <Drawer
          infoDs={infoDs}
          importType={importType}
          code={templateCode || businessObjectTemplateCode || businessObjectTemplateCategory}
          tenantId={tenantId}
          prefixPatch={prefixPatch || HZERO_IMP}
          servicePath={prefixPatch}
          args={args}
          modal={modal}
          modalProps={modalProps}
        />
      </>
    );
  }
);

export default List;
