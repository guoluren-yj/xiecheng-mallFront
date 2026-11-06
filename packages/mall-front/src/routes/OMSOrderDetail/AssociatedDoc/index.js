import React, { useEffect, useState, useMemo } from 'react';
import { Modal, Spin } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import CuxFn from '@/cuxTools/cuxFn';
import cuxComponent from '@/cuxTools/cuxComponent';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { fetchomsAssociated } from 'services/orderCenterService';
import style from './index.less';
import OtherInfo from './OtherInfo';
import MovingBillNum from './MovingBillNum';
import getDisplayConfig from './displayConfig';

const unitCode = {
  DOC: 'MALL.OMS.ORDER.LIST.ASSOCIATE_FORM',
  RECEIVE_DOC: 'MALL.OMS.ORDER.LIST.RECEIVE_ASSOCIATE_FORM',
  NODE_RECORD: 'MALL.OMS.ORDER.LIST.NODE_RECORD_FORM',
  RECEIVE_NODE_RECORD: 'MALL.OMS.ORDER.LIST.RECEIVE_NODE_RECORD_FORM',
};

const CustomizeDisplay = ({ children }) => children();

const { Sidebar } = Modal;
function AssociatedDoc(props) {
  const { visible, toggleModal, product = {}, cecFromCode, customizeDisplay } = props;
  const {
    consignmentCode,
    orderEntryId,
    orderEntryLinkId,
    skuName,
    // cecOrderCode, 该字段不存在
    consignmentLineNum,
    isReceive,
  } = product;

  const [associatedData, setAssociatedData] = useState({});
  const [loading, setLoading] = useState(false);

  function fetchData() {
    setLoading(true);
    const customizeUnitCode = isReceive
      ? `${unitCode.RECEIVE_DOC},${unitCode.RECEIVE_NODE_RECORD}`
      : `${unitCode.DOC},${unitCode.NODE_RECORD}`;
    fetchomsAssociated({
      orderEntryId,
      orderEntryLinkId,
      consignmentCode,
      consignmentLineNum,
      customizeUnitCode,
    })
      .then((res) => {
        if (res) {
          setAssociatedData(res);
        }
        CuxFn({ name: 'OMS-myOrder-fn-addMotivationNumber', value: { res, setAssociatedData } })(); // 百年人寿二开
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    fetchData();
  }, []);

  // 单据信息字段
  const docInfoFields = useMemo(() => {
    if (isReceive) {
      return [
        {
          name: 'orderCode',
          label: intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号'),
          copyField: true,
        },
      ];
    }
    const fields = [
      {
        name: 'orderCode',
        label: intl.get('mallf.myMall.view.order.srmPoNum').d('商城订单号'),
        copyField: true,
      },
      {
        name: 'reqNum',
        label: intl.get('mallf.myMall.model.purchaseApplicationNum').d('采购申请号'),
        copyField: true,
      },
      {
        name: 'srmOrderCode',
        label: intl.get('mallf.myMall.view.catalog.purchaseOrderNum').d('采购订单号'),
        copyField: true,
        show: (val) => val,
      },
      {
        name: 'cecOrderCode',
        label: intl.get('mallf.myMall.view.order.ecOrderNum').d('电商订单号'),
        copyField: true,
        show: (val) => val && !['CATA', 'MANUAL'].includes(cecFromCode),
      },
      {
        name: 'ecConsignmentCode',
        label: intl.get('mallf.myMall.view.order.ecSubOrderNum').d('电商子订单号'),
        copyField: true,
        show: (val) => val && !['CATA', 'MANUAL'].includes(cecFromCode),
      },
      {
        name: 'logisticOrderNum',
        label: intl.get(`mallf.myMall.view.common.shipmentNum`).d('物流单号'),
        copyField: true,
        show: (val) => val,
      },
      {
        name: 'srmConsignmentCode',
        label: intl.get('mallf.myMall.view.invoice.noSong').d('送货单号'),
        copyField: true,
        show: (val) => val,
      },
    ];
    return CuxFn({
      name: 'OMS-myOrder-fn-docInfoFields',
      value: {
        fields,
      },
    })(() => fields)();
  }, [isReceive]);

  const [docMissFields, docInfoRender] = useMemo(
    () => getDisplayConfig(docInfoFields, associatedData),
    [docInfoFields, associatedData]
  );

  // 关键节点记录字段
  const nodeRecordFields = useMemo(() => {
    if (isReceive) {
      return [
        {
          name: 'cecCreatedTime',
          label: intl.get('mallf.myMall.view.order.mallOrderDate').d('商城下单时间'),
        },
        {
          name: 'approveTime',
          label: intl.get('mallf.myMall.view.order.approvePassTime').d('审批通过时间'),
          show: (val) => val,
        },
      ];
    }
    return [
      {
        name: 'cecCreatedTime',
        label: intl.get('mallf.myMall.view.order.mallOrderDate').d('商城下单时间'),
      },
      {
        name: 'approveTime',
        label: intl.get('mallf.myMall.view.order.approvePassTime').d('审批通过时间'),
        show: (val) => val,
      },
      {
        name: 'confirmedTime',
        label: intl.get('mallf.myMall.view.order.supplierConfirmDate').d('供方确认时间'),
        show: (val) => val,
      },
      {
        name: 'shippedTime',
        label: intl.get('mallf.myMall.view.order.deliveryDate').d('发货时间'),
        show: (val) => val,
      },
      {
        name: 'expectedArriveDate',
        label: intl.get('mallf.myMall.view.order.expectAOGDate').d('预计到货时间'),
        show: (val) => val,
      },
    ];
  }, [isReceive]);

  const [nodeMissFields, nodeInfoRender] = getDisplayConfig(nodeRecordFields, associatedData);

  return (
    <>
      <Sidebar
        title={intl.get('mallf.myMall.view.associated.doc').d('关联单据')}
        className={style.content}
        visible={visible}
        onCancel={toggleModal}
        width={380}
        footer={[
          <Button color="primary" key="back" onClick={toggleModal}>
            {intl.get('mallf.myMall.button.close').d('关闭')}
          </Button>,
        ]}
        closable
      >
        <Spin spinning={loading}>
          <p className="content-header">{skuName}</p>
          <p className="content-title">{intl.get('mallf.myMall.model.docInfo').d('单据信息')}</p>
          <CustomizeDisplay>
            {() =>
              customizeDisplay(
                {
                  code: isReceive ? unitCode.RECEIVE_DOC : unitCode.DOC,
                  dataSource: associatedData,
                  missFields: docMissFields,
                },
                docInfoRender
              )
            }
          </CustomizeDisplay>
          {/* 二开字段:动支单号，后续可以考虑配置个性化，位置采购申请号下方（目前放在单据信息最下方）---20230203 */}
          <MovingBillNum associatedData={associatedData} />
          <p className="content-title" style={{ marginTop: '30px' }}>
            {intl.get('mallf.myMall.model.keyNodeRecord').d('关键节点记录')}
          </p>
          <CustomizeDisplay>
            {() =>
              customizeDisplay(
                {
                  code: isReceive ? unitCode.RECEIVE_NODE_RECORD : unitCode.NODE_RECORD,
                  dataSource: associatedData,
                  missFields: nodeMissFields,
                },
                nodeInfoRender
              )
            }
          </CustomizeDisplay>
          <OtherInfo r-if={!isReceive} associatedData={associatedData} />
        </Spin>
      </Sidebar>
    </>
  );
}

export default cuxComponent({ path: 'OMSOrderDetail/AssociatedDoc' })(
  c7nCustomize({ unitCode: Object.values(unitCode) })(AssociatedDoc)
);
