import React from 'react';
import moment from 'moment';
import { DatePicker } from 'choerodon-ui';
import { Icon, Menu, Dropdown } from 'choerodon-ui/pro';
import { getPrimaryColor, getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
// import InOrginization from './InOrginization';

export default function getNeededDate({
  order,
  FormItem,
  form,
  orderData,
  setOrderData,
  orderIndex,
  neededDateConfig = {},
  orderLineList,
  // headerCustomizedList,
}) {
  const headerCustomizedList = [];
  orderLineList.forEach((item) => {
    headerCustomizedList.push(item?.orderLineValue?.headerCustomizedList);
  });
  const headerCustomizedListData = [];
  // 获取每个headerCustomizedList;
  headerCustomizedList.forEach((item) => {
    headerCustomizedListData.push(item.find((field) => field.dimensionCode === 'costId'));
  });

  // 同步当前申请所有行
  const isSyncOrder = order.shoppingCartDTOList?.length > 1;
  // 跨申请同步所有行
  const isSyncAll = orderData?.length > 1;

  // 同步需求日期方法
  const batchSyncDate = (key, val) => {
    setOrderData((data) => {
      const newData = [...data];
      const updateData = key === 'order' ? [newData[orderIndex]] : newData;
      updateData.forEach((f) => {
        const orderForm = f.productListForm;
        f.shoppingCartDTOList.forEach((p, i) => {
          // eslint-disable-next-line no-param-reassign
          p.neededDate = val;
          if (orderForm) {
            orderForm.setFieldsValue({
              [`neededDate${i}`]: val,
            });
          }
        });
      });
      return newData;
    });
  };

  const { hideFieldList = [] } = getUserConfigInfo();
  return [
    !hideFieldList.includes('DEMAND_DATE') && {
      title: neededDateConfig.fieldName || intl.get('mallf.myMall.model.requestDate').d('需求日期'),
      dataIndex: 'neededDate',
      width: 180,
      render: (value, product, productIndex) => {
        const syncMenu = (
          <Menu selectable={false} onClick={({ key }) => batchSyncDate(key, value)}>
            <Menu.Item key="order" hidden={!isSyncOrder}>
              {intl.get('mallf.common.view.syncOrderLines').d('同步至本订单所有行')}
            </Menu.Item>
            <Menu.Item key="all" hidden={!isSyncAll}>
              {intl.get('mallf.common.view.syncAllOrderLine').d('同步至所有订单行')}
            </Menu.Item>
          </Menu>
        );
        return (
          <div className="columns-item">
            <FormItem>
              {form.getFieldDecorator(`neededDate${productIndex}`, {
                initialValue: value,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('hzero.common.validation.notNull', {
                        name:
                          neededDateConfig.fieldName ||
                          intl.get('mallf.myMall.model.requestDate').d('需求日期'),
                      })
                      .d('需求日期不能为空'),
                  },
                ],
              })(
                <div>
                  <DatePicker
                    placeholder={
                      neededDateConfig.fieldName ||
                      intl.get('mallf.myMall.model.requestDate').d('需求日期')
                    }
                    disabled={neededDateConfig.editable === 0}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    style={{ width: 130 }}
                    value={value ? moment(value) : null}
                    onChange={(date) => {
                      setOrderData((data) => {
                        const newData = [...data];
                        newData[orderIndex].shoppingCartDTOList[
                          productIndex
                        ].neededDate = date.format(DATETIME_MIN);
                        return data;
                      });
                      if (order.productListForm) {
                        order.productListForm.setFieldsValue({
                          [`neededDate${productIndex}`]: date?.format(DATETIME_MIN),
                        });
                      }
                    }}
                    disabledDate={(currentDate) =>
                      moment(timestampToTime()).isAfter(currentDate, 'day')
                    }
                  />
                  {(isSyncAll || isSyncOrder) && (
                    <Dropdown overlay={syncMenu} placement="bottomLeft">
                      <Icon style={{ marginLeft: 12, color: getPrimaryColor() }} type="sync" />
                    </Dropdown>
                  )}
                </div>
              )}
            </FormItem>
          </div>
        );
      },
    },
    // {
    //   title: '库存组织',
    //   dataIndex: 'projectNumLov',
    //   width: 180,
    //   render: (value, product, productIndex) => {
    //     const lineCustomizedList =
    //       orderLineList?.[productIndex]?.orderLineValue?.lineCustomizedList || [];
    //     const lineInvOrganizationId = lineCustomizedList?.find((p) => p.dimensionCode) || {};
    //     return lineInvOrganizationId.valueName || lineInvOrganizationId.value;
    //   },
    // },
    {
      title: '成本中心',
      dataIndex: 'projectNumLov',
      width: 180,
      render: (v, p, index) => {
        return headerCustomizedListData[index]?.valueName || headerCustomizedListData[index]?.value;
      },
    },
  ].filter((p) => !!p);
}
