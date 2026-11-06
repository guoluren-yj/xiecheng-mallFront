import React from 'react';
import { Form, Table, DataSet, TextField, Lov, Select, TextArea, Output, Button, Tooltip } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { ColumnRenderProps } from 'choerodon-ui/pro/lib/table/Column';
import { ResizeType } from 'choerodon-ui/pro/lib/text-area/enum';

import intl from 'utils/intl';
import { TagRender } from 'utils/renderer';
import Link from 'components/Link';

import { InvoiceType } from '../enum';
import './index.less';

// 查看发票-基本信息
export const InvoiceBaseForm: React.FC<{dataSet: DataSet}> = ({dataSet}) => {
  return (
    <Form dataSet={dataSet} columns={3} className="c7n-pro-vertical-form-display">
      <Output name="orderCode" />
      <Output name="cecOrderCode" />
      <Output name="invoiceMethod" />
    </Form>
  );
};

// 申请开票-开票信息
export const OpenInvoiceForm: React.FC<{dataSet: DataSet}> = ({dataSet}) => {
  return (
    <Form
      dataSet={dataSet}
      labelLayout={LabelLayout.float}
      columns={3}
      style={{marginBottom: 25}}
    >
      <TextField name="ecConsignmentCode" disabled />
      <Select name="invoiceTypeSelect" />
      <Select name="invoiceContentSelect" />
      <Lov name='billToAddressLov' />
      <Lov name='invoiceHeaderLov' />
      <TextField name='taxRegistrationNumber' disabled />
      <TextField name='depositBank' disabled />
      <TextField name='bankAccountNum' disabled />
      <TextField name='taxRegistrationAddress' disabled />
      <TextField name='taxRegistrationPhone' disabled />
      <TextArea name="remark" newLine resize={ResizeType.both} />
    </Form>
  );
};

// 开票详情-开票信息
export const OpenInvoiceFormReadOnly: React.FC<{dataSet: DataSet}> = ({dataSet}) => {
  return (
    <Form
      dataSet={dataSet}
      columns={3}
      className="c7n-pro-vertical-form-display"
      style={{marginBottom: 25}}
    >
      <Output name="ecConsignmentCode" />
      <Output
        name="requestStatusMeaning"
        renderer={() =>
          TagRender({
            text: dataSet?.current?.get('requestStatusMeaning'),
            type: status(dataSet?.current?.get('requestStatus')),
          })
        }
      />
      <Output name="invoiceTypeMeaning" />
      <Output name="invoiceContentName" />
      <Output className='text-overflow' name="billToAddress" renderer={({value}) => <Tooltip title={value}>{value}</Tooltip>} />
      <Output name="invoiceHeader" />
      <Output name="taxRegistrationNumber" />
      <Output className='text-overflow' name="depositBank" renderer={({value}) => <Tooltip title={value}>{value}</Tooltip>} />
      <Output name="bankAccountNum" />
      <Output className='text-overflow' name="taxRegistrationAddress" renderer={({value}) => <Tooltip title={value}>{value}</Tooltip>} />
      <Output name="taxRegistrationPhone" />
      <Output name="remark" />
    </Form>
  );
};

// 商品信息-表格
export const ProductTable:React.FC<{formDs: DataSet, dataSet: DataSet}> = ({formDs, dataSet}) => {
  const coloums = [
    {
      name: 'skuName',
    },
    {
      name: 'invoiceRequestQuantity',
      width: 200,
      renderer: ({record, value}: ColumnRenderProps) => {
        const returnQuantity = Math.abs(record?.get('returnQuantity'));
        const flag = returnQuantity > 0;
        return (
          <Tooltip
            title={flag && (
              <>
                <p style={{marginBottom: 5}}>{intl.get('mallf.myInvoice.view.consignmentQuantity').d('商品行数量')}: {record?.get('consignmentQuantity')}</p>
                <p>{intl.get('mallf.myInvoice.view.returnQuantity').d('已售后数量')}: {returnQuantity}</p>
              </>
            )}
          >
            {flag ? <span style={{color: '#FF5533'}}>{value}</span> : value}
          </Tooltip>
        );
      },
    },
    {
      name: 'unitPriceMeaning',
      width: 200,
      align: ColumnAlign.right,
      renderer: ({record, value}: ColumnRenderProps) => `${record?.get('currencySymbol') || ''}${value}`,
    },
    {
      name: 'entryAmountMeaning',
      width: 200,
      align: ColumnAlign.right,
      renderer: ({record, value}: ColumnRenderProps) => `${record?.get('currencySymbol') || ''}${value}`,
    },
  ];
  return (
    <Table
      dataSet={dataSet}
      columns={coloums}
      customizedCode="MALL.INVOICELIST.PRODUCT.INFO.TABLE"
      style={{marginBottom: 25}}
      footer={() => (
        <div className='req-total-amount'>
          <div className='label'>{intl.get('mallf.myInvoice.view.reqTotalAmount').d('申请金额汇总')}</div>
          <div className='amount'>{formDs?.current?.get('currencySymbol')}{formDs?.current?.get('totalAmountMeaning')}</div>
        </div>
      )}
    />
  );
};

// 发票信息-表格
export const InvoiceTable: React.FC<{dataSet: DataSet, openLogistModal: () => void}> = ({dataSet, openLogistModal}) => {
  const colunms = [
    {
      name: 'invoiceCode',
      width: 160,
    },
    {
      name: 'invoiceBatch',
      width: 160,
    },
    {
      name: 'invoiceTypeMeaning',
      width: 180,
    },
    {
      name: 'invoiceContentName',
      width: 100,
    },
    {
      name: 'invoiceAmountMeaning',
      width: 120,
      align: ColumnAlign.right,
      renderer: ({record, value}: ColumnRenderProps) => `${record?.get('currencySymbol') || ''}${value}`,
    },
    {
      name: 'invoiceTime',
      width: 100,
    },
    {
      name: 'operation',
      renderer: ({ record }: ColumnRenderProps) => {
        return (
          <>
            <Button
              r-if={record?.get('fileUrl')}
              funcType={FuncType.link}
              color={ButtonColor.primary}
            >
              <Link
                to={record?.get('fileUrl')}
              >
                {intl.get('mallf.myInvoice.button.electronicInvoice').d('查看电子发票')}
              </Link>
            </Button>
            <Button
              r-if={InvoiceType.SPECIAL_INVOICE === record?.get('invoiceTypeCode')} // 只专票(纸质)展示物流
              funcType={FuncType.link}
              color={ButtonColor.primary}
              onClick={() => openLogistModal()}
            >
              {intl.get('mallf.myInvoice.button.viewLogistInfo').d('查看发票物流')}
            </Button>
            <span r-if={!record?.get('fileUrl') && record?.get('invoiceTypeCode') === 'VAT_INVOICE'}>-</span>
          </>
        );
      },
    },
  ];
  return (
    <Table
      dataSet={dataSet}
      columns={colunms}
      customizedCode="MALL.INVOICELIST.INVOICE.INFO.TABLE"
    />
  );
};

export const status = (invoiceStatus: any) => {
  let type: string;
  switch (invoiceStatus) {
    case 'NON_INVOICE':
      type = 'failure';
      break;
    case 'PROCESSING':
    case 'PART_INVOICE':
    case 'SUBMITTED':
      type = 'warning';
      break;
    case 'SUCCEED':
    case 'PASS':
      type = 'success';
      break;
    case 'FAILED':
      type = 'danger';
      break;
    default:
      type = 'warning';
      break;
  }
  return type;
};
