import React, { useMemo } from 'react';
import classNames from 'classnames';
import { TextField, Icon, Select, DataSet } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getOrganizationId } from 'utils/utils';
import CuxWrapper from 'cuxTools/CuxWrapper';

import CuxFn from '@/cuxTools/cuxFn';

import ImportBtn from './ImportBtn';
import { handleGroupingFilter } from './func';

const RenderSearch = observer(({ dataSet }) => {
  const handleSearch = (value) => {
    dataSet.setState('productName', value);
    dataSet.queryCartData();
  };
  return (
    <TextField
      defaultValue={dataSet.getState('productName')}
      prefix={<Icon type="search" />}
      style={{ width: 250 }}
      clearButton
      placeholder={intl.get('mallf.cart.view.searchInProduct').d('请输入商品编码、名称查询')}
      onChange={handleSearch}
    />
  );
});

export default function CartHeader({ tabKey, dataSet, tabs, groups, onTabChange }) {
  const type = [3, 4].includes(tabKey) ? 'basket' : 'cart';
  const defaultGroup = dataSet.getState('groupType');
  const selectDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'grouping',
          type: 'string',
          lookupCode: 'SMAL.CART_FILTER_GROUP',
          defaultValue: defaultGroup,
        },
      ],
      events: {
        update: ({ value }) => {
          localStorage.setItem(`cartGrouping-${getOrganizationId()}`, value);
          dataSet.setState('groupType', value);
          dataSet.queryCartData();
        },
      },
    });
  }, []);
  const groupShow = groups.length > 1;

  return (
    <>
      <div className="cart-pro-header">
        <div className="cart-pro-header-left">
          <div className="cart-pro-header-group" r-if={groupShow}>
            {groups.map((m) => (
              <div
                key={m.value}
                className={classNames(['cart-pro-group-item', { active: type === m.value }])}
                onClick={() => onTabChange({ type: 'group', value: m.value, item: m })}
              >
                {m.title}
              </div>
            ))}
          </div>
          <div className="cart-pro-header-invide" r-if={groupShow} />
          <div className="cart-pro-header-tabs">
            {tabs
              .filter((f) => f.type === type)
              .map((m) => (
                <div
                  key={m.value}
                  className={classNames(['cart-pro-tab-item', { active: m.value === tabKey }])}
                  onClick={() => onTabChange({ type: 'tab', value: m.value, item: m })}
                >
                  {m.title}
                </div>
              ))}
          </div>
        </div>
        <div className="cart-pro-header-right" r-if={[1, 2].includes(tabKey)}>
          {CuxFn({ name: 'CartProCopy-fn-extendHeaderBtns', value: { dataSet, tabKey } })()}
          {tabKey === 1 && (
            <>
              <Select
                dataSet={selectDs}
                name="grouping"
                clearButton={false}
                optionsFilter={(r) => handleGroupingFilter(r)}
              />
              <Divider type="vertical" style={{ top: 10 }} />
            </>
          )}
          <RenderSearch dataSet={dataSet} />
          <Divider type="vertical" style={{ top: 10 }} />
          <ImportBtn dataSet={dataSet} />
        </div>
        <div className="cart-pro-header-right" r-if={tabKey === 3}>
          <RenderSearch dataSet={dataSet} />
        </div>
        <div className="cart-pro-header-right" r-if={tabKey === 4}>
          <RenderSearch dataSet={dataSet} />
        </div>
      </div>
      <CuxWrapper path="CartProCopy/CartHeader/WarningInfo" />
    </>
  );
}
