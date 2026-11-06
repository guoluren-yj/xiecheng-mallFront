import React, { useEffect, useMemo, useRef } from 'react';
import { Tooltip, Icon } from 'choerodon-ui';
import { Attachment, Table, DataSet, Button, Modal as ModalPro } from 'choerodon-ui/pro';
import { compose } from 'lodash';

import Image from 'components/Image';
import intl from 'utils/intl';
import { convertImg } from 'utils/utils';
import { getDoubleUomFlag } from 'utils/configUtils';
import { RECEIVE_RECORD_INFO_TABLE } from 'utils/customizeCode';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import notification from 'utils/notification';
import { fetchCancelReceiveApi } from 'services/productAcceptService';
import { openComfirmModal } from 'utils/modals';
import { TagRender } from 'utils/renderer';
import { listDS } from './ds.js';
import ApproveHistory from './ApproveHistory';
import AcceptOrderDetail, { renderTag, colorList } from './AcceptOrderDetail/index.js';
import style from './index.less';

function AcceptRecord(props) {
  const { product, customizeTable, modal, fetchOrderData } = props;
  const {
    consignmentCode,
    orderEntryId,
    skuName,
    consignmentLineNum,
    skuCode,
    skuTypeMeaning,
  } = product;

  const ds = useMemo(() => new DataSet(listDS()), []);
  const doubleUomFlag = useMemo(() => getDoubleUomFlag(), []);
  const needUpdateFlag = useRef(false);

  useEffect(() => {
    fetchData();
    if (modal) {
      modal.update({
        // 刷新外部输出数据
        afterClose: () => {
          if (needUpdateFlag.current && typeof fetchOrderData === 'function') {
            fetchOrderData();
          }
        },
      });
    }
  }, []);

  function handleImgUrl(code, url) {
    return code === 'CATA' || code === 'MANUAL' ? url : convertImg(url, 1, code);
  }

  function fetchData() {
    ds.setQueryParameter('consignmentCode', consignmentCode);
    ds.setQueryParameter('orderEntryId', orderEntryId);
    ds.setQueryParameter('consignmentLineNum', consignmentLineNum);
    ds.query();
  }

  function handleCloseApprove(record) {
    openComfirmModal({
      children: intl
        .get('mallf.myMall.view.accept.cancelTip')
        .d('该操作将会取消整个接收单，请确认是否取消？'),
      title: intl.get('mallf.common.view.prompt').d('提示'),
      border: false,
      onOk: async () => {
        needUpdateFlag.current = true;
        const res = await fetchCancelReceiveApi(record.toData());
        if (res) {
          notification.success();
          ds.query();
        }
      },
    });
  }

  function handleEditApprove(record) {
    handleToAcceptDetail(record.get('receiptCode'), false);
  }

  function handleToAcceptDetail(receiptCode, readOnly = true) {
    needUpdateFlag.current = true;
    ModalPro.open({
      destroyOnClose: true,
      mask: true,
      style: { width: 1090 },
      drawer: true,
      okCancel: false,
      closable: true,
      title: readOnly
        ? intl.get('mallf.myOrder.view.title.checkAcceptOrder').d('查看接收单')
        : intl.get('mallf.myOrder.view.title.efitAcceptOrder').d('编辑接收单'),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <AcceptOrderDetail receiptCode={receiptCode} readOnly={readOnly} parentDs={ds} />,
    });
  }

  const columns = [
    {
      name: 'receiptStatusMeaning',
      width: 150,
      renderer: ({ text, record }) => {
        const { color } = renderTag(colorList, record.get('receiptStatus'));
        return TagRender({
          text,
          type: color,
          icon: record.get('approveRemark') && record.get('receiptStatus') === 'REJECTED' && (
            <Tooltip title={record.get('approveRemark')}>
              <Icon
                type="error"
                style={{
                  fontSize: '14px',
                  marginLeft: '5px',
                  fontWeight: 400,
                  verticalAlign: 'text-bottom',
                }}
              />
            </Tooltip>
          ),
        });
      },
    },
    {
      name: 'operation',
      width: 150,
      align: 'left',
      lock: 'right',
      command: ({ record }) => [
        record.get('receiptStatus') === 'REJECTED' && (
          <Button
            color="primary"
            funcType="link"
            onClick={() => {
              handleEditApprove(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </Button>
        ),
        record.get('receiptStatus') === 'REJECTED' && (
          <Button
            color="primary"
            funcType="link"
            onClick={() => {
              handleCloseApprove(record);
            }}
          >
            {intl.get(`mallf.common.button.cancel`).d('取消')}
          </Button>
        ),
        record.get('approveType') && (
          <ApproveHistory
            receiptCode={record.get('receiptCode')}
            approveType={record.get('approveType')}
          />
        ),
      ],
    },
    {
      title: intl.get(`mallf.myMall.model.receiptCode`).d('商城接收单编码-行号'),
      name: 'receiptCode',
      width: 200,
      renderer: ({ value, record }) =>
        value ? (
          <Button color="primary" funcType="link" onClick={() => handleToAcceptDetail(value)}>
            {value}
            {record.get('receiptLineNum') ? `-${record.get('receiptLineNum')}` : ''}
          </Button>
        ) : (
          '-'
        ),
    },
    {
      title: doubleUomFlag
        ? intl.get('mallf.myMall.view.incoming.quantity').d('接收基本数量')
        : intl.get(`mallf.myMall.model.accept.quantity`).d('接收数量'),
      name: 'quantityMeaning',
      width: 160,
    },
    {
      title: intl.get(`mallf.myMall.model.accept.quantity`).d('接收数量'),
      name: 'packageQuantityMeaning',
      width: 160,
      visible: doubleUomFlag,
    },
    {
      title: intl.get(`mallf.myMall.view.common.annex`).d('附件'),
      name: 'attachmentUuid',
      width: 160,
      renderer: ({ value }) => (
        <Attachment
          readOnly
          showHistory
          funcType="link"
          viewMode="popup"
          labelLayout="float"
          value={value}
          bucketName="private-bucket"
          bucketDirectory="mall-front"
        />
      ),
    },
    {
      title: intl.get(`mallf.myMall.model.trxDate`).d('接收日期'),
      name: 'receiptedTime',
      width: 200,
    },
  ].filter((n) => n.visible !== false);

  return (
    <div className={style.content}>
      <div className="content-sku">
        <Image
          value={handleImgUrl(product.cecFromCode, product.primaryUrl)}
          width={47}
          height={47}
        />
        <div className="content-sku-info">
          <p className="content-title">{skuName}</p>
          <p className="content-sku-code">
            {intl.get('mallf.myOrder.view.productCode').d('商品编码')}：{skuCode}
            <span className="content-sku-type">
              {intl.get('mallf.common.view.skuTypeMeaning').d('商品类型')}：{skuTypeMeaning}
            </span>
          </p>
        </div>
      </div>
      {customizeTable(
        { code: RECEIVE_RECORD_INFO_TABLE },
        <Table style={{ maxHeight: 'calc(100vh - 280px)' }} dataSet={ds} columns={columns} />
      )}
    </div>
  );
}
export default compose(
  c7nCustomize({
    unitCode: [RECEIVE_RECORD_INFO_TABLE],
  })
)(AcceptRecord);

export function openAcceptRecord(props = {}, modalProps = {}) {
  ModalPro.open({
    destroyOnClose: true,
    mask: true,
    closable: false,
    drawer: true,
    style: { width: 1190 },
    title: intl.get('mallf.myMall.view.catalog.acceptRecord').d('接收记录'),
    okText: intl.get('mallf.myMall.button.close').d('关闭'),
    cancelButton: false,
    children: <AcceptRecord {...props} />,
    ...modalProps,
  });
}
