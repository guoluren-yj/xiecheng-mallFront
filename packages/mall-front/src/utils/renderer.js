import React from 'react';
import { Tag, Icon } from 'choerodon-ui';
import { Button, Tooltip } from 'choerodon-ui/pro';
import { Badge } from 'hzero-ui';

import { PermissionWrapper } from 'components/Permission';
import { addPurchaseApply } from 'components/Permission/permissionCode';
import OverflowTip from 'components/OverflowTip';
import intl from 'utils/intl';
import { handleCopy, getUserConfigInfo } from 'utils/utils';
import { getIsHideSupplierFlag, getCompareConfig } from 'utils/configUtils';
import { colorMapping } from 'utils/constants';

const statusMap = ['error', 'success'];

/**
 * 返回状态标记
 * @param {string} type - 当前状态值
 * @param {string} text - 当前状态文本值
 * @param {boolean} border - 当前状态文本值
 */
export function TagRender({ text, type, border, icon, style }) {
  const current = colorMapping[type] || {};
  return (
    <Tag
      style={{
        color: current.fontColor, // 字体颜色
        border: border ? `1px solid ${current.borderColor}` : 'none',
        fontWeight: border ? '' : 600,
        padding: '0 5px',
        height: 18,
        lineHeight: '18px',
        fontSize: 12,
        display: 'inline-flex',
        ...style,
      }}
      className="text-overflow"
      color={current.bgColor || ''} // 背景颜色
    >
      <OverflowTip>{text}</OverflowTip>
      <span style={{ flexShrink: 0 }}>{icon}</span>
    </Tag>
  );
}

export function SupplierComponent(props) {
  const { showCataIcon, iconStyle = {}, style = {}, showSupplier } = props;
  return (
    <>
      {!getIsHideSupplierFlag() || showSupplier ? (
        props.children
      ) : (
        <>
          {showCataIcon ? (
            <span
              style={{
                background: '#eee',
                borderRadius: 2,
                display: 'inline-block',
                height: 18,
                marginRight: 5,
                ...style,
              }}
            >
              <Tooltip title={intl.get('mallf.common.view.common.CATA.product').d('目录化商品')}>
                <Icon
                  style={{
                    color: '#999999',
                    verticalAlign: 'text-bottom',
                    ...iconStyle,
                  }}
                  type="chrome_reader_mode"
                />
              </Tooltip>
            </span>
          ) : null}
        </>
      )}
    </>
  );
}

/**
 * 返回 是/Î=否 多语言 并加上对应的状态
 * @param {1|any} v 值
 * @return 1 -> yes(多语言), other -> no(多语言)
 */
export function yesOrNoRender(v) {
  return (
    <Badge
      status={statusMap[v]}
      text={
        +v === 1
          ? intl.get('hzero.common.status.yes').d('是')
          : intl.get('hzero.common.status.no').d('否')
      }
    />
  );
}

/**
 * 复制按钮
 * @param {1|any} props 值
 */
export function CopyButton(props) {
  const { num, label, style = {}, tooltipProps = {}, ...otherProps } = props;
  if (!num) return null;
  return (
    <Tooltip
      title={
        label ? intl.get('mallf.common.view.copy.number', { value: label }).d(`复制${label}`) : null
      }
      {...tooltipProps}
    >
      <Button
        funcType="link"
        color="primary"
        icon="content_copy"
        className="copy-common-btn"
        size="small"
        onClick={() => {
          handleCopy(num);
        }}
        style={{
          float: 'right',
          fontSize: 14,
          marginLeft: 5,
          position: 'relative',
          ...style,
        }}
        {...otherProps}
      />
    </Tooltip>
  );
}

export function SpanTitle({ children, ...other }) {
  return (
    <span {...other} title={children?.join?.('') || children}>
      {children}
    </span>
  );
}

/**
 * compareFlag 0 不启用对比
 * compareFlag 1 启用对比 自动生成比价单 / 启用对比 不自动生成比价单
 * compareFlag 2 仅自动生成比价单 不允许手动生成比价单
 *
 */

// 是否展示对比功能
export function ShowCompare({ children }) {
  const { compareFlag } = getUserConfigInfo();
  return <>{compareFlag !== 0 ? children : null}</>;
}

// 是否展示 手动生成比价单
export function ShowManuallyCompare({ children, tooltip, style, iconStyle }) {
  const { compareFlag } = getUserConfigInfo();
  return compareFlag !== 2 ? (
    <div style={{ display: 'flex', alignItems: 'flex-start', ...style }}>
      {children}
      {tooltip ? (
        <Tooltip title={tooltip}>
          <Icon
            type="help"
            style={{
              color: '#999999',
              ...iconStyle,
            }}
          />
        </Tooltip>
      ) : null}
    </div>
  ) : null;
  // <Tooltip title={tooltip}>{compareFlag !== 2 ? children : null}</Tooltip>;
}

/**
 * 是否展示创建手工申请
 */
export function ShowAddPurchase({ children }) {
  const { isMixTenant } = getUserConfigInfo();
  return (
    <>
      {isMixTenant === false && (
        <PermissionWrapper permissionList={[addPurchaseApply]}>{children}</PermissionWrapper>
      )}
    </>
  );
}

// 手动比价数量限制判断
export function validCompareLimit(list) {
  const { lowerLimit, upperLimit } = getCompareConfig();
  let message = null;
  if (typeof lowerLimit === 'number' && list.length < lowerLimit) {
    message = intl
      .get('mallf.common.view.compareLowerLimit', { number: lowerLimit })
      .d(`若要生成比价单，至少需要${lowerLimit}个商品参与比价`);
  }
  if (typeof upperLimit === 'number' && list.length > upperLimit) {
    message = intl
      .get('mallf.common.view.compareUpperLimit', { number: upperLimit })
      .d(`若要生成比价单，最多只能有${upperLimit}个商品参与比价`);
  }
  return message;
}
