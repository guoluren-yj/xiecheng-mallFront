import React from 'react';
import moment from 'moment';
import { Icon as C7nIcon, DatePicker, Tooltip } from 'choerodon-ui';

import { getPrimaryColor, getOrganizationId, timestampToTime } from 'utils/utils';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants'; // DEFAULT_DATETIME_FORMAT
import NewLov from 'mall-front/lib/components/NewLov';

export default function getNeededDate({ order, FormItem, form, setOrderData, orderIndex }) {
  return [
    {
      title: intl.get('mallf.myMall.model.requestDate').d('需求日期'),
      dataIndex: 'neededDate',
      width: 170,
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
      title: intl.get('mallf.common.view.purpose').d('用途'),
      width: 170,
      render: (value, product, productIndex) => {
        const showFlag = !(
          product.itemCode &&
          product.warehousing === 1 &&
          product.externalSupplierFlag === 1
        );
        return (
          <>
            {showFlag ? (
              <div className="columns-item">
                <FormItem>
                  {form.getFieldDecorator(`attributeBigint1${productIndex}`, {
                    rules: [
                      {
                        required: showFlag,
                        message: intl
                          .get('hzero.common.validation.notNull', {
                            name: intl.get('mallf.common.view.purpose').d('用途'),
                          })
                          .d('用途不能为空'),
                      },
                    ],
                  })(
                    <NewLov
                      placeholder={intl.get('mallf.common.view.purpose').d('用途')}
                      value={order.ceNum}
                      code="SCUX.BSL.SPUC_USE_TYPE"
                      queryParams={() => ({
                        categoryId: product.itemCategoryId,
                        invOrganizationId: product.itemCategoryId,
                        itemCode: product.itemCode,
                        tenantId: getOrganizationId(),
                        unitId: order.DS?.toData()?.[0].attributeBigint30,
                      })}
                      lovOptions={{
                        displayField: 'applyUseTypeName',
                        valueField: 'applyUseMapId',
                      }}
                      onOk={(_, data) => {
                        setOrderData((o) => {
                          const newData = [...o];
                          newData[orderIndex].shoppingCartDTOList[productIndex].attributeBigint1 =
                            data.applyUseMapId;
                          newData[orderIndex].shoppingCartDTOList[
                            productIndex
                          ].attributeBigint1Meaning = data.applyUseTypeName;
                          return newData;
                        });
                        form.setFieldsValue({
                          [`attributeBigint1${productIndex}`]: data.applyUseMapId,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </div>
            ) : (
              <></>
            )}
          </>
        );
      },
    },
  ];
}
