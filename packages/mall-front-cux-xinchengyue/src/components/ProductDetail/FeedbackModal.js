import React, { useState, useMemo, useEffect } from 'react';
import { SelectBox, TextArea, DataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import {
  fetchReceipt,
  queryReceipt,
  confirmReceipt,
  withdrawReceipt,
} from '../../service/receiptService';
import { receiptStatusMap } from './receiptStatusMap';
import ds from './ds';

function FeedbackModal(props) {
  // product 同款 productData 本商品信息
  const { modal, product, productData, productId } = props;
  const [manageStatusvalue, setManageStatusValue] = useState('');
  const productParams = useMemo(
    () =>
      product.map((item) => {
        return {
          ...item,
          skuPrice: item.agreementPrice,
          supplierCompanyId: item.showSupplierCompanyId,
          supplierCompanyName: item.showSupplierName,
        };
      }),
    [product]
  );

  const DS = useMemo(() => {
    return new DataSet(ds());
  }, []);

  // 监听状态 改变按钮字段值
  useEffect(() => {
    modal.update({
      okText:
        manageStatusvalue === 'SUBMIT'
          ? intl.get('mallf.common.status.withdraw.feedback').d('修改')
          : manageStatusvalue === 'NEW' || !manageStatusvalue
          ? intl.get('mallf.common.status.confirm.submit').d('提交')
          : intl.get('mallf.common.status.confirm.feedback').d('确认'),
    });
  }, [manageStatusvalue]);

  // 查询
  useEffect(() => {
    queryReceipt({ skuId: productId }).then((res) => {
      // 为空则新建
      DS.loadData([
        {
          manageType: 'INACCURATE',
          lines: productParams,
          ...(res || {}),
        },
      ]);
      setManageStatusValue(res.manageStatus);
    });
  }, []);

  modal.handleOk(async () => {
    // 新建
    if (!manageStatusvalue) {
      const fetchParams = {
        mainSkuId: productId,
        mainSkuName: productData.skuName,
        mainSkuCode: productData.skuCode,
        mainSkuPrice: productData.taxIncludedPrice,
        mainSkuUom: productData.uomName,
        mainSupplierId: productData.supplierCompanyId,
        mainSupplierName: productData.showSupplierName,
        manageId: productData?.manageId,
        objectVersionNumber: productData?.objectVersionNumber,
        lines: productParams,
        remark: DS.current.get('remark'),
        manageType: DS.current.get('manageType'),
      };

      await fetchReceipt(JSON.stringify(fetchParams));
    }

    if (manageStatusvalue === 'NEW') {
      await fetchReceipt(JSON.stringify(DS.current.toData()));
    }

    // 确认;
    if (
      manageStatusvalue === 'REJECTED' ||
      manageStatusvalue === 'APPROVED' ||
      manageStatusvalue === 'PROCESSED'
    ) {
      await confirmReceipt(JSON.stringify(DS.current.toData()));
    }

    // 撤回
    if (manageStatusvalue === 'SUBMIT') {
      await withdrawReceipt(JSON.stringify(DS.current.toData()));
    }
  });

  // 仅在开启了强校验时展示 第二个选项
  const optionsFilter = (record) => {
    if (productData.sameSkuRule !== 2 && record.get('value') === 'CURRENT') {
      return false;
    } else {
      return true;
    }
  };

  const CurrentFrom = observer(({ dataSet }) => {
    return (
      <>
        {!manageStatusvalue && <div style={{ marginBottom: 20, fontSize: 18 }}>问题反馈</div>}
        <div style={{ marginBottom: 20, fontSize: 18 }}>
          {receiptStatusMap[manageStatusvalue]?.leftTitle}
        </div>
        <SelectBox
          dataSet={dataSet}
          name="manageType"
          style={{ marginBottom: 20 }}
          optionsFilter={optionsFilter}
        />
        <div>
          <TextArea name="remark" dataSet={dataSet} style={{ width: '100%' }} />
        </div>
        <p>{receiptStatusMap[manageStatusvalue]?.statusText}</p>
        {/* 当有处理意见时 显示 */}
        {DS.current?.get('approveRemark') && (
          <span>
            处理意见：
            {DS.current?.get('approveRemark')}
          </span>
        )}
      </>
    );
  });
  return (
    <div>
      <CurrentFrom dataSet={DS} />
    </div>
  );
}

export default FeedbackModal;
