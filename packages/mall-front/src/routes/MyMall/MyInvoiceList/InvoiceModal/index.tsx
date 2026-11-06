import React, { useMemo, useEffect } from 'react';
import { autorun } from 'mobx';
import { Observer } from 'mobx-react';
import { Alert } from 'choerodon-ui';
import { Spin, DataSet, Modal } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { submitInvoiceService } from 'services/myInvoiceService';
import Swal from 'components/swal';

import { invoiceFormDs, productTableDs, invoiceTableDs } from './ModalDataSet';
import { OpenInvoiceForm, OpenInvoiceFormReadOnly, ProductTable, InvoiceTable } from './renderer';
import LogistModal from './LogistModal';
import './index.less';

interface IInvoiceDetailProps {
  readOnly: boolean,
  line: any,
  [x: string]: any,
}

export const OpenInvoiceDetail: React.FC<IInvoiceDetailProps> = ({
  readOnly,
  line: {
    invoiceStatus,
    consignmentCode,
    invoiceRequestId,
    invoiceState, // GATHER 集中开票
    consignmentEntryVOList,
  },
  modal,
  dataSet,
  cecFromCode,
}) => {
  const { skuId } = consignmentEntryVOList?.[0];
  const formDs = useMemo(() => new DataSet(invoiceFormDs({readOnly, consignmentCode, invoiceRequestId, cecFromCode, invoiceState, skuId })), []);
  const prodTableDs = useMemo(() => new DataSet(productTableDs({readOnly, consignmentCode, invoiceRequestId})), []);
  const invTableDs = useMemo(() => new DataSet(invoiceTableDs({ consignmentCode})), []);

  useEffect(() => {
    autorun(() => {
      modal.update({
        onOk: submitInvoice,
        okProps: {
          loading: formDs.status === DataSetStatus.loading,
        },
      });
    });
  }, [formDs]);

  async function submitInvoice() {
    if(!readOnly) {
      const flag = await formDs.validate();
      if(!flag) return false;
      const params = formDs?.current?.toJSONData() || {};
      formDs.status = DataSetStatus.loading;
      try {
        const res = await submitInvoiceService(params);
        if(!res.success) {
          Swal(res.resultMsg);
          return false;
        };
        dataSet.queryData(dataSet.queryParameter);
      } catch {
        return false;
      } finally {
        formDs.status = DataSetStatus.ready;
      }
    };
  }

  function openLogistModal() {
    Modal.open({
      title: intl.get('mallf.myInvoice.button.logistInfo').d('查看物流'),
      drawer: true,
      style: { width: 740 },
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <LogistModal consignmentCode={consignmentCode} />,
    });
  }
  return (
    <div className='open-invoice-detail'>
      <Observer>
        {() => (
          <Spin dataSet={formDs}>
            <Alert
              r-if={formDs?.current?.get('reason')}
              showIcon
              iconType='error'
              message={<>{intl.get(`mallf.myInvoice.view.invoice.error`).d('开票失败')}: {formDs?.current?.get('reason')}</>}
              type='error'
              style={{
                margin: '-20px -20px 20px',
                border: 'none',
                color: '#FF5532',
              }}
            />
            <p className="content-box-title">
              {intl.get(`mallf.myInvoice.view.invoice.baseInfo`).d('开票信息')}
            </p>
            {readOnly ? <OpenInvoiceFormReadOnly dataSet={formDs} /> : <OpenInvoiceForm dataSet={formDs} />}
          </Spin>
         )}
      </Observer>
      <p className="content-box-title">
        {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
      </p>
      <ProductTable formDs={formDs} dataSet={prodTableDs} />
      {invoiceStatus === 'SUCCEED' && (
      <>
        <p className="content-box-title">
          {intl.get('mallf.common.model.invoiceInfo').d('发票信息')}
        </p>
        <InvoiceTable dataSet={invTableDs} openLogistModal={openLogistModal} />
      </>
        )}
    </div>
  );
};

// export const CheckInvoiceDetail: React.FC<{orderId: string}> = ({consignmentCode}) => {
//   const formDs = useMemo(() => new DataSet(viewInvoiceFormDs()), []);
//   const tableDs = useMemo(() => new DataSet(invoiceTableDs({ consignmentCode})), []);
//   return (
//     <div className='check-invoice-detail'>
//       <Spin spinning={false}>
//         <p className="content-box-title">
//           {intl.get('hzero.common.view.baseInfo').d('基本信息')}
//         </p>
//         <InvoiceBaseForm dataSet={formDs} />
//         <p className="content-box-title">
//           {intl.get('mallf.common.model.invoiceInfo').d('发票信息')}
//         </p>
//         <InvoiceTable dataSet={tableDs} />
//       </Spin>
//     </div>
//   );
// };
