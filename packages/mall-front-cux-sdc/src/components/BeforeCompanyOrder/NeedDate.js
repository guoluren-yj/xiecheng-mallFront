import React from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import PersonInfo from './PersonInfo';

export default function getNeededDate({
  order,
  FormItem,
  form,
  setOrderData,
  orderIndex,
  products,
  orderData,
}) {
  return [
    {
      title: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
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
      title: intl.get(`mallf.myMall.model..info`).d('人员信息'),
      dataIndex: 'person',
      key: 'personInfo',
      width: 68,
      render: (v, product) => {
        return (
          <div className="columns-item">
            <PersonInfo
              products={products}
              orderData={orderData}
              setOrderData={setOrderData}
              product={product}
              cardInfo={order.cardInfo}
              orderIndex={orderIndex}
            />
          </div>
        );
      },
    },
  ];
}
