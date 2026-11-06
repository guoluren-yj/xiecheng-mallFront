import React, { useState } from 'react';
import { isEmpty, isArray, isNil } from 'lodash';
import { Popover } from 'choerodon-ui';
import { Modal, message, Icon, Table, DataSet } from 'choerodon-ui/pro';

import Link from 'components/Link';
import InitUnitForm from 'components/ChooseUnit/InitUnitForm';
import classNames from 'classnames';
import intl from 'utils/intl';
import {
  getIsStrongOrWeakFlag,
  getUserConfigInfo,
  getThemeColor,
  getPrimaryColor,
} from 'utils/utils';
import request from 'utils/request';
import { addCollect } from 'services/productDetailService';
import { fetchomsProductAccept } from 'services/productAcceptService';

import styles from './index.less';
import OmsAcceptModal from './OmsAcceptModal';
import CollectPopOverList from './CollectPopOverList';
import NotLowestTipsModal from './NotLowestTipsModal';
import GoToLowestSkuModal from './GoToLowestSkuModal';
import RemarkModal from './RemarkModal';
import CountDownModal from './CountDownModal';
import CuxFn from '@/cuxTools/cuxFn';

// 二次确认弹框
export function openComfirmModal(props) {
  const { className = '', ...other } = props;
  return Modal.open({
    destroyOnClose: true,
    mask: true,
    className: classNames([styles['comfire-modal-container'], className]),
    closable: false,
    style: { width: 560 },
    movable: false,
    autoCenter: true,
    ...other,
  });
}

// 备注弹框
export function openRemarkModal(props) {
  const { title, ...other } = props;
  return openComfirmModal({
    title,
    border: false,
    style: { width: 520 },
    children: <RemarkModal {...other} />,
  });
}

/**
 * @param {*} props 接收参数
 * @param {*} modalProps 弹框参数
 */
export async function openOmsAcceptModal(props = {}, modalProps = {}) {
  const { asnLineIds } = props;
  await fetchomsProductAccept(asnLineIds).then((result) => {
    if (result) {
      Modal.open({
        destroyOnClose: true,
        mask: true,
        closable: false,
        drawer: true,
        style: { width: 1190 },
        title: intl.get('mallf.myOrder.view.catalog.accept').d('接收'),
        onText: intl.get('mallf.myOrder.view.sureeccept.product').d('确认收货'),
        cancelText: intl.get('hzero.common.status.cancel').d('取消'),
        children: <OmsAcceptModal {...props} acceptListResult={result} />,
        ...modalProps,
      });
    }
  });
}

// 非最低价信息、跳转弹框
export function openGoToLowestSkuModal(props) {
  const { res = {} } = props;
  const result = getIsStrongOrWeakFlag(res);
  const { weakFlag, strongFlag } = result;

  const hasRuleFlag = weakFlag || strongFlag;
  if (!hasRuleFlag) {
    return 'NoRule';
  } else {
    CuxFn({
      name: 'openGoToLowestSkuModal-fn-openGoToLowestSkuModal',
      value: {
        ...props,
        weakFlag,
        strongFlag,
      },
    })(() => {
      openComfirmModal({
        title: intl.get('mallf.common.confirm.tips').d('提示'),
        style: { zIndex: 9999999 },
        children: <GoToLowestSkuModal {...props} weakFlag={weakFlag} strongFlag={strongFlag} />,
      });
    })();

    return strongFlag ? 'StrongRule' : 'WeakRule';
  }
}

// 非最低价提示弹框
export function openNotLowestTipsModal(props) {
  const { res = {} } = props;
  const result = getIsStrongOrWeakFlag(res);
  const { weakFlag, strongFlag } = result;

  const hasRuleFlag = weakFlag || strongFlag;
  if (!hasRuleFlag) {
    return 'NoRule';
  } else {
    openComfirmModal({
      title: intl.get('mallf.common.confirm.tips').d('提示'),
      style: { zIndex: 9999999 },
      children: <NotLowestTipsModal {...props} weakFlag={weakFlag} strongFlag={strongFlag} />,
    });
    return strongFlag ? 'StrongRule' : 'WeakRule';
  }
}

