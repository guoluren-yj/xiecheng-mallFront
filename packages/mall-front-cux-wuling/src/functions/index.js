import React from 'react';
import { Button, Modal, Form, DataSet, Lov, Tooltip } from 'choerodon-ui/pro';
import { observer, useComputed } from 'mobx-react-lite';

import { getUserConfigInfo, getStockNumMeaning, getSprmDetailUrl, openPage } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import { getDvaApp } from 'hzero-front/lib/utils/iocUtils';
import { getOpenCartFlag } from 'utils/configUtils';
import intl from 'utils/intl';
import { isEmpty, omit } from 'lodash';
import Swal from 'components/swal';
import notification from 'utils/notification';

const permissionType = {
  H: 'HANDLE',
  A: 'AUTO',
};
const autoWarehourse = {
  warehouseAddress: '自动分配',
  autoFlag: '1',
  inventoryCode: 'AUTO_ASSIGN',
  warehouseId: '-2',
  warehouseName: '自动分配',
};
const calcPermission = () => {
  // 自动则需赋值自动分配库房
  const { WULINGWarehousePermission } = getUserConfigInfo();
  return WULINGWarehousePermission === permissionType.A;
};

function afterQueryPermission() {
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/WvK0dpcOvOAjh1NlEBEDOiaLlfibR7sQliaSfubiaqABo9k`;
  const setPermission = (p = permissionType.A) => {
    // 报错也当自动
    getDvaApp()._store.dispatch({
      type: 'global/update',
      payload: {
        WULINGWarehousePermission: p,
      },
    });
  };
  request(url, { method: 'get' })
    .then((res) => {
      setPermission(res && !isEmpty(res) ? permissionType.H : permissionType.A);
    })
    .catch(() => {
      setPermission();
    });
}

function getCurrentWarehouse({ currentWarehouse }) {
  return calcPermission() ? autoWarehourse : currentWarehouse;
}

function setNewProductData({ setProductData }) {
  if (calcPermission()) {
    setProductData((data) => ({ ...data, ...autoWarehourse }));
  }
}

function getValidateType(_record) {
  if (getOpenCartFlag()) {
    const dataSet = this;
    const validaTypes = {
      linkType: (record) => {
        const validateSkuType = this.getSkuSourceMeaning(record.toData());
        const selectedSkuType = this.getSkuSourceMeaning(dataSet.selected[0]?.toData() || {});
        return intl
          .get(`mallf.common.view.porduct.chooseSameLink`, {
            newType: validateSkuType,
            oldType: selectedSkuType,
          })
          .d(`${validateSkuType}商品和${selectedSkuType}商品不可同时勾选！`);
      },
      currencyCode: intl
        .get(`mallf.common.view.porduct.chooseSameCurrency`)
        .d('只能选择相同币种的商品！'),
    };
    const record = _record || dataSet.selected[0] || dataSet.get(0);
    if (record && record.get('linkType') === 'ORDER') {
      validaTypes.receiveFlag = intl
        .get(`mallf.cart.view.porduct.chooseSameReceive`)
        .d('领用商品和采购商品不可同时勾选！');
    }

    validaTypes.autoFlag = '自动分配库房和手选库房不能同时勾选，请分开下单';

    return validaTypes;
  }
  return {
    centralizedFlag: intl
      .get('mallf.cart.view.chooseSameRuleProduct')
      .d('只能选择相同业务类型的商品'),
    receiveFlag: intl
      .get(`mallf.cart.view.porduct.chooseSameReceive`)
      .d('领用商品和采购商品不可同时勾选！'),
    currencyCode: intl
      .get(`mallf.common.view.porduct.chooseSameCurrency`)
      .d('只能选择相同币种的商品！'),
    autoFlag: '自动分配库房和手选库房不能同时勾选，请分开下单',
  };
}

async function addNewCart({ params }) {
  let res = params;
  if (params.receiveFlag) {
    const { organizationId } = getUserConfigInfo();
    const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/0prqoCYtaUbntLWn8w3iaGFQ6jBA0H9RXOAatw71qQtQ`;
    try {
      res = await request(url, {
        method: 'POST',
        body: JSON.stringify(params),
      });
    } catch {
      res = params;
    }
  }
  return res;
}

