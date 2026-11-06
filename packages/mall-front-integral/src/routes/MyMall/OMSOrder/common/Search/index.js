import React from 'react';
import { Button } from 'hzero-ui';
import { Icon, Select } from 'choerodon-ui';
import { TextField } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import style from './index.less';
import { getContextValue } from '../Context';

export default function Search(props) {
  const {
    setState,
    orderStatusList,
    isOMS,
    onPageChange,
    mallOrderStatusList,
    currentStatus,
  } = getContextValue();
  const { textFieldVal, handleSearchChange, resetSearch } = props;
  return (
    <div span={17} className={style.search}>
      <div className="order-centent-operation-search">
        <TextField
          value={textFieldVal}
          placeholder={intl.get('mallf.myMall.order.pleaseFill.orderNum').d('请输入商城订单号')}
          className="order-centent-operation-input"
          prefix={
            <Icon
              type="search"
              style={{ fontSize: '20px', color: '#999999', paddingLeft: '10px' }}
            />
          }
          onInput={(e) => handleSearchChange(e.target.value)}
          onChange={(val) => handleSearchChange(val)}
        />
        {isOMS && (
          <>
            {!currentStatus && (
              <Select
                style={{
                  marginRight: 10,
                  width: 170,
                  verticalAlign: 'middle',
                }}
                mode="multiple"
                maxTagCount={1}
                value={mallOrderStatusList}
                placeholder={intl.get('mallf.common.view.omsOrder.orderStatus').d('订单状态')}
                onChange={(e) => {
                  onPageChange({ mallOrderStatusList: e });
                  setState({ mallOrderStatusList: e });
                }}
              >
                {orderStatusList.length > 0 &&
                  orderStatusList.map((item) => {
                    return (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    );
                  })}
              </Select>
            )}
            {/* <Select
              style={{
                marginRight: 10,
                width: 100,
                verticalAlign: 'middle',
              }}
              placeholder={intl.get('mallf.common.view.order.type').d('订单类型')}
              value={orderTypeCode}
              onChange={(e) => {
                onPageChange({ orderTypeCode: e });
                setState({ orderTypeCode: e });
              }}
            >
              {typeList.length > 0 &&
                typeList.map((item) => {
                  return (
                    <Select.Option key={item.value} value={item.value}>
                      <span title={item.description}>{item.description}</span>
                    </Select.Option>
                  );
                })}
            </Select> */}
          </>
        )}
        <Button className="order-centent-operation-button" onClick={() => resetSearch({})}>
          {intl.get('hzero.common.button.reset').d('重置')}
        </Button>
        <Button
          className="order-centent-operation-button more-search text-overflow"
          title={intl.get('mallf.common.button.advanced.query').d('高级查询')}
          onClick={() => setState({ searchVisible: true })}
        >
          {intl.get('mallf.common.button.advanced.query').d('高级查询')}
        </Button>
      </div>
    </div>
  );
}
