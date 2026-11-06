import React from 'react';
import { Tooltip, Icon } from 'choerodon-ui/pro';
import classNames from 'classnames';
import { isEmpty } from 'lodash';
import intl from 'mall-front/lib/utils/intl';

const ErrorInfo = ({ message, invalidFlag }) => {
  return (
    <div
      className={classNames({
        'sku-message-cart': true,
        'sku-message-error': !invalidFlag,
        'sku-message-warn': invalidFlag,
      })}
    >
      <Tooltip title={message} placement="bottomLeft">
        <Icon type="info" size={13} style={{ marginRight: 5 }} />
        <span>{message}</span>
      </Tooltip>
    </div>
  );
};

// 底部错误提示
const RenderErrorMsger = ({ record }) => {
  const {
    errorMessage,
    invalidFlag,
    cartColumnValueList,
    lineErrorMessages,
    dimensionTemplateDTO,
  } = record.get([
    'errorMessage',
    'invalidFlag',
    'lineErrorMessages',
    'cartColumnValueList',
    'dimensionTemplateDTO',
  ]);

  if (errorMessage) {
    return <ErrorInfo message={errorMessage} invalidFlag={invalidFlag} />;
  }

  if (!isEmpty(lineErrorMessages) || cartColumnValueList?.some((dim) => dim.errorMessage)) {
    const { templateName } = dimensionTemplateDTO?.dimensionTemplate || {};
    // 申请明细信息未完善，请点击{模板名称}填写信息
    return (
      <ErrorInfo
        message={intl
          .get('mallf.cart.view.validateCart.lineError', {
            value: templateName,
          })
          .d(`申请明细信息未完善，请点击“${templateName}”填写信息`)}
        invalidFlag={invalidFlag}
      />
    );
  }
  return <></>;
};

export default RenderErrorMsger;
