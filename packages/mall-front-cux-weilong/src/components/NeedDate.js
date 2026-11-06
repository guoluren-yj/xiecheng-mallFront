/* eslint-disable no-param-reassign */
import React, { useLayoutEffect } from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import ItemLov from './ItemLov';

export default function getNeededDate({
  order,
  FormItem,
  form,
  setOrderData,
  orderIndex,
  neededDateConfig = {},
}) {
  const { hideFieldList = [] } = getUserConfigInfo();
  useLayoutEffect(() => {
    order.shoppingCartDTOList.forEach((p) => {
      p.itemEditable = !p.itemCode;
    });
  }, []);

  return [
    order.shoppingCartDTOList[0].productSource !== 'CATA' &&
      !order.shoppingCartDTOList[0].qtHeaderNo && {
        title: '物料信息',
        dataIndex: 'itemCode',
        render: (_, product, productIndex) => {
          return (
            <ItemLov
              order={order}
              product={product}
              productIndex={productIndex}
              setOrderData={setOrderData}
              orderIndex={orderIndex}
            />
          );
        },
      },
    !hideFieldList.includes('DEMAND_DATE') && {
      title: neededDateConfig.fieldName || intl.get('mallf.myMall.model.requestDate').d('需求日期'),
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
                </>
              )}
            </FormItem>
          </div>
        );
      },
    },
  ].filter((p) => !!p);
}
