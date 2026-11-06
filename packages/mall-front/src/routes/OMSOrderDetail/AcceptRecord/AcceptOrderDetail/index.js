import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Form, Output, TextField, Button } from 'choerodon-ui/pro';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import { compose } from 'lodash';
import notification from 'utils/notification';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { fetchAcceptSubmitApi, fetchCancelReceiveApi } from 'services/productAcceptService';
import { TagRender } from 'utils/renderer';
import { openComfirmModal } from 'utils/modals';
import intl from 'utils/intl';

import styles from './index.less';
import { productDS, freightDS, baseDS } from './ds';

export function renderTag(list = [], value = '') {
  const initStyle = { border: 'none' };
  const defaultColor = 'grey';
  function render() {
    const newList = list
      .map((i) => {
        if (i.matchList.includes(value)) {
          return i?.color || defaultColor;
        }
        if (i.matchList.length === 0) {
          return i?.color || defaultColor;
        }
        return undefined;
      })
      .find((item) => !!item);
    return newList;
  }
  const color = render();

  return { color, initStyle };
}

export const colorList = [
  { color: 'success', matchList: ['APPROVED', 'RECEIVED'] },
  { color: 'danger', matchList: ['REJECTED'] },
  { color: 'warning', matchList: ['APPROVING'] },
  { color: 'failure', matchList: [] },
];

const UNIT_CODE_READONLY = {
  collapse: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.PANEL',
  base: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.BASIC_INFO',
  product: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.PRODUCT_INFO',
  freight: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.FEIGHT_INFO',
};
const UNIT_CODE_EDIT = {
  collapse: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.PANEL.EDIT',
  base: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.BASIC_INFO.EDIT',
  product: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.PRODUCT_INFO.EDIT',
  freight: 'MALL.OMS.ORDER.LIST.RECEIPT_RECORD.FEIGHT_INFO.EDIT',
};

