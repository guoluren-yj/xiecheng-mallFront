import { Modal, Icon, DataSet, Table, Button } from 'choerodon-ui/pro';
import React from 'react';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';

import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';

import style from './index.less';

const getSkulist = (data) => {
  // 库存不足的商品名称放在errorMessage中
  const skuList = [];
  data.orderList.forEach((i) => {
    if (!isEmpty(i.orderExtraInfo?.errorMessage)) {
      i.orderExtraInfo.errorMessage.forEach((item) => {
        if (!skuList.includes(item)) {
          skuList.push(item);
        }
      });
    }
  });
  return skuList;
};

const Message = (props) => {
  const { data = [] } = props;
  return data.slice(0, 3).map((n) => {
    return (
      <>
        【
        <span
          style={{
            display: 'inline-block',
            maxWidth: '100px',
            verticalAlign: 'bottom',
          }}
          className="text-overflow"
          title={n}
        >
          {n}
        </span>
        】
      </>
    );
  });
};
const openModal = (props) => {
  const { skuList, flag, ...other } = props;
  return Modal.open({
    destroyOnClose: true,
    mask: true,
    className: style['modal-tips-name'],
    closable: false,
    style: { width: 560 },
    movable: false,
    autoCenter: true,
    border: false,
    title: (() => {
      return (
        <>
          <Icon type="error" style={{ color: '#FF9500' }} />
          {intl.get('mallf.common.view.change.warning').d('温馨提示')}
        </>
      );
    })(),
    children: flag ? (
      <div>
        {intl
          .get('mcux.common.view.lowStockDetail.tips.confirm')
          .d('该商品库存量大于安全库存，是否继续下单？')}
      </div>
    ) : (
      <div>
        {intl
          .get('mcux.common.view.lowStock.tips.confirm')
          .d('以下商品库存量大于安全库存，是否继续下单：')}
        <Message data={skuList} />
        {skuList.length > 3 ? intl.get('mallf.common.view.stockMore').d('等') : ''}
        <br />
      </div>
    ),
    ...other,
  });
};
export function getStockValidate(props) {
  const { res, successCallback } = props;
  const skuList = getSkulist(res);
  if (skuList.length) {
    openModal({
      skuList,
      onOk: async () => {
        return successCallback(res);
      },
    });
  } else {
    successCallback(res);
  }
}
// 商详页下单必要维护值 只二开侧弹立即购买
export function getBuyNowValidate(props) {
  const { resp, orderData, history } = props;
  const skuList = getSkulist(resp);
  if (skuList.length) {
    openModal({
      skuList,
      flag: true, // 详情页不展示商品名称
      onOk: async () => {
        history.push({
          pathname: '/before-order',
          data: { orderData, preData: resp.orderList },
        });
      },
    });
  } else {
    history.push({
      pathname: '/before-order',
      data: { orderData, preData: resp.orderList },
    });
  }
}

// 打开其他仓库库存明细
function openInventoryDetailsModal(r) {
  const { itemId, organizationId, ouId } = r || {};
  const ds = new DataSet({
    autoQuery: true,
    paging: false,
    selection: false,
    fields: [
      {
        name: 'invOrgCode',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.invOrgCode').d('库存组织编码'),
      },
      {
        name: 'invOrgName',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.invOrgName').d('库存组织'),
      },
      {
        name: 'whCode',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.whCode').d('仓库编码名称'),
      },
      {
        name: 'whName',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.whName').d('仓库名称'),
      },
      {
        name: 'materialCode',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.materialCode').d('物料编码'),
      },
      {
        name: 'materialName',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.materialName').d('物料名称'),
      },
      {
        name: 'auxProperty',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.auxProperty').d('辅助属性'),
      },
      {
        name: 'spec',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.spec').d('规格'),
      },
      {
        name: 'unit',
        type: 'string',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.unit').d('计量单位'),
      },
      {
        name: 'qty',
        type: 'number',
        label: intl.get('mallf.cart.scux.model.allocation.jxnm.qty').d('库存数量'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/dsPu7UU5pDGYwteTicjINZFmGqtfZlB7FeuRMhExDEEb3ZXnO4taqVCLAmOnAAnoic`,
          method: 'POST',
          data: {
            itemId,
            organizationId,
            ouId,
          },
        };
      },
    },
  });
  Modal.open({
    key: Modal.key(),
    destroyOnClose: true,
    style: { width: 560 },
    title: intl
      .get('mallf.cart.scux.model.allocation.jxnm.viewOtherWarehouseDetails')
      .d('查看其他仓库库存明细'),
    children: (
      <Table
        dataSet={ds}
        columns={[
          { name: 'invOrgCode', width: 120 },
          { name: 'invOrgName', width: 150 },
          { name: 'whCode', width: 120 },
          { name: 'whName', width: 150 },
          { name: 'materialCode', width: 120 },
          { name: 'materialName', width: 200 },
          {
            name: 'auxProperty',
            renderer: ({ value }) => {
              if (!value) return '';
              try {
                return Object.entries(value)
                  .map(([k, v]) => `${k}：${v}`)
                  .join('；');
              } catch (e) {
                return String(value);
              }
            },
          },
          { name: 'spec', width: 100 },
          { name: 'unit', width: 60 },
          { name: 'qty', width: 80 },
        ]}
      />
    ),
  });
}

// 购物车 - 商品分配
export function getAllocationItemColumns(props) {
  const { allocationItemData, headerDs } = props || {};
  return [
    {
      name: 'cuxViewInventoryDetail',
      align: 'center',
      header: intl
        .get('mallf.cart.scux.model.allocation.jxnm.viewOtherWarehouseDetails')
        .d('其他仓库库存明细'),
      renderer: () => {
        const { priceResult } = allocationItemData || {};
        const { itemId } = priceResult || {};
        const organizationId = headerDs?.current?.get('organizationId');
        const ouId = headerDs?.current?.get('ouId');
        const disabled = !organizationId || !itemId || !ouId;
        return (
          <Button
            funcType="link"
            wait={500}
            onClick={() => openInventoryDetailsModal({ itemId, organizationId, ouId })}
            disabled={disabled}
          >
            {intl
              .get('mallf.cart.scux.model.allocation.jxnm.button.viewOtherWarehouseDetails')
              .d('查看')}
          </Button>
        );
      },
    },
  ];
}

export function getBatchAllocationItemColumns(props) {
  const { columns, headerDs, alloctionDs } = props || {};
  const cuxViewInventoryDetailColumn = {
    name: 'cuxViewInventoryDetail',
    align: 'center',
    header: intl
      .get('mallf.cart.scux.model.allocation.jxnm.viewOtherWarehouseDetails')
      .d('其他仓库库存明细'),
    renderer: ({ record }) => {
      const itemId = record.get('itemId');
      const organizationId = headerDs?.get('organizationId');
      const ouId = headerDs?.get('ouId');
      const disabled = !organizationId || !itemId || !ouId;
      return (
        <Button
          funcType="link"
          wait={500}
          onClick={() => openInventoryDetailsModal({ itemId, organizationId, ouId })}
          disabled={disabled}
        >
          {intl
            .get('mallf.cart.scux.model.allocation.jxnm.button.viewOtherWarehouseDetails')
            .d('查看')}
        </Button>
      );
    },
  };
  const newColumns = [...columns];
  if (!alloctionDs.hasManulFlag) {
    newColumns.splice(newColumns.length - 1, 0, cuxViewInventoryDetailColumn);
  }
  return newColumns;
}
