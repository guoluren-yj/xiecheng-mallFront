/* eslint-disable no-param-reassign */
import React, { useEffect } from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import ProjectNum from './ProjectNum';

export default function getNeededDate({
  order,
  FormItem,
  form,
  setOrderData,
  orderIndex,
  neededDateConfig = {},
  headerCustomizedList,
}) {
  useEffect(() => {
    function getField(name) {
      return headerCustomizedList?.find((p) => p.dimensionCode === name) || {};
    }
    if (order.DS) {
      order.DS.current.set({
        attributeVarchar1: getField('ratio').value || getField('ratio').valueName, // 预付款比例
        attributeVarchar2: getField('settlement').value || getField('settlement').valueName, // 结算方式
        attributeVarchar3: getField('paymentMethod').value || getField('paymentMethod').valueName, // 付款方式
      });
    }
  }, [order.DS]);

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
                </div>
              )}
            </FormItem>
          </div>
        );
      },
    },
    {
      title: '项目号',
      dataIndex: 'projectNumLov',
      width: 180,
      render: (_, product, productIndex) => {
        return (
          <ProjectNum
            form={form}
            FormItem={FormItem}
            product={product}
            order={order}
            setOrderData={setOrderData}
            orderIndex={orderIndex}
            productIndex={productIndex}
          />
        );
      },
    },
  ].filter((p) => !!p);
}
