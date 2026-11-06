import React, { useMemo, useEffect } from 'react';
import { Modal, Form, Output, DataSet, Table } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { orderReceivePrint, orderToPrint } from 'services/orderCenterService';
import intl from 'utils/intl';
import PrintProButton from 'components/PrintProButton';
import { getCurrentOrganizationId } from 'utils/utils';
import styles from './index.less';

function LingyongDoc({ modal, orderCode }) {
  const initFormDs = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      fields: [
        {
          label: intl.get('mallf.myOrder.view.order.srmPoNum').d('商城订单号'),
          name: 'orderCode',
        },
        {
          label: intl.get('mallf.myOrder.view.order.getPerson').d('下单人'),
          name: 'buyerName',
        },
        {
          label: intl.get('mallf.myOrder.view.orderoftime').d('下单时间'),
          name: 'cecCreatedTime',
        },
        {
          label: intl.get('mallf.myOrder.view.recive.kufang').d('领用库房'),
          name: 'inventoryName',
        },
        {
          label: intl.get('mallf.myOrder.view.kufang.address').d('库房地址'),
          name: 'fullAddress',
        },
        {
          label: intl.get(`mallf.common.model.remark`).d('备注'),
          name: 'remark',
        },
      ],
    });
  }, []);

  const initTableDs = useMemo(() => {
    return new DataSet({
      selection: false,
      fields: [
        {
          label: intl.get(`mallf.common.view.orderSeq`).d('序号'),
          name: 'orderSql',
        },
        {
          label: intl.get('mallf.myOrder.view.productCode').d('商品编码'),
          name: 'skuCode',
        },
        {
          label: intl.get('mallf.myOrder.view.productName').d('商品名称'),
          name: 'skuName',
        },
        {
          label: intl.get('mallf.common.view.item.code').d('物料编码'),
          name: 'itemCode',
        },
        {
          label: intl.get('mallf.common.view.item.name').d('物料名称'),
          name: 'itemName',
        },
        {
          label: intl.get(`mallf.common.view.productNum.order`).d('数量'),
          name: 'quantity',
        },
        {
          label: intl.get('mallf.common.view.uom').d('单位'),
          name: 'uomName',
        },
        {
          label: intl.get(`mallf.myOrder.view.spec.num`).d('销售规格'),
          name: 'productAttributeMeaning',
        },
        {
          label: intl.get(`mallf.common.model.remark`).d('备注'),
          name: 'remark',
        },
      ],
    });
  }, []);

  useEffect(() => {
    orderReceivePrint({ orderCodes: orderCode }).then((res) => {
      if (!isEmpty(res)) {
        const list = res?.[0]?.lines || [];
        initFormDs.loadData(res || []);
        initTableDs.loadData(list);
      }
    });
  }, []);

  const tableColumns = [
    {
      name: 'orderSql',
      width: 80,
      renderer: ({ record }) => {
        return (record.index || 0) + 1;
      },
    },
    {
      name: 'skuCode',
      width: 100,
    },
    {
      name: 'skuName',
      width: 200,
    },
    {
      name: 'itemCode',
      width: 100,
    },
    {
      name: 'itemName',
      width: 100,
    },
    {
      name: 'quantity',
      width: 80,
    },
    {
      name: 'uomName',
      width: 80,
    },
    {
      name: 'productAttributeMeaning',
    },
    {
      name: 'remark',
    },
  ];

  modal.handleOk(async () => {
    const res = await orderToPrint([orderCode]);
    if (res) {
      const file = new Blob([res], { type: 'application/pdf' });
      const fileUrl = URL.createObjectURL(file);
      const printWindow = window.open(fileUrl);
      if (printWindow) {
        printWindow.print();
      }
    }
  });

  return (
    <div className={styles.content}>
      <div className="lingyong-header">
        <p className="lingyong-title">
          {intl.get('mallf.common.view.title.baseInfo').d('基础信息')}
        </p>
        <Form dataSet={initFormDs} columns={3} className="c7n-pro-vertical-form-display">
          <Output name="orderCode" />
          <Output name="buyerName" />
          <Output name="cecCreatedTime" />
          <Output name="inventoryName" />
          <Output name="fullAddress" />
          <Output name="remark" />
        </Form>
      </div>
      <div className="lingyong-content">
        <p className="lingyong-title">
          {intl.get(`mallf.common.view.productInformation`).d('商品信息')}
        </p>
        <Table columns={tableColumns} dataSet={initTableDs} />
      </div>
    </div>
  );
}

export default function openPrint(props) {
  const modal = Modal.open({
    title: intl.get('mallf.myOrder.view.print.lingyingDoc').d('打印领用单'),
    destroyOnClose: true,
    mask: true,
    drawer: true,
    closable: true,
    style: { width: 1090 },
    children: <LingyongDoc modal={modal} {...props} />,
    footer: (okBtn, cancelBtn) => (
      <div>
        <PrintProButton
          params={{ orderCodes: props.orderCode }}
          buttonProps={{
            color: 'primary',
            icon: 'print',
            type: 'c7n-pro',
          }}
          requestUrl={`/smodr/v1/${getCurrentOrganizationId()}/orders/print-receive-token`}
          method="POST"
        />
        {cancelBtn}
      </div>
    ),
  });
}
