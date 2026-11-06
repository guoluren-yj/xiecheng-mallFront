import React from 'react';
import { isNil } from 'lodash';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN, DEFAULT_DATETIME_FORMAT } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT

export default function getNeededDate({ order, FormItem, form, setOrderData, orderIndex }) {
  return [
    {
      title: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
      dataIndex: 'neededDate',
      width: 210,
      render: (_, product, productIndex) => {
        // eslint-disable-next-line no-param-reassign
        product.neededDate = moment(timestampToTime())
          .add(!isNil(product.deliveryCycle) ? Number(product.deliveryCycle) + 3 : 10, 'days')
          .format(DEFAULT_DATETIME_FORMAT);
        return (
          <div className="columns-item">
            <FormItem>
              {form.getFieldDecorator(`neededDate${productIndex}`, {
                initialValue: product.neededDate,
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
                    placeholder={intl.get('mallf.myMall.model.requestDate').d('需求日期')}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    style={{ width: 160 }}
                    value={product.neededDate ? moment(product.neededDate) : null}
                    disabled
                    onChange={(date) => {
                      setOrderData((data) => {
                        const newData = [...data];
                        newData[orderIndex].shoppingCartDTOList[
                          productIndex
                        ].neededDate = date.format(DATETIME_MIN);
                        return data;
                      });
                      form.setFieldsValue({
                        [`neededDate${productIndex}`]: date.format(DATETIME_MIN),
                      });
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
                              p.neededDate = product.neededDate;
                              form.setFieldsValue({
                                [`neededDate${i}`]: product.neededDate,
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
