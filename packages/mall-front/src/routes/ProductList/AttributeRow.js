// 属性筛选墙
import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { Button, Tooltip, Icon, TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './attributeRow.less';

const equalAttrValue = (p, n) => (p.code || p.meaning) === (n.code || n.meaning);

const getButtons = (btns) =>
  (btns || [])
    .filter((f) => !f.hidden)
    .map((m) => (
      <Button size="small" {...m.btnProps}>
        {m.btnText}
      </Button>
    ));

// 属性墙行布局容器
const RowWrapper = ({ className, label, buttons, children, required }) => (
  <tr className={classNames(['option2', styles['attribute-row'], { [className]: !!className }])}>
    <td className={classNames(['attribute-row-label tab-th'])}>
      {label}
      <span r-if={required} className="attribute-row-label-required">
        *
      </span>
    </td>
    <td className="attribute-row-content option2List" colSpan={buttons ? 1 : 2}>
      {children}
    </td>
    <td className="attribute-row-btns last-td" r-if={buttons}>
      {buttons}
    </td>
  </tr>
);

// 属性值布局渲染
const AttrContent = observer((props) => {
  const { className, record } = props;
  return (
    <div className={classNames(['attr-content', { [className]: !!className }])}>
      {record.items.map((m) => {
        const isSelected = record.selected.some((s) => equalAttrValue(s, m));
        const isDisibled = record.multiple && m.subAttrCode;
        const disableTips = isDisibled
          ? intl.get('mallf.common.productList.sourceMultDisabled').d('不能对商品来源进行多选')
          : null;
        return (
          <div
            className={classNames([
              'attr-item',
              {
                'attr-item-selected': isSelected && record.multiple,
                'attr-item-disabled': isDisibled,
                'attr-item-border': m.lastSubItem,
                'attr-item-pro': record.get('customFlag') === 1,
              },
            ])}
            key={m.code || m.meaning}
            onClick={() => {
              if (isDisibled) return;
              const re = m.subAttrCode ? record.subRecord : record;
              re.selected.push(m);
              if (!re.multiple) {
                re.confirm();
              }
            }}
          >
            <Tooltip title={disableTips}>
              <span className="attr-item-text" r-title>
                {m.meaning}
              </span>
            </Tooltip>
            <Icon
              type="close"
              r-if={isSelected && record.multiple}
              className="attr-item-delete"
              onClick={(e) => {
                e.stopPropagation();
                record.selected = record.selected.filter((f) => !equalAttrValue(f, m));
              }}
            />
          </div>
        );
      })}
    </div>
  );
});

// 基本筛选属性
const AttributeRow = observer((props) => {
  const { record } = props;

  const buttons = [
    {
      hidden: record.isExpand || record.multiple,
      btnText: intl.get('mallf.common.button.more').d('更多'),
      btnProps: {
        icon: 'expand_more',
        onClick: () => {
          record.isExpand = true;
        },
      },
    },
    {
      hidden: !record.isExpand || record.multiple,
      btnText: intl.get('mallf.common.button.pickUp').d('收起'),
      btnProps: {
        icon: 'expand_less',
        onClick: () => {
          record.isExpand = false;
        },
      },
    },
    {
      hidden: record.multiple,
      btnText: intl.get('mallf.productList.model.common.multipleSelect').d('多选'),
      btnProps: {
        icon: 'add',
        onClick: () => {
          record.isExpand = true;
          record.multiple = true;
        },
      },
    },
    {
      hidden: !record.multiple,
      btnText: intl.get('mallf.common.model.common.cancel').d('取消'),
      btnProps: {
        icon: 'close',
        onClick: () => {
          record.multiple = false;
          record.selected = [];
        },
      },
    },
    {
      hidden: !record.multiple,
      btnText: intl.get('mallf.common.model.button.confirm').d('确定'),
      btnProps: {
        icon: 'check',
        disabled: record.selected.length < 1,
        onClick: () => {
          record.confirm();
        },
      },
    },
  ];
  return (
    <RowWrapper
      label={record.get('attrName')}
      buttons={getButtons(buttons)}
      required={record.get('requiredFlag') === 1}
    >
      <div
        className="attr-wrapper"
        style={{
          overflowX: 'hidden',
          overflowY: record.isExpand ? 'auto' : 'hidden',
          height: record.isExpand ? 'auto' : 34,
          maxHeight: 150,
        }}
      >
        {record.isExpand && record.get('attrCode') === 'brand' && (
          <>
            <TextField
              prefix={
                <Icon
                  type="search"
                  onClick={() => {
                    // 回到所有品牌
                    record.brandCode = 'ALL';
                  }}
                />
              }
              placeholder={intl.get('mallf.common.productList.brand.filter.result').d('请搜索结果')}
              style={{ width: 300, height: 28, marginBottom: 10 }}
              value={record.filterValue}
              onChange={(val) => {
                record.setFilterValue(val);
              }}
              onEnterDown={() => {
                record.brandCode = 'ALL';
              }}
            />
            <div style={{ marginBottom: 10 }}>
              {record.brandArrs.map((m) => (
                <span
                  key={m.code}
                  className={classNames([
                    'brand-code',
                    { 'brand-code-active': record.brandCode === m.code },
                  ])}
                  onClick={() => {
                    record.brandCode = m.code;
                  }}
                >
                  {m.meaning}
                </span>
              ))}
            </div>
          </>
        )}
        <AttrContent record={record} />
      </div>
    </RowWrapper>
  );
});

// 目录筛选
export const CatalogRow = (props) => {
  const { subCatalogs = [], catalogName, onSelectCatalog = (e) => e } = props;
  const [expand, setExpand] = useState(false);
  const buttons = [
    {
      hidden: expand,
      btnText: intl.get('mallf.common.button.more').d('更多'),
      btnProps: {
        icon: 'expand_more',
        onClick: () => {
          setExpand(true);
        },
      },
    },
    {
      hidden: !expand,
      btnText: intl.get('mallf.common.button.pickUp').d('收起'),
      btnProps: {
        icon: 'expand_less',
        onClick: () => {
          setExpand(false);
        },
      },
    },
  ];
  return (
    <RowWrapper label={catalogName} buttons={getButtons(buttons)}>
      <div
        className="attr-wrapper"
        style={{
          overflowX: 'hidden',
          overflowY: expand ? 'auto' : 'hidden',
          height: expand ? 'auto' : 34,
          maxHeight: 150,
        }}
      >
        <div className={classNames(['attr-content'])}>
          {subCatalogs.map((m) => {
            return (
              <div
                key={m.value}
                className={classNames(['attr-item'])}
                onClick={() => {
                  onSelectCatalog(m);
                }}
              >
                <span className="attr-item-text" title={m.meaning}>
                  {m.meaning}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </RowWrapper>
  );
};

// 高级筛选单个属性
const AttributeProCol = observer((props) => {
  const { record, activeKey, setActiveKey } = props;
  const colRef = useRef();
  const [itemsLeft, setItemsLeft] = useState(0);
  const key = record.get('attrCode') || record.get('attrName');
  const isActive = key === activeKey;

  useEffect(() => {
    if (colRef.current) {
      setItemsLeft(-(102 + (colRef.current?.offsetLeft ?? 0)));
    }
  }, [record.items.length]);

  const buttons = [
    {
      hidden: record.multiple,
      btnText: intl.get('mallf.productList.model.common.multipleSelect').d('多选'),
      btnProps: {
        icon: 'add',
        onClick: () => {
          record.isExpand = true;
          record.multiple = true;
        },
      },
    },
    {
      hidden: !record.multiple,
      btnText: intl.get('mallf.common.model.common.cancel').d('取消'),
      btnProps: {
        icon: 'close',
        onClick: () => {
          record.multiple = false;
          record.selected = [];
        },
      },
    },
    {
      hidden: !record.multiple,
      btnText: intl.get('mallf.common.model.button.confirm').d('确定'),
      btnProps: {
        icon: 'check',
        disabled: record.selected.length < 1,
        onClick: () => {
          record.confirm();
        },
      },
    },
  ];
  return (
    <div
      ref={colRef}
      className={classNames(['attr-pro-col', { 'attr-pro-col-active': isActive }])}
      onClick={() => {
        if (isActive) {
          setActiveKey();
        } else {
          setActiveKey(key);
        }
      }}
    >
      <Tooltip title={record.get('attrName')}>
        <span>{record.get('attrName')}</span>
      </Tooltip>
      <Icon type={isActive ? 'expand_less' : 'expand_more'} />
      <div
        className="attr-pro-items-wrapper"
        style={{ left: itemsLeft }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="attr-pro-items-content">
          <AttrContent record={record} />
        </div>
        <div className="attr-pro-items-btns">{getButtons(buttons)}</div>
      </div>
    </div>
  );
});

// 高级筛选属性行
export const AttributeProRow = observer((props) => {
  const { attribute } = props;
  const [activeKey, setActiveKey] = useState();

  return (
    <RowWrapper label={intl.get('mallf.common.view.advanceFilter').d('高级筛选')}>
      <div className="attr-pro-wrapper">
        {attribute.customRecords
          .filter((f) => !f.hidden)
          .map((record) => (
            <AttributeProCol record={record} activeKey={activeKey} setActiveKey={setActiveKey} />
          ))}
      </div>
    </RowWrapper>
  );
});

export default AttributeRow;
