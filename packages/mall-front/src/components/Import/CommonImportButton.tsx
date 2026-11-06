import * as React from 'react';
import { observer } from 'mobx-react-lite';
import { toSafeInteger } from 'lodash';

import { Button } from 'hzero-front/lib/components/Permission';

import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

import { useModal } from './index';
import { IObjectProps } from './stores';

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
  businessObjectTemplateCode?: string;
  businessObjectTemplateCategory?: string;
  templateCode?: string;
  restoreShowAllButton?: boolean;
  refreshButton?: boolean;
  auto?: boolean;
  modalProps?: any;
  successCallBack?: () => any;
  errorCallBack?: () => any;
}

const List: React.FC<ImportProps> = observer(
  ({
    action = 'hzero.common.button.import',
    actionParams = {},
    buttonText = intl.get('hzero.common.button.import').d('导入'),
    buttonProps = {},
    tenantId = getCurrentOrganizationId(),
    prefixPatch,
    businessObjectTemplateCode,
    businessObjectTemplateCategory,
    templateCode,
    args = {},
    autoRefreshInterval = 5000,
    refreshButton = false,
    restoreShowAllButton = false,
    auto = true,
    modalProps = {},
    successCallBack = () => undefined,
    errorCallBack = () => undefined,
  }) => {
    const handleClick = React.useCallback(() => {
      const { openModal } = useModal();
      openModal(
        {
          businessObjectTemplateCode,
          businessObjectTemplateCategory,
          templateCode,
          tenantId,
          prefixPatch,
          autoRefreshInterval: toSafeInteger(autoRefreshInterval),
          refreshButton,
          auto,
          args,
          restoreShowAllButton,
          successCallBack,
          errorCallBack,
        },
        modalProps
      );
    }, [
      businessObjectTemplateCode,
      businessObjectTemplateCategory,
      templateCode,
      tenantId,
      prefixPatch,
      action,
      actionParams,
      args,
      restoreShowAllButton,
    ]);

    return (
      <Button type="c7n-pro" icon="get_app" {...buttonProps} onClick={handleClick}>
        {buttonText}
      </Button>
    );
  }
);

export default List;
