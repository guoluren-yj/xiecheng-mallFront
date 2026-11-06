import React from 'react';
import { Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import numberRender from 'utils/numberRender';
import { TagRender } from 'utils/renderer';
import { fetchOMSInvoiceByGoodsService } from 'services/myInvoiceService';

import { InvoiceStatusType, InvoiceErrorCode } from '../enum';
import InvoiceDataSet from '../InvoiceDataSet';
import Product from './Product';
import { OpenInvoiceDetail } from '../InvoiceModal';
import { status } from '../InvoiceModal/renderer';

// interface ILine {
//   ecConsignmentCode: string;
//   invoiceTime: string;
//   consignmentEntryVOList?: any[];
//   consignmentAmountMeaning: string;
//   consignmentAmount: Number;
//   invoiceTypeName: string;
//   submitInvoiceFlag: string;
//   invoiceFlag: string;
//   invoiceStateName: string,
//   invoiceStatus: string,
//   invoiceStatusMeaning: string,
//   consignmentCode: string,
// }

const ListContent: React.FC<{dataSet: InvoiceDataSet; record: Record}> = ({ dataSet, record }) => {
  const {
    consignmentVOList = [],
    currencySymbol,
    cecFromCode,
  } = record.get([
    'consignmentVOList',
    'currencySymbol',
    'cecFromCode',
  ]);

  function openInvoiceDetailModal({line, readOnly}: { line: any; readOnly: boolean; }) {
    Modal.open({
      title: readOnly
      ? intl.get('mallf.myInvoice.button.invoiceDetails').d('开票详情')
      :intl.get('mallf.myInvoice.button.applyInvoice').d('申请开票'),
      drawer: true,
      style: { width: 1090 },
      cancelButton: !readOnly,
      okText: readOnly
      ? intl.get('hzero.common.button.close').d('关闭')
      : intl.get(`mallf.common.model.confirm`).d('确认'),
      children: <OpenInvoiceDetail readOnly={readOnly} line={line} dataSet={dataSet} cecFromCode={cecFromCode} />,
    });
  }

  async function handleGetInvoice(line: any) {
    const { consignmentCode } = line;
    const res = await fetchOMSInvoiceByGoodsService({consignmentCode});
    if(res) dataSet.queryData();
  }

  function getErrorMessage(code: string) {
    switch (code) {
      case InvoiceErrorCode.nonSupport:
        return intl.get('mallf.myInvoice.view.errorMsg.nonSupport').d('订单正在进行售后，暂不支持申请开票');
      case InvoiceErrorCode.noQuantity:
        return intl.get('mallf.myInvoice.view.errorMsg.noQuantity').d('订单已无可开票数量，不支持开票');
      default:
        break;
    }
  }

  return consignmentVOList.map((line: any) => {
    return (
      <>
        <div className="invoice-detail-ecps">
          <div className="header-ecnum">
            <span className="header-label">
              {intl.get('mallf.myInvoice.model.ecSubOrderNum').d('电商子订单号')}：
            </span>
            <span title={line.ecConsignmentCode} className="header-content">
              {line.ecConsignmentCode}
            </span>
          </div>
        </div>
        <div className="invoice-detail-body">
          <div className="invoice-product">
            {line.consignmentEntryVOList?.map(
              (product: {
                qtHeaderNo: string;
                productId: string | Number;
                skuId: string | Number;
                platformCode: string;
                cecFromCode: string;
                imagePath: string;
                primaryUrl: string;
                productName: string;
                skuName: string;
                actualPriceMeaning: string;
                actualPrice: Number;
                orderPriceFinalVO: any;
                unitPriceMeaning: string;
                unitPrice: Number;
                quantity: Number;
              }) => (
                <Product product={product} currencySymbol={currencySymbol} />
              )
            )}
          </div>
          <div
            className="invoice-price"
          >
            <span className="price-num-label">
              <Icon
                type="assignment-o"
                className="price-assignment"
              />
            </span>
            <span
              title={currencySymbol + (line.consignmentAmountMeaning || line.consignmentAmount)}
              className="price"
            >
              {currencySymbol}
              {line.consignmentAmountMeaning || numberRender(line.consignmentAmount)}
            </span>
            <div className="invoice-type">{line.invoiceStateName} </div>
          </div>
          <div className='invoice-status' title={line.invoiceStatusMeaning}>
            {TagRender({
              text: line.invoiceStatusMeaning,
              type: status(line.invoiceStatus),
              style: { maxWidth: '117px', marginRight: 0 },
              icon: line.invoiceFailedReason && (
                <Tooltip title={line.invoiceFailedReason}>
                  <Icon
                    type='error'
                    style={{
                      fontSize: '14px',
                      marginLeft: '5px',
                      fontWeight: 400,
                      verticalAlign: 'text-bottom',
                    }}
                  />
                </Tooltip>
              ),
            })}
          </div>
          <div className='invoice-operate'>
            {/* 未开票/开票失败的随货开票展示获取发票 */}
            <Button
              r-if={[InvoiceStatusType.nonInvoice, InvoiceStatusType.failed].includes(line.invoiceStatus) && line.invoiceState === 'FOLLOW'}
              funcType={FuncType.flat}
              color={ButtonColor.primary}
              className="invoice-operate-btn"
              title={intl.get('mallf.myInvoice.button.getInvoice').d('获取发票')}
              onClick={() => handleGetInvoice(line)}
            >
              {intl.get('mallf.myInvoice.button.getInvoice').d('获取发票')}
            </Button>
            <Tooltip
              title={
                !line.submitInvoiceFlag && getErrorMessage(line.submitInvoiceDisabledCode)
              }
            >
              {/* 未开票/开票失败的集中开票展示申请开票 */}
              <Button
                r-if={[InvoiceStatusType.nonInvoice, InvoiceStatusType.failed].includes(line.invoiceStatus) && line.invoiceState !== 'FOLLOW'}
                funcType={FuncType.raised}
                color={ButtonColor.primary}
                className="primary-btn"
                disabled={!line.submitInvoiceFlag}
                onClick={() => {
                  openInvoiceDetailModal({
                    line,
                    readOnly: false,
                  });
                }}
                title={intl.get('mallf.myInvoice.button.applyInvoice').d('申请开票')}
              >
                {intl.get('mallf.myInvoice.button.applyInvoice').d('申请开票')}
              </Button>
            </Tooltip>
            <Button
              r-if={[InvoiceStatusType.processing, InvoiceStatusType.success].includes(line.invoiceStatus)}
              funcType={FuncType.flat}
              color={ButtonColor.primary}
              className="invoice-operate-btn"
              onClick={() => {
                openInvoiceDetailModal({
                  line,
                  readOnly: true,
                });
              }}
              title={intl.get('mallf.myInvoice.button.invoiceDetails').d('开票详情')}
            >
              {intl.get('mallf.myInvoice.button.invoiceDetails').d('开票详情')}
            </Button>
          </div>
        </div>
      </>
    );
  });
};

export default ListContent;
