import React from 'react';
import openCuxModal from 'utils/modals/CuxWeakCheck';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
// import Swal from 'components/swal';
import { Table } from 'choerodon-ui/pro';
import classNames from 'classnames';
import swalAlert from 'components/swal';
import { toJS } from 'mobx';

const getFlag = res => {
  // 只要有一个errorMessage则弱校验
  return res.orderList.find(i => !!i.orderExtraInfo?.errorMessage);
};
// 购物车下一步弱校验
export function getNextValidate(props) {
  const { res, successCallback } = props;
  if (getFlag(res)) {
    openCuxModal({
      needMsgFlag: false,
      tips: intl.get('mcux.common.view.pleaseSupplyCustomeInfo').d('请到内部系统补充客户信息'),
      onOk: async () => {
        return successCallback(res);
      },
    });
  } else {
    successCallback(res);
  }
}

//  立即购买 分配 弱校验
export function getBuyNowValidate(props) {
  const { resp, orderData } = props;
  if (getFlag(resp)) {
    openCuxModal({
      needMsgFlag: false,
      tips: intl.get('mcux.common.view.pleaseSupplyCustomeInfo').d('请到内部系统补充客户信息'),
      onOk: async () => {
        props.history.push({
          pathname: '/before-order',
          data: { orderData, preData: resp.orderList },
        });
      },
    });
  } else {
    props.history.push({
      pathname: '/before-order',
      data: { orderData, preData: resp.orderList },
    });
  }
}

// export function getAttachmentValidate({ preData }) {
//   if (preData?.find((i) => !!i.orderExtraInfo?.attachmentUuidNotNull)) {
//     Swal(intl.get(`mcux.common.view.attachmentUuid.required`).d('请上传附件'));
//     return true;
//   }
// }

export function getAttachmentRequired({ order, attachmentUuidNotNull }) {
  // eslint-disable-next-line no-param-reassign
  order.attachmentRequired = !!attachmentUuidNotNull;
}

export function addressModalInitForm({ edit, data }) {
  return edit ? data : {};
}

export function addressInit({ lovPara }) {
  return {
    belongType: 2,
    ...lovPara,
  };
}

export function addressLovPara({ companyId, userId }) {
  return {
    belongType: 2,
    companyId,
    userId,
  };
}

export async function changeApproveUrl({ orderCode }) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/vaWeE3CCUtIXR90F4l7sTHb1Tul6viciafLc2G51vwmQs?orderCode=${orderCode}`,
    {
      method: 'GET',
    }
  );
}

export function setVariable({ value }) {
  return value;
}

export function beforeSaveParamsFunc() {
  return { viewAssignFlag: 1 };
}

export function getDisableFlag({ partentRecord }) {
  const length =
    (partentRecord?.childrenDs?.length || 0) + (partentRecord?.hasAssignChildrenDs?.length || 0);
  return length === 1;
}

export function renderAssignedTable({ partentRecord, childColumns }) {
  return (
    <Table
      parityRow={false}
      dataSet={partentRecord.hasAssignChildrenDs}
      columns={childColumns}
      customizedCode="MALL.CARTPRO.BATCH.ALLOCATION.EXPANEDDTABLE"
      onRow={({ record }) => ({
        className: classNames({
          'cart-pro-item-new': record.get('newestFlag'),
        }),
      })}
    />
  );
}

export function getProductInformationLabel({ hasAssignFlag }) {
  return hasAssignFlag === 1
    ? intl.get(`mallf.common.view.productInformation.hasAssign`).d('商品信息-已分配')
    : intl.get(`mallf.common.view.productInformation.unAssign`).d('商品信息-未分配');
}

export function getBatchProductList({ data }) {
  return [...data.childrenDs.toData(), ...data.hasAssignChildrenDs.toData()];
}

export function handleDsList({ dsList, line }) {
  dsList.push(line.childrenDs);
  dsList.push(line.hasAssignChildrenDs);
}

async function handleSaveAllocation(param) {
  return request(
    `/marmot/v1/${getCurrentOrganizationId()}/marmot-api/vaWeE3CCUtIXR90F4l7sTDnCCx5El5JSCucmib6yUKlY`,
    {
      method: 'POST',
      body: JSON.stringify(param),
    }
  );
}

export async function handleSaveAllocationAndNext({
  _this,
  param,
  // saveBatchAllocationService,
  history,
}) {
  const res = await handleSaveAllocation(param);
  if (res.success === 0) {
    swalAlert(res.message);
    _this.status = 'ready';
  } else {
    const { orderList, cartList } = res;
    const orderData = (orderList || []).map((order) => {
      const { orderInfo, orderLineList, orderPriceInfo, orderInvoiceInfo, orderExtraInfo } =
        order || {};
      const shoppingCartDTOList = (orderLineList || []).map((line) => {
        const { orderLinePrice, orderLineValue, orderLineProduct } = line || {};
        const { dataType, quantity, remark, neededDate, productCompare } = orderLineValue || {};
        const { skuSrmInfo, productAttributeDTOList } = orderLineProduct || {};
        return {
          ...(orderLineValue || {}),
          ...(skuSrmInfo || {}),
          ...orderLinePrice,
          dataType,
          quantity,
          remark,
          neededDate,
          productCompare,
          productAttributeDTOList,
        };
      });
      return {
        ...(orderExtraInfo || {}),
        ...orderInfo,
        ...orderPriceInfo,
        ...orderInvoiceInfo,
        shoppingCartDTOList,
      };
    });
    // history.push 出现 loading 已结束但没立刻跳转的情况，因为此处不设置status ready，避免在loading结束到跳转期间点击按钮
    history.push({
      pathname: '/before-order',
      data: { orderData, preData: orderList, cartList },
    });
  }
  // _this.status = 'ready';
}

export function beforeBatchAllocation({ handleNext, products }) {
  const assignFlag = products.find(i => [0, '0'].includes(i.assignFlag));
  if (!assignFlag && handleNext) {
    // 全部为已分配，直接进入下一步
    handleNext();
    return false;
  } else {
    return true;
  }
}

export function initChildrenDs({ _this, line, ChildrenDataSet, childTableDataset, hasManulFlag }) {
  const manulUomIdBatchFlag = _this.getManulUomIdBatchFlag(hasManulFlag);
  const childrenDs = new ChildrenDataSet(
    childTableDataset({ partentRecord: line, hasManulFlag, manulUomIdBatchFlag })
  );
  const hasAssignChildrenDs = new ChildrenDataSet(
    childTableDataset({
      partentRecord: line,
      hasManulFlag,
      manulUomIdBatchFlag,
      hasAssignFlag: 1,
    })
  );
  const childData = toJS(line.get('batchProductList')) || [];

  // eslint-disable-next-line no-param-reassign
  line.childrenDs = childrenDs;
  line.hasAssignChildrenDs = hasAssignChildrenDs; // 已分配
  // 是手工且单位参与批量，单位和数量置空
  if (manulUomIdBatchFlag) {
    line.set('uomIdLov', null);
  }
  line.childrenDs.loadData(
    childData
      .filter(i => i.assignFlag === 0)
      .map(n => ({ ...n, quantity: manulUomIdBatchFlag ? null : n.quantity }))
  );
  line.hasAssignChildrenDs.loadData(
    childData
      .filter(i => i.assignFlag === 1)
      .map(n => ({ ...n, quantity: manulUomIdBatchFlag ? null : n.quantity }))
  );
}