export function openCartLowPriceModal(props) {
  const { res, onOk, ...otherProps } = props;
  const { cartList } = res || {};
  const tableDs = new DataSet({
    selection: false,
    paging: false,
    fields: [
      {
        name: 'productName',
        label: intl.get('mallf.common.view.productName').d('商品名称'),
      },
      {
        name: 'cheapestSkuName',
        label: intl.get('mallf.common.view.lowerPriceSkuName').d('更低价商品名称'),
      },
    ],
  });
  const columns = [
    {
      name: 'productName',
    },
    {
      name: 'cheapestSkuName',
      renderer: ({ record, value }) => {
        const { cheapestSkuId, cheapestSourceForm } = record.get([
          'cheapestSkuId',
          'cheapestSourceForm',
        ]);
        return (
          <Link
            style={{ color: getPrimaryColor() }}
            to={`/product-detail?productId=${cheapestSkuId}&sourceFrom=${cheapestSourceForm}`}
          >
            {value}
          </Link>
        );
      },
    },
  ];
  const data = cartList.filter((n) => !!n.cheapestSkuId);
  tableDs.loadData(data);
  openComfirmModal({
    title: intl.get('mallf.common.confirm.tips').d('提示'),
    style: { zIndex: 9999999 },
    bodyStyle: { overflow: 'hidden', maxHeight: 'calc(100vh - 1.2rem)' },
    onOk: () => onOk(),
    children: (
      <>
        <p style={{ marginBottom: 20 }}>
          {intl
            .get('mallf.common.confirm.cart.exitLowerPrice')
            .d('存在比该商品更低价格的商品，是否继续下单')}
        </p>
        <Table style={{ maxHeight: 'calc(100vh - 520px)' }} dataSet={tableDs} columns={columns} />
      </>
    ),
    ...otherProps,
  });
}

export function openInitPurchaseModal() {
  openComfirmModal({
    title: intl.get('mallf.common.view.organization.title').d('采买身份选择'),
    okText: '确定',
    cancelButton: false,
    children: <InitUnitForm />,
  });
}

let collectList;

function handleCollect(product, callBack) {
  addCollect({
    productSource: product.sourceFromCode || product.sourceFrom,
    productId: product.productId || product.skuId,
  }).then((res) => {
    message.success(
      intl.get('mallf.common.view.wish.addCollect').d('成功加入收藏'),
      undefined,
      undefined,
      'top'
    );
    callBack(res);
  });
}

export function CollectPopOver(props) {
  const { mallType } = getUserConfigInfo();
  const { children, product, callBack = (e) => e, placement = 'bottomLeft', disabled } = props;
  const [visibel, setVisible] = useState(false);
  const [update, setUpdate] = useState(false);

  if (!collectList) {
    collectList = 'loading';
    request(`/hpfm/v1/{organizationId}/lovs/data`, {
      query: {
        lovCode: 'SMAL_FAVORITES_CATEGORY',
        channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE',
      },
    }).then((res) => {
      collectList = res;
      setUpdate(!update);
    });
  }
  if (isArray(collectList) && isEmpty(collectList) && children) {
    children.props.onClick = () => {
      handleCollect(product, callBack);
    };
  }

  return (
    <Popover
      title={intl.get(`mallf.common.view.add.favorites`).d('加入收藏')}
      content={
        <CollectPopOverList
          collectList={collectList}
          product={product}
          setVisible={setVisible}
          callBack={callBack}
        />
      }
      placement={placement}
      visible={visibel && !disabled}
      overlayClassName={styles['favorites-pop-over']}
      onVisibleChange={(vis) => setVisible(vis)}
      trigger={isEmpty(collectList) ? '' : 'click'}
    >
      {children}
    </Popover>
  );
}

// 隐藏字段校验弹窗提示
export function openValidErrorModal({ dsList }) {
  const validClassList = [
    '.c7n-pro-validation-message',
    '.c7n-pro-input-invalid',
    '.c7n-pro-select-invalid',
    '.c7n-pro-table-cell-inner-invalid',
    '.c7n-pro-btn-red', // 行附件类型
  ];
  const errorDom = document
    .querySelector('.body-allocation')
    ?.querySelector(validClassList.join(','));
  // 页面上自带展示校验则无需弹窗校验
  if (errorDom) return;
  const list = [];
  dsList.forEach((ds) => {
    ds.getValidationErrors().forEach((n) => {
      n.errors.forEach((err) => {
        const label = err.field?.get('label');
        const code = err.field?.get('name');
        const fxDisplayFlag = ds.current.get(`${code}fxDisplayFlag`);
        const visibled = isNil(fxDisplayFlag) ? err.field?.get('visibled') : fxDisplayFlag;
        if (!visibled) {
          list.push(`【${label}】`);
        }
      });
    });
  });
  const labelList = Array.from(new Set(list));
  if (isEmpty(labelList)) return;
  openComfirmModal({
    cancelButton: false,
    title: (
      <>
        <Icon
          type="cancel"
          style={{ color: getThemeColor()['danger-color'], paddingRight: 15, fontSize: 20 }}
        />
        <span style={{ verticalAlign: 'middle' }}>
          {intl.get('mallf.common.view.action.validation').d('操作失败')}
        </span>
      </>
    ),
    children: (
      <div style={{ marginLeft: 35 }}>
        {intl
          .get('mallf.common.view.validation.message', {
            value: labelList.join('、'),
          })
          .d(`操作失败，存在必输字段${labelList.join('、')}值为空，请联系管理员检查。`)}
      </div>
    ),
  });
}

export function openCountDownModal(props) {
  const { modalConfig = {}, ...other } = props || {};
  const modal = openComfirmModal({
    children: <CountDownModal modal={modal} {...other} />,
    ...modalConfig,
  });
}
