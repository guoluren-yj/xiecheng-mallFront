import React, { useMemo } from 'react';
import {
  CheckBox,
  Tooltip,
  Icon,
  DataSet,
  Table,
  TextArea,
  Attachment,
  Modal,
  message,
} from 'choerodon-ui/pro';
import moment from 'moment';

import { receiveomsPreviewConfirm } from 'services/productAcceptService';
// import image from '@/assets/images/shougongshenqing-product.png';
import Image from 'components/Image';
import { getMamanualRequestImg } from 'components/MamanualRequestImg';
import {
  getIsHideSupplierFlag,
  getIsNewCartFlag,
  getDoubleUomFlag,
  hasDoubleUomFlag,
} from 'utils/configUtils';
import { RECEIVE_INFORMATION_TABLE, RECEIVE_INFORMATION_TABLE_SIGL } from 'utils/customizeCode';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT, accept } from 'utils/constants';
import { PrecisionField } from 'utils/precision';
import Link from 'components/Link';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import styles from './index.less';
import ds from './ds';
import EcceptIn from './EcceptIn';
import CuxFn from '@/cuxTools/cuxFn';

export default function OmsAcceptModal({
  asnLineIds,
  acceptType,
  modal,
  fetchOrderData,
  customizeTable,
}) {
  const {
    custWebConfig: { manualFileSize = 100 },
  } = useMemo(() => {
    return getUserConfigInfo();
  }, []);

  const tableDs = useMemo(() => {
    return new DataSet(ds({ asnLineIds }));
  }, []);

  modal.handleOk(() => {
    return handleSave();
  });

  async function handleSave() {
    const flag = await tableDs.validate();
    if (!flag) return false;
    // 有领用商品打开领用商品接收框
    if (tableDs.getState('hasReceiveProduct') && tableDs.getState('checkReceive')) {
      openEcceptIn();
      return false;
    } else {
      try {
        const receiptEntryList = tableDs.toData().map((p) => {
          return {
            ...p,
            // waitingReceiveQuantity: p.waitingReceiveQuantity,
            // freightFlag: p.freightFlag,
            cecConsignmentCode: p.srmConsignmentCode,
            // consignmentLineNum: p.consignmentLineNum,
            // consignmentCode: p.consignmentCode,
            // remark: p.remark,
            // quantity: p.quantity,
            // attachmentUuid: p.attachmentUuid,
            receiveSkuStock: null, // 不转领用的数据都不传该字段防止商品报错
          };
        });
        const params = {
          receiptTime: moment().format(DEFAULT_DATETIME_FORMAT),
          receiptEntryList,
        };
        const result = await receiveomsPreviewConfirm(params);
        if (result) {
          message.success(intl.get('mallf.myOrder.order.goods.success').d('收货成功'));
          fetchOrderData();
          return true;
        } else {
          return false;
        }
      } catch (e) {
        return false;
      }
    }
  }

  function openEcceptIn() {
    Modal.open({
      title: intl.get('mallf.myOrder.view.ecceptIn.product').d('接收并入库'),
      drawer: true,
      closable: true,
      style: {
        width: 742,
      },
      destroyOnClose: true,
      children: (
        <EcceptIn
          acceptModal={modal}
          acceptData={tableDs.toData()}
          fetchOrderData={fetchOrderData}
        />
      ),
    });
  }

  const columns = useMemo(() => {
    return [
      {
        name: 'srmConsignmentCode',
        visible: acceptType === 'batch',
      },
      {
        name: 'productInfo',
        width: acceptType === 'batch' ? 180 : 300,
        tooltip: 'none',
        renderer: ({ record }) => {
          const isMANUAL = record.get('cecFromCode') === 'MANUAL';
          const isPunchout = Boolean(record.get('qtHeaderNo'));
          const productUrl = `/product-detail?productId=${record.get(
            'skuId'
          )}&sourceFrom=${record.get('cecFromCode')}`;
          return (
            <div className="accept-info accept-info-batch">
              <div r-if={isMANUAL}>{getMamanualRequestImg({ width: '40px', height: '40px' })}</div>
              <Link r-if={!isMANUAL} disabled={isPunchout} to={productUrl}>
                <Image value={record.get('primaryUrl')} width={40} height={40} />
              </Link>
              <div className="product-name">
                <Link
                  disabled={isMANUAL || isPunchout}
                  className="product-name-label"
                  to={productUrl}
                  title={record.get('skuName')}
                >
                  {record.get('skuName')}
                </Link>
                {record.get('cecOrderCode') && (
                  <span className="product-name-po">{record.get('cecOrderCode')}</span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        name: 'sentQuantity',
        visible: !getDoubleUomFlag(),
      },
      {
        name: 'sentPackageQuantity',
        visible: getDoubleUomFlag(),
      },
      {
        name: 'receiveQuantity',
        visible: acceptType === 'batch' && !getDoubleUomFlag(),
      },
      {
        name: 'receivePackageQuantity',
        visible: acceptType === 'batch' && getDoubleUomFlag(),
      },
      {
        name: 'waitingReceiveQuantityMeaning',
        visible: !getDoubleUomFlag(),
      },
      {
        name: 'waitingReceivePackageQuantityMeaning',
        visible: getDoubleUomFlag(),
      },
      {
        name: 'quantity',
        header: (
          <>
            {getDoubleUomFlag()
              ? intl.get('mallf.myOrder.view.incoming.quantity').d('此次接收基本数量')
              : intl.get('mallf.myOrder.view.incoming.packageQuantity').d('此次接收数量')}
            <Tooltip
              title={intl.get('mallf.myOrder.warning.ECproduct.number').d('电商商品数量不可修改')}
              placement="top"
            >
              <Icon
                type="help"
                style={{ marginLeft: 3, marginTop: 1, color: 'rgba(0,0,0,0.50)', fontSize: 14 }}
              />
            </Tooltip>
          </>
        ),
        renderer: ({ record }) => {
          const cecFromCode = record.get('cecFromCode');
          const { uomId, customUomId, customQuantity, skuType } = record.get([
            'uomId',
            'customUomId',
            'customQuantity',
            'skuType',
          ]);
          // 电商不可编辑 || 开启双单位定制品 || 无物料双单位
          if (
            (cecFromCode !== 'CATA' && cecFromCode !== 'MANUAL') ||
            (getDoubleUomFlag() &&
              (skuType === 'CUSTOM' || !hasDoubleUomFlag({ uomId, customUomId, customQuantity })))
          ) {
            return record.get('quantity');
          } else if (
            hasDoubleUomFlag({ uomId, customUomId, customQuantity }) ||
            !getDoubleUomFlag()
          ) {
            // 商品有双单位或者关闭双单位
            return CuxFn({
              name: 'OmsAcceptModal-fn-quantity',
              value: {
                record,
                cecFromCode,
              },
            })(() => (
              <PrecisionField
                name="quantity"
                precision={record.get('uomPrecision') || 0}
                record={record}
              />
            ))();
          }
        },
      },
      {
        name: 'packageQuantity',
        visible: getDoubleUomFlag(),
        header: (
          <>
            {intl.get('mallf.myOrder.view.incoming.packageQuantity').d('此次接收数量')}
            <Tooltip
              title={intl.get('mallf.myOrder.warning.ECproduct.number').d('电商商品数量不可修改')}
              placement="top"
            >
              <Icon
                type="help"
                style={{ marginLeft: 3, marginTop: 1, color: 'rgba(0,0,0,0.50)', fontSize: 14 }}
              />
            </Tooltip>
          </>
        ),
        renderer: ({ record }) => {
          const cecFromCode = record.get('cecFromCode');
          if (cecFromCode !== 'CATA' && cecFromCode !== 'MANUAL') {
            return record.get('packageQuantity');
          } else {
            return CuxFn({
              name: 'OmsAcceptModal-fn-packageQuantity',
              value: {
                record,
                cecFromCode,
              },
            })(() => (
              <PrecisionField
                name="packageQuantity"
                precision={record.get('customUomPrecision') || record.get('uomPrecision') || 0}
                record={record}
              />
            ))();
          }
        },
      },
      {
        name: 'creationDate',
        renderer: ({ record }) => moment(record.get('creationDate')).format(DEFAULT_DATE_FORMAT),
        visible: acceptType === 'batch',
      },
      {
        name: 'supplierCompanyName',
        visible: acceptType === 'batch' && !getIsHideSupplierFlag(),
      },
      {
        name: 'remark',
        renderer: ({ record }) => {
          return <TextArea name="remark" record={record} rows={1} />;
        },
      },
      {
        name: 'attachmentUuid',
        editor: () => {
          return (
            <Attachment
              bucketName="private-bucket"
              bucketDirectory="mall-front"
              fileSize={1024 * 1024 * manualFileSize}
              viewMode="popup"
              accept={accept}
            />
          );
        },
      },
    ].filter((p) => p.visible !== false);
  }, [acceptType]);

  const HeaderCheck = observer(({ dataSet }) => {
    return (
      <p
        r-if={dataSet.getState('hasReceiveProduct') && getIsNewCartFlag()}
        className="accept-table-title-info"
      >
        <CheckBox
          checked={dataSet.getState('checkReceive')}
          onChange={(check) => dataSet.setState('checkReceive', check)}
        />
        <span style={{ color: '#191919' }}>
          {intl.get('mallf.myOrder.order.changeToReceive').d('转为领用库存')}
        </span>
        <Tooltip
          placement="top"
          title={intl
            .get('mallf.myOrder.view.infoToCancel.changeReceive')
            .d('若商品不转为领用库存，可取消勾选')}
        >
          <Icon
            style={{
              color: 'rgba(0,0,0,0.50)',
              fontSize: 14,
              position: 'relative',
              top: -1,
              left: 5,
              fontWeight: 100,
            }}
            type="help"
          />
        </Tooltip>
      </p>
    );
  });

  // const EcceptTable = observer(({ dataSet }) => {
  //   return <Table dataSet={dataSet} columns={columns} rowHeight={40} />;
  // });
  return (
    <div className={styles['accept-content']}>
      <HeaderCheck dataSet={tableDs} />
      {customizeTable(
        {
          code: window.location.pathname.includes('/sigl')
            ? RECEIVE_INFORMATION_TABLE_SIGL
            : RECEIVE_INFORMATION_TABLE,
        },
        <Table dataSet={tableDs} columns={columns} rowHeight={40} />
      )}
      {/* <EcceptTable dataSet={tableDs} /> */}
    </div>
  );
}
