import React from 'react';
// import { isEmpty } from 'lodash';
// import { Row, Tooltip, Button } from 'choerodon-ui';

import intl from 'utils/intl';
import style from './index.less';
import DefaultForm from './DefaultForm';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
function HeaderInfo(props) {
  const {
    setOrderData,
    orderIndex,
    form,
    order,
    customizeForm,
    code,
    setCtxParams,
    orderData,
    initInvoiceData,
    // unitConfig,
    // useOtherHeaderPurchase,
  } = props;
  const itemsProps = {
    initInvoiceData,
    formLayout,
    form,
    order,
    customizeForm,
    code,
    setCtxParams,
    setOrderData,
    orderIndex,
    orderData,
  };
  return (
    <div className={style['header-info']}>
      <p className="header-info-title">
        {intl.get('mallf.applyRes.apply.fill.info').d('采购申请补充信息')}
      </p>
      <DefaultForm {...itemsProps} />
      {/* {orderData.length > 1 && (
        <Row>
          <Tooltip
            title={intl
              .get('mallf.common.view.useAll.warning')
              .d('「应用全部」不对模态框和下拉框以及附件等字段生效')}
            placement="right"
          >
            <Button
              className="purchase-header-useOther-btn"
              onClick={() => {
                useOtherHeaderPurchase({
                  message: intl
                    .getHTML('mallf.common.beforeOrder.useOther.message', {
                      value: orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1,
                      name: intl.get('mallf.common.apply.fill.info').d('采购申请补充信息'),
                    })
                    .d(
                      <span>
                        确定将
                        <strong>
                          采购申请单{orderIndex < 9 ? `0${orderIndex + 1}` : orderIndex + 1}
                        </strong>
                        的{intl.get('mallf.common.apply.fill.info').d('采购申请补充信息')}
                        至全部采购申请单吗？
                      </span>
                    ),
                  onOk: () => {
                    const { fields: f = [] } = unitConfig[code] || {};
                    const fields = f.filter((p) => p.visible === 1);
                    const filterProps = [];
                    fields.forEach((config) => {
                      const { fieldCode, fieldType, paramList = [] } = config;
                      if (
                        !(
                          isEmpty(paramList) ||
                          (!paramList.some((p) => p.paramType === 'self') &&
                            paramList
                              .filter((p) => p.paramType === 'unit')
                              .every((p) => p.paramUnitCode !== code))
                        )
                      ) {
                        if (filterProps.indexOf(fieldCode) === -1 && fieldType === 'LOV') {
                          filterProps.push(fieldCode);
                          filterProps.push(fieldCode.replace('Lov', ''));
                          filterProps.push(fieldCode.replace('Lov', 'Meaning'));
                        } else if (['TL_EDITOR', 'SELECT', 'EMPTY'].includes(fieldType)) {
                          filterProps.push(fieldCode);
                        }
                      }
                    });
                    const currentData = orderData[orderIndex].DS?.current?.toData();
                    if (!currentData) return;
                    orderData.forEach((o) => {
                      fields.forEach((config) => {
                        const { fieldCode } = config;
                        if (!filterProps.includes(fieldCode)) {
                          o.DS.current.set(fieldCode, currentData[fieldCode]);
                        }
                      });
                    });
                  },
                });
              }}
            >
              {intl.get('mallf.common.header.useOther.orders').d('应用至全部采购申请单')}
            </Button>
          </Tooltip>
        </Row>
      )} */}
    </div>
  );
}

export default HeaderInfo;
