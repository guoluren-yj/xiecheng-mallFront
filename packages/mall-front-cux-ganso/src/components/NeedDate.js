import React from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT

export default function getNeededDate({
  order,
  FormItem,
  form,
  setOrderData,
  orderIndex,
  neededDateConfig = {},
}) {
  const { hideFieldList = [] } = getUserConfigInfo();
  return [
    !hideFieldList.includes('DEMAND_DATE') && {
      title: neededDateConfig.fieldName || intl.get('mallf.myMall.model.requestDate').d('需求日期'),
      dataIndex: 'neededDate',
      width: 180,
      render: (value, product, productIndex) => {
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
                <>
                  <DatePicker
                    placeholder={
                      neededDateConfig.fieldName ||
                      intl.get('mallf.myMall.model.requestDate').d('需求日期')
                    }
                    disabled={neededDateConfig.editable === 0}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    style={{ width: 160 }}
                    value={value ? moment(value) : null}
                    onChange={(date) => {
                      setOrderData((data) => {
                        const newData = [...data];
                        newData[orderIndex].shoppingCartDTOList[
                          productIndex
                        ].neededDate = date?.format(DATETIME_MIN);
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
                  {order.shoppingCartDTOList?.length > 1 && (
                    <Tooltip
                      title={intl
                        .get('mallf.common.view.neededDate.info')
                        .d('可同步至该采购申请下的所有商品行')}
                    >
                      <C7nIcon
                        onClick={() => {
                          setOrderData((data) => {
                            const newData = [...data];
                            newData[orderIndex].shoppingCartDTOList.forEach((p, i) => {
                              // eslint-disable-next-line no-param-reassign
                              p.neededDate = value;
                              form.setFieldsValue({
                                [`neededDate${i}`]: value,
                              });
                            });
                            return newData;
                          });
                        }}
                        style={{ marginLeft: 12, color: getPrimaryColor() }}
                        type="sync"
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </FormItem>
          </div>
        );
      },
    },
    {
      title: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
      dataIndex: 'attributeDatetime5',
      width: 180,
      render: (value, product, productIndex) => {
        return (
          <div className="columns-item">
            <FormItem>
              {form.getFieldDecorator(`attributeDatetime5${productIndex}`, {
                initialValue: value,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('hzero.common.validation.notNull', {
                        name: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
                      })
                      .d('需求日期不能为空'),
                  },
                ],
              })(
                <>
                  <DatePicker
                    showTime
                    placeholder={intl.get('mallf.myMall.model.requestDate').d('需求日期')}
                    format={DEFAULT_DATETIME_FORMAT}
                    allowClear={false}
                    style={{ width: 170 }}
                    value={value ? moment(value) : null}
                    onChange={(date) => {
                      setOrderData((data) => {
                        const newData = [...data];
                        newData[orderIndex].shoppingCartDTOList[
                          productIndex
                        ].attributeDatetime5 = date?.format(DEFAULT_DATETIME_FORMAT);
                        if (newData[orderIndex].shoppingCartDTOList[productIndex].DS) {
                          newData[orderIndex].shoppingCartDTOList[productIndex].DS.set(
                            'attributeDatetime5',
                            date?.format(DEFAULT_DATETIME_FORMAT)
                          );
                        }
                        return data;
                      });
                      if (order.productListForm) {
                        order.productListForm.setFieldsValue({
                          [`attributeDatetime5${productIndex}`]: date?.format(
                            DEFAULT_DATETIME_FORMAT
                          ),
                        });
                      }
                    }}
                    disabledDate={(currentDate) =>
                      moment(timestampToTime()).isAfter(currentDate, 'day')
                    }
                  />
                  {order.shoppingCartDTOList?.length > 1 && (
                    <Tooltip
                      title={intl
                        .get('mallf.common.view.neededDate.info')
                        .d('可同步至该采购申请下的所有商品行')}
                    >
                      <C7nIcon
                        onClick={() => {
                          setOrderData((data) => {
                            const newData = [...data];
                            newData[orderIndex].shoppingCartDTOList.forEach((p, i) => {
                              // eslint-disable-next-line no-param-reassign
                              p.attributeDatetime5 = value;
                              if (p.DS) {
                                p.DS.set('attributeDatetime5', value);
                              }
                              form.setFieldsValue({
                                [`attributeDatetime5${i}`]: value,
                              });
                            });
                            return newData;
                          });
                        }}
                        style={{ marginLeft: 12, color: getPrimaryColor() }}
                        type="sync"
                      />
                    </Tooltip>
                  )}
                </>
              )}
            </FormItem>
          </div>
        );
      },
    },
  ].filter((p) => !!p);
}
