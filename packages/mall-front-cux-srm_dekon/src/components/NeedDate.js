import React from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip, InputNumber } from 'choerodon-ui';

import { getPrimaryColor, getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import { math } from 'choerodon-ui/dataset';

function getNeededDate({
  order,
  FormItem,
  form,
  setOrderData,
  orderIndex,
  neededDateConfig = {},
  isReceive,
}) {
  const { hideFieldList = [] } = getUserConfigInfo();
  const cataFlag = order?.shoppingCartDTOList?.[0]?.productSource === 'CATA';
  return [
    !hideFieldList.includes('DEMAND_DATE') &&
      !isReceive && {
        title:
          neededDateConfig.fieldName || intl.get('mallf.myMall.model.requestDate').d('需求日期'),
        dataIndex: 'neededDate',
        width: 210,
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
    cataFlag && {
      title: '运费单价',
      width: 160,
      dataIndex: 'attributeDecimal10',
      align: 'right',
      render: (value, product, productIndex) => {
        return (
          <FormItem>
            {form.getFieldDecorator(`attributeDecimal10${productIndex}`, {
              initialValue: value || 0,
            })(
              <InputNumber
                onChange={(val) => {
                  setOrderData((data) => {
                    const newData = [...data];
                    const newAttributeDecimal1 = math.plus(
                      math.multipliedBy(
                        newData[orderIndex].shoppingCartDTOList[productIndex].attributeDecimal11 ||
                          0,
                        product.quantity
                      ),
                      math.multipliedBy(val || 0, product.quantity)
                    );
                    newData[orderIndex].shoppingCartDTOList[productIndex].attributeDecimal10 = val;
                    newData[orderIndex].shoppingCartDTOList[
                      productIndex
                    ].attributeDecimal1 = newAttributeDecimal1;
                    form.setFieldsValue({
                      [`attributeDecimal10${productIndex}`]: val,
                      [`attributeDecimal1${productIndex}`]: newAttributeDecimal1,
                    });
                    return newData;
                  });
                }}
                min={0}
              />
            )}
          </FormItem>
        );
      },
    },
    cataFlag && {
      title: '安调费单价',
      width: 160,
      dataIndex: 'attributeDecimal11',
      align: 'right',
      render: (value, product, productIndex) => {
        return (
          <FormItem>
            {form.getFieldDecorator(`attributeDecimal11${productIndex}`, {
              initialValue: value || 0,
            })(
              <InputNumber
                onChange={(val) => {
                  setOrderData((data) => {
                    const newData = [...data];
                    const newAttributeDecimal1 = math.plus(
                      math.multipliedBy(
                        newData[orderIndex].shoppingCartDTOList[productIndex].attributeDecimal10 ||
                          0,
                        product.quantity
                      ),
                      math.multipliedBy(val || 0, product.quantity)
                    );
                    newData[orderIndex].shoppingCartDTOList[productIndex].attributeDecimal11 = val;
                    newData[orderIndex].shoppingCartDTOList[
                      productIndex
                    ].attributeDecimal1 = newAttributeDecimal1;
                    form.setFieldsValue({
                      [`attributeDecimal11${productIndex}`]: val,
                      [`attributeDecimal1${productIndex}`]: newAttributeDecimal1,
                    });
                    return newData;
                  });
                }}
                min={0}
              />
            )}
          </FormItem>
        );
      },
    },
    cataFlag && {
      title: '行附加费(运费/安调费等)',
      width: 160,
      dataIndex: 'attributeDecimal1',
      align: 'right',
      render: (value, product, productIndex) => {
        return (
          <FormItem>
            {form.getFieldDecorator(`attributeDecimal1${productIndex}`, {
              initialValue: value || 0,
            })(
              <InputNumber
                disabled
                onChange={(val) => {
                  setOrderData((data) => {
                    const newData = [...data];
                    newData[orderIndex].shoppingCartDTOList[productIndex].attributeDecimal1 = val;
                    form.setFieldsValue({
                      [`attributeDecimal1${productIndex}`]: val,
                    });
                    return newData;
                  });
                }}
                min={0}
              />
            )}
          </FormItem>
        );
      },
    },
    {
      title: '在途（T）',
      width: 160,
      dataIndex: 'attributeDecimal12',
      align: 'right',
    },
    {
      title: '库存（T）',
      width: 160,
      dataIndex: 'attributeDecimal13',
      align: 'right',
    },
  ].filter((p) => !!p);
}

export default getNeededDate;