async function confirmSwal({
  confirmCreatePurchaseMsg,
  submitOrderList,
  orderData,
  preData,
  setSubmitLoading,
}) {
  try {
    const { organizationId } = getUserConfigInfo();
    if (orderData.some((n) => n.DS?.current.get('attributeVarchar1') === '1')) {
      const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/VicoBSNpeGTExGW9TlTP83G64MasjPgyDtZR8L3eMbsw`;
      setSubmitLoading(true);
      await request(url, { method: 'post', body: JSON.stringify(preData) });
      setSubmitLoading(false);
    }
    const receiveFlag = orderData.some((n) => n.receiveFlag === 1);
    const approveFlag = orderData.some((n) => n.DS.current.get('attributeBigint10') === '1');
    Swal(
      confirmCreatePurchaseMsg({
        message:
          approveFlag && receiveFlag
            ? intl
                .get(`mcux.common.companyOrder.receiveApproveConfirm`)
                .d('当前领用单金额已达到审批条件，请确认是否提交')
            : intl
                .get(`mallf.companyOrder.model.companyOrder.confirmCreatePurchase`)
                .d('确定生成采购申请！'),
      }),
      true
    ).then((result) => {
      if (result.value) submitOrderList();
    });
  } catch (error) {
    setSubmitLoading(false);
  }
}

function stockNumMeaning({ stockState, skuStock }) {
  return getStockNumMeaning(stockState, skuStock);
}

// 导出生成PR单
const ObserverExtendCartCopyHeaderBtn = observer(({ dataSet }) => {
  const formDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'prTypeId',
        type: 'object',
        label: intl.get(`mcux.common.wuling.exportPr.prTypeId`).d('采购申请类型'),
        required: true,
        lovCode: 'SPUC.PR_DEMAND_TYPE',
        ignore: 'always',
        valueField: 'prTypeId',
        textField: 'prTypeName',
        transformRequest: value => value && value.prTypeId,
      },
      {
        name: 'unitId',
        type: 'object',
        label: intl.get(`mcux.common.wuling.exportPr.unitId`).d('预算申请部门'),
        required: true,
        lovCode: 'STCK.DEPT_INFO',
        valueField: 'unitId',
        textField: 'unitName',
        transformRequest: value => value && value.unitId,
      },
    ],
  });
  const handleExportPR = () => {
    const modal = Modal.open({
      key: Modal.key(),
      destroyOnClose: true,
      title: intl.get(`mcux.common.wuling.button.exportPR`).d('导出生成PR单'),
      children: (
        <Form dataSet={formDs} columns={1} labelLayout="float">
          <Lov name="prTypeId" />
          <Lov name="unitId" />
        </Form>
      ),
      onOk: async () => {
        if (await formDs.validate()) {
          return request(
            `${HmallConfig.apiGateway}/marmot/v1/${getUserConfigInfo().organizationId}/marmot-api/QNUiblMddDGhfWYYc0Lof4Jib1eCse1DVZnh4WiaicjXEOY`,
            {
              method: 'POST',
              body: JSON.stringify({
                ...omit(formDs.current?.toData() || {}, '__dirty'),
                cartList: (dataSet?.selected || []).map(r => r.toData()),
              }),
            }
          ).then(res => {
            if (res && res.isFailed) {
              notification.error({
                message: res.message,
              });
            }
            if (res && !res.isFailed && res.prHeaderId) {
              modal.close();
              formDs.reset();
              dataSet.queryCartData();
              openPage(getSprmDetailUrl({ prHeaderId: res.prHeaderId }));
            }
          });
        }
        return false;
      },
      onCancel: () => {
        formDs.reset();
      },
    });
  };

  // 勾选的商品类型仅为电商来源的商品，若包含不同的商品类型或者不为电商来源的商品，则按钮置灰无法点击
  const disable = useComputed(() => {
    if (!dataSet || !dataSet.selected?.length) return true;
    return dataSet.selected.some(r => r.get('linkSource') !== 'EC');
  }, [dataSet]);
  return (
    <div style={{ marginRight: '8px' }}>
      <Tooltip title={disable ? intl.get('mcux.common.wuling.button.exportPRHelp').d('请勾选商品类型仅为电商来源的商品进行导出') : null}>
        <Button wait={500} onClick={() => handleExportPR()} disabled={disable}>
          {intl.get(`mcux.common.wuling.button.exportPR`).d('导出生成PR单')}
        </Button>
      </Tooltip>
    </div>
  );
});

// 购物车-聚合视图-头按钮
function getExtendCartCopyHeaderBtn({ dataSet, tabKey }) {
  return [1, 2].includes(tabKey) ? (
    <ObserverExtendCartCopyHeaderBtn dataSet={dataSet} />
  ) : null;
}

export {
  afterQueryPermission,
  getCurrentWarehouse,
  getValidateType,
  setNewProductData,
  addNewCart,
  confirmSwal,
  stockNumMeaning,
  getExtendCartCopyHeaderBtn,
};
