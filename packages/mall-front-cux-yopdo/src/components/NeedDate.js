import React from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, getUserConfigInfo, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT

function getNeededDate({ order, FormItem, form, setOrderData, orderIndex, neededDateConfig = {} }) {
  const { hideFieldList = [] } = getUserConfigInfo();
  return [
    !hideFieldList.includes('DEMAND_DATE') && {
      title:
        neededDateConfig.fieldName ||
        intl.get('mallf.companyOrder.model.requestDate').d('需求日期'),
      dataIndex: 'neededDate',
      width: 210,
      render: (value, product, productIndex) => {
        if (value?.includes('NaN')) {
          // eslint-disable-next-line no-param-reassign
          product.neededDate = '';
          // eslint-disable-next-line no-param-reassign
          value = '';
        }
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
                          intl.get('mallf.companyOrder.model.requestDate').d('需求日期'),
                      })
                      .d('需求日期不能为空'),
                  },
                ],
              })(
                <>
                  <DatePicker
                    placeholder={
                      neededDateConfig.fieldName ||
                      intl.get('mallf.companyOrder.model.requestDate').d('需求日期')
                    }
                    disabled={neededDateConfig.editable === 0}
                    format="YYYY-MM-DD"
                    allowClear={false}
                    style={{ width: 160 }}
                    value={product?.neededDate ? moment(value) : null}
                    onChange={(date) => {
                      setOrderData((data) => {
                        const newData = [...data];
                        if (newData[orderIndex].shoppingCartDTOList[productIndex]) {
                          newData[orderIndex].shoppingCartDTOList[
                            productIndex
                          ].neededDate = date?.format(DATETIME_MIN);
                        }
                        return newData;
                      });
                      form.setFieldsValue({
                        [`neededDate${productIndex}`]: date?.format(DATETIME_MIN),
                      });
                    }}
                    disabledDate={(currentDate) =>
                      moment(timestampToTime()).isAfter(currentDate, 'day')
                    }
                  />
                  {order.shoppingCartDTOList?.length > 1 && (
                    <Tooltip
                      title={intl
                        .get('mallf.companyOrder.view.neededDate.info')
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
      title: '成本中心',
      dataIndex: 'costCenter',
      width: 150,
      render: (v, product) => {
        const { budgetInfoList = [] } = product || {};
        const { budget = '' } = budgetInfoList[0] || {};
        const { costCenterMeaning } = JSON.parse(budget);
        return <span>{costCenterMeaning || '-'}</span>;
      },
    },
  ].filter((p) => !!p);
}

export default getNeededDate;
