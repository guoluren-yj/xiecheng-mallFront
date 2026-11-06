/* eslint-disable no-param-reassign */
import React, { useMemo, useEffect } from 'react';
import moment from 'moment';
import { Table, DataSet, Icon, message, Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';

import Link from 'components/Link';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { receiveomsPreviewConfirm } from 'services/productAcceptService';
import { precisionEditor } from 'utils/precision';
import image from '@/assets/images/shougongshenqing-product.png';
import Image from 'components/Image';
import { tableds, embedTableds } from './ds';
import styles from './index.less';

export default function EcceptIn(props) {
  const { acceptData, modal, setState, fetchOrderData } = props;
  const tableDs = useMemo(() => {
    return new DataSet(tableds());
  }, []);

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    const err = await Promise.all(tableDs.map((p) => p.get('ds')?.validate()));
    if (err.some((p) => !p)) return false;
    tableDs.forEach((record) => {
      record.set('receiveSkuStock', record.get('ds').toData());
    });
    const allData = tableDs.toData();
    const receiptEntryList = acceptData
      .filter((n) => n.checked)
      .map((p) => {
        return {
          waitingReceiveQuantity: p.waitingReceiveQuantity,
          freightFlag: p.freightFlag,
          cecConsignmentCode: p.srmConsignmentCode,
          consignmentLineNum: p.consignmentLineNum,
          consignmentCode: p.consignmentCode,
          remark: p.remark,
          quantity: p.thisTimeReceiveQuantity,
          attachmentUuid: p.attachmentUuid,
          consignmentEntryId: p.consignmentEntryId,
        };
      });
    receiptEntryList.forEach((p) => {
      const current = allData.find((f) => f.consignmentEntryId === p.consignmentEntryId);
      if (allData.some((f) => f.consignmentEntryId === p.consignmentEntryId)) {
        p.receiveSkuStock = current.receiveSkuStock;
        p.receiveAndStorageFlag = current.receiveAndStorageFlag;
      }
    });
    const params = {
      receiptTime: moment().format(DEFAULT_DATETIME_FORMAT),
      receiptEntryList,
    };
    await receiveomsPreviewConfirm(params);
    message.destroy();
    message.config({
      top: 100,
      bottom: 100,
      duration: 2.5,
    });
    message.success(
      intl.get('mallf.myOrder.order.goods.success').d('收货成功'),
      undefined,
      undefined,
      'top'
    );
    modal.close();
    setState({ acceptVisible: false });
    fetchOrderData();
  }

  useEffect(() => {
    tableDs.loadData(
      acceptData
        ?.filter((p) => p.receiveAndStorageFlag === 1)
        .map((product) => {
          const embedTableDs = new DataSet(
            embedTableds({ tableDs, consignmentEntryId: product.consignmentEntryId })
          );
          const embedData = product.receiveSkuStock;
          embedTableDs.loadData(embedData);
          embedTableDs.forEach((record, index) => {
            record.set({
              consignmentEntryId: product.consignmentEntryId,
              uomPrecision: product.uomPrecision,
              cecFromCode: product.cecFromCode,
              inventoryId: product.inventoryId || record.get('inventoryId'),
              inventoryCode: product.inventoryCode || record.get('inventoryCode'),
              inventoryName: product.inventoryName || record.get('inventoryName'),
              quantity: index === 0 ? product.thisTimeReceiveQuantity : 0,
            });
          });
          return {
            ...product,
            ds: embedTableDs,
            expanded: true,
          };
        })
    );
  }, []);

  const ProductInfo = ({ product, className = '', isEmbed }) => {
    const disabled = product.cecFromCode === 'MANUAL' || !!product.qtHeaderNo || isEmbed;
    return (
      <div className={classNames([styles['accept-info'], className])}>
        <Link
          disabled={disabled}
          to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
        >
          <Image
            value={
              product.cecFromCode === 'MANUAL' ? image : product.primaryUrl || product.mediaPath
            }
            width={28}
            height={28}
          />
        </Link>
        <div className="product-name-one">
          <Link
            disabled={disabled}
            className="product-name-label text-overflow"
            to={`/product-detail?productId=${product.skuId}&sourceFrom=${product.cecFromCode}`}
            title={product.skuName}
          >
            {product.skuName}
          </Link>
        </div>
      </div>
    );
  };

  const columns = [
    {
      name: 'productInfo',
      width: 515,
      tooltip: 'none',
      renderer: ({ record }) => {
        return <ProductInfo product={record.toData()} />;
      },
    },
    {
      name: 'thisTimeReceiveQuantity',
    },
  ];

  const embedColumns = [
    {
      name: 'productInfo',
      width: 240,
      tooltip: 'none',
      renderer: ({ record }) => {
        return (
          <ProductInfo
            product={record.toData()}
            className={styles['embed-table-productInfo']}
            isEmbed
          />
        );
      },
    },
    {
      name: 'skuCode',
    },
    {
      name: 'inventoryLov',
      editor: true,
    },
    {
      name: 'quantity',
      header: (
        <>
          {intl.get('mallf.myOrder.view.invNum').d('库存数')}
          <Tooltip
            placement="top"
            title={intl.get('mallf.myOrder.view.over.ecceptQuality').d('不能超过此次接收数量')}
          >
            <Icon
              style={{
                color: 'rgba(0,0,0,0.50)',
                fontSize: 14,
                position: 'relative',
                top: -2,
                left: 5,
                fontWeight: 100,
              }}
              type="help"
            />
          </Tooltip>
        </>
      ),
      editor: (record) =>
        precisionEditor({
          record,
          name: 'quantity',
          precision: record.get('uomPrecision'),
        }),
    },
  ];

  const expandedRowRender = ({ record }) => {
    return (
      <Table
        className={styles['accept-info-embed-table']}
        dataSet={record.get('ds')}
        columns={embedColumns}
      />
    );
  };

  return (
    <Table
      className={styles['accept-info-embed-table']}
      dataSet={tableDs}
      columns={columns}
      expandedRowRenderer={expandedRowRender}
    />
  );
}