const AcceptOrderDetail = (props) => {
  const { customizeTable, customizeForm, receiptCode, readOnly = true } = props;
  const baseDs = useMemo(() => new DataSet(baseDS()), []);
  const productDs = useMemo(() => new DataSet(productDS(readOnly)), [readOnly]);
  const freightDs = useMemo(() => new DataSet(freightDS()), []);
  const UNIT_CODE = useMemo(() => (readOnly ? UNIT_CODE_READONLY : UNIT_CODE_EDIT), [readOnly]);

  useEffect(() => {
    if (receiptCode) {
      initData();
    }
  }, [receiptCode]);

  const initData = async () => {
    productDs.setQueryParameter('receiptCode', receiptCode);
    productDs.query();
    freightDs.setQueryParameter('receiptCode', receiptCode);
    freightDs.query();
    baseDs.setQueryParameter('receiptCode', receiptCode);
    await baseDs.query();
    updateModalFooter();
  };

  const productColumns = useMemo(
    () => [
      { name: 'receiptLineNum', width: 100 },
      {
        width: 220,
        name: 'consignmentCode',
        renderer: ({ value, record }) =>
          value +
          (record?.get('consignmentLineNum') ? `-${record?.get('consignmentLineNum')}` : ''),
      },
      { width: 180, name: 'skuCode' },
      { name: 'skuName' },
      { name: 'skuTypeMeaning', width: 100 },
      { name: 'quantityMeaning', width: 100, editor: !readOnly },
      { name: 'attachmentUuid', width: 160, editor: !readOnly },
    ],
    [readOnly]
  );

  const feightColumns = [
    { width: 100, name: 'receiptLineNum' },
    {
      width: 220,
      name: 'consignmentCode',
      renderer: ({ value, record }) =>
        value + (record?.get('consignmentLineNum') ? `-${record?.get('consignmentLineNum')}` : ''),
    },
    { width: 160, name: 'skuName' },
    { width: 140, name: 'itemCode' },
    { width: 140, name: 'itemName' },
    { width: 120, name: 'extraCostTypeMeaning' },
    { width: 120, name: 'quantityMeaning' },
  ];

  const baseFields = useMemo(
    () =>
      [
        { name: 'receiptCode' },
        { name: 'cecReceiptCode' },
        { name: 'consignmentCode' },
        {
          name: 'receiptStatusMeaning',
          renderer: ({ text, record }) => {
            const { color } = renderTag(colorList, record?.get('receiptStatus'));
            return TagRender({
              text,
              type: color,
            });
          },
          visible: !readOnly,
        },
        { name: 'receiptedTime' },
        { name: 'createdByName' },
      ].filter((item) => !item.visible),
    [readOnly]
  );

  function updateModalFooter() {
    const { modal } = props;
    const current = baseDs?.current || {};
    const footerArr = [
      {
        footer: (okBtn, cancelBtn) => (
          <>
            <Button color="primary" onClick={() => handleSubmit()}>
              {intl.get('smodr.orderLine.view.submit').d('提交')}
            </Button>
            {cancelBtn}
          </>
        ),
        show: !readOnly,
      },
      {
        footer: () => (
          <>
            <Button onClick={() => handleCancelReceive()}>
              {intl.get('mallf.myMall.view.accept.cancelAccept').d('取消接收单')}
            </Button>
            <Button
              onClick={() => {
                modal.close();
              }}
            >
              {intl.get('smodr.orderLine.model.close').d('关闭')}
            </Button>
          </>
        ),
        show: current?.get('receiptStatus') === 'REJECTED',
      },
    ];
    const newFooter = footerArr.find((item) => Boolean(item.show))?.footer;
    if (newFooter) {
      modal.update({
        footer: newFooter,
      });
    }
  }

  async function handleSubmit() {
    const { modal, parentDs } = props;
    const validateFlag = await productDs.validate();
    if (validateFlag) {
      const receiptEntryList = productDs
        .toData()
        .map((item) => ({ ...item, receiveSkuStock: null }));
      const params = {
        receiptTime: moment().format(DEFAULT_DATETIME_FORMAT),
        receiptCode,
        receiptEntryList,
      };
      const res = await fetchAcceptSubmitApi(params);
      if (res) {
        notification.success();
        if (parentDs) parentDs.query();
        if (modal) modal.close();
      }
    }
  }

  function handleCancelReceive() {
    const { modal, parentDs } = props;
    openComfirmModal({
      children: intl
        .get('mallf.myMall.view.accept.cancelTip')
        .d('该操作将会取消整个接收单，请确认是否取消？'),
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      onOk: async () => {
        const res = await fetchCancelReceiveApi(baseDs?.current?.toData());
        if (res) {
          notification.success();
          if (parentDs) parentDs.query();
          if (modal) modal.close();
        }
      },
    });
  }

  return (
    <div className={styles['page-content-layout']}>
      <div className="header-line">{intl.get('smodr.acceptOrder.view.baseInfo').d('基本信息')}</div>
      {customizeForm(
        { code: UNIT_CODE.base },
        <Form
          columns={3}
          className={readOnly ? 'c7n-pro-vertical-form-display' : ''}
          labelLayout={readOnly ? 'horizontal' : 'float'}
          dataSet={baseDs}
          disabled={!readOnly}
          customizeCode={UNIT_CODE.base}
        >
          {baseFields.map((field) =>
            readOnly ? (
              <Output name={field.name} renderer={field.renderer} />
            ) : (
              <TextField name={field.name} />
            )
          )}
        </Form>
      )}
      <div className="header-line">
        {intl.get('smodr.acceptOrder.view.productInfo').d('接收行商品信息')}
      </div>
      {customizeTable(
        { code: UNIT_CODE.product },
        <Table
          dataSet={productDs}
          columns={productColumns}
          customizedCode={UNIT_CODE.product}
          style={{ maxHeight: 230 }}
        />
      )}
      <div className="header-line">
        {intl.get('smodr.acceptOrder.view.additionInfo').d('接收行附加费信息')}
      </div>
      {customizeTable(
        { code: UNIT_CODE.freight },
        <Table
          dataSet={freightDs}
          columns={feightColumns}
          customizedCode={UNIT_CODE.freight}
          style={{ maxHeight: 230 }}
        />
      )}
    </div>
  );
};

export default compose(
  c7nCustomize({
    unitCode: [...Object.values(UNIT_CODE_READONLY), ...Object.values(UNIT_CODE_EDIT)],
  })
)(AcceptOrderDetail);
