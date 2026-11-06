import React, { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { isEmpty, uniq, compose } from 'lodash';
import { withRouter } from 'react-router-dom';
import { Dropdown, Menu, Icon, Button, Tooltip } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';

import useEventListener from 'hooks/useEventListener';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import { DEFAULT_MAX } from 'utils/constants';
import SwalAlert from 'components/swal';
import {
  // centralizedCheckService,
  deleteNewCartService,
  deleteAllCartGoods,
  deleteBasketService,
} from 'services/newCartService';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { numberRender } from 'utils/utils';

import { recordsFilter, getSameRecords } from 'mall-front/lib/routes/CartProCopy/func';
import settleAccounts from 'mall-front/lib/routes/CartProCopy/CartFooter/settleAccounts';
import oldSettleAccounts from 'mall-front/lib/routes/CartProCopy/CartFooter/oldSettleAccounts';
import useCartSelected from 'mall-front/lib/routes/CartProCopy/CartFooter/useCartSelected';
import useFooterFixed from 'mall-front/lib/routes/CartProCopy/CartFooter/useFooterFixed';
import { AllCheckBox } from 'mall-front/lib/routes/CartProCopy/CartCheckBox';
import useExistFlag from 'mall-front/lib/routes/CartProCopy/CartFooter/useExistFlag';
import BatchProductAllocation from 'mall-front/lib/routes/CartProCopy/BatchAllocationButton';
import styles from './index.less';

function CartFooter(props) {
  const { dataSet, history, footerPaddingBottom, tableRef, isBasket, tabKey } = props;
  // const { unitId } = getUserConfigInfo();

  const { poFlag } = useExistFlag(recordsFilter(dataSet));

  const [{ fixed, footerScrollBarWidth }] = useFooterFixed(footerPaddingBottom, [
    dataSet.getState('startScroll'),
  ]);

  const { selectSku, totalCount, totalCountStr, totalPrice, currencySymbol } = useCartSelected(
    dataSet
  );

  const { financialPrecision } = selectSku[0] || {};
  const [totalExPrice, totalTax] = selectSku
    .reduce(
      (p, c) => {
        const { taxExcludedAmount, taxIncludedAmount } = c;
        return [
          math.plus(p[0], taxExcludedAmount),
          math.plus(p[1], math.minus(taxIncludedAmount, taxExcludedAmount)),
        ];
      },
      [0, 0]
    )
    .map((t) => numberRender(t, financialPrecision || 0, true));

  // 滚动加载更多
  useEffect(() => {
    if (!fixed && dataSet.status === 'ready' && dataSet.getState('checkCartChoosed') === 0) {
      // const { hasMoreProduct } = dataSet;
      // loadMore
      dataSet.queryCartData({ loadMore: true, startScroll: true });
      // if (hasMoreProduct) {
      //   // const tableScrollTop = document.querySelector('.c7n-pro-table-row').clientHeight * cartSize - document.body.clientHeight;
      //   document.body.scrollTop = 0;
      //   // TODO 动态设置表格scrollTop无效，暂时给个固定值
      //   tableRef.current.setScrollTop(800);
      // }
    }
  }, [fixed]);

  // 购物车加载状态
  const cartLoading = dataSet.status !== 'ready';

  const isDemander = useMemo(() => tabKey === 3, [tabKey]); // 提需人

  // 删除已选
  function handleBatchDelete() {
    if (selectSku.length < 1) return;
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      border: false,
      children: (
        <span>
          {intl.get(`mallf.cart.view.confirm.deleteChooseGoods`).d('确认删除选中的商品？')}
        </span>
      ),
      onOk: () => {
        if (dataSet.getState('cartViewType') === 1) {
          dataSet.deleteCartRecords(dataSet.selected, true);
        } else {
          dataSet.deleteCartRecords(dataSet.selected);
        }
      },
    });
  }

  // 清空购物车
  function handleAllDelete() {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      border: false,
      children: (
        <span>
          {intl
            .get(`mallf.cart.view.confirm.deleteAllGoods`)
            .d('您确定要将购物车中所有的商品清空吗？')}
        </span>
      ),
      onOk: async () => {
        const res = await deleteAllCartGoods();
        if (res) {
          dataSet.queryCartData();
        }
      },
    });
  }

  /* 清空失效商品 */
  function handleDeleteExpiredGoods() {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      border: false,
      children: (
        <span>
          {intl.get(`mallf.cart.view.confirm.deleteAllFailureGoods`).d('确认删除所有失效商品？')}
        </span>
      ),
      onOk: () => {
        if (!isDemander) {
          deleteNewCartService(expiredGoods).then(() => {
            dataSet.queryCartData();
          });
        } else {
          deleteBasketService().then(() => {
            dataSet.queryCartData();
          });
        }
      },
    });
  }

  // 领用商品全选
  function handleSelectReceive() {
    const [receiveRecords, receiveAllSelected] = getSameRecords({
      records: dataSet,
      filter: (record) => record.get('receiveFlag') === 1 && record.get('invalidFlag') === 1,
      sameFields: ['currencyCode'],
    });
    dataSet.unSelectAll();
    // 领用已经全选则不进行选中
    if (!receiveAllSelected) {
      dataSet.batchSelect(receiveRecords);
    }
  }

  // 物料全选
  function handleSelectItem() {
    // 获取有物料的且与第一个物料商品币种相同的集合
    const [itemRecords, itemAllSelected] = getSameRecords({
      records: dataSet,
      filter: (record) => record.get('itemCode') && record.get('invalidFlag') === 1,
      sameFields: Object.keys(dataSet.getValidateType()),
    });
    dataSet.unSelectAll();
    // 物料已经全选则不进行选中
    if (!itemAllSelected) {
      dataSet.batchSelect(itemRecords);
    }
  }

  /**
   * 下一步
   */
  const handleSettleAccounts = () => {
    // 提需人
    if (tabKey === 3) {
      dataSet.submitCentralizedSku();
      return;
    }
    // 下单人且不同活动的商品下一步
    if (tabKey === 4 && !dataSet.selectedIsGroup('centralizedTemplateId')) {
      SwalAlert(
        intl.get('mallf.common.view.cart.centralizeNoSame').d('只能选择相同活动的商品，请重新选择!')
      );
      return;
    }

    if (!math.isNaN(+totalPrice) && math.gt(+totalPrice, DEFAULT_MAX)) {
      SwalAlert(intl.get('mallf.common.view.cart.overPrice').d('金额超过采购上限!'));
      return;
    }

    const isOpenCart = selectSku[0].linkType === 'REQUEST' || tabKey === 4;
    // 开放购物车
    if (isOpenCart) {
      // 开放购物车下一步
      settleAccounts(dataSet, selectSku, (res) => {
        history.push({
          pathname: '/req-open-cart',
          orderData: res,
        });
      });
    } else {
      // 下一步
      oldSettleAccounts(dataSet, selectSku, (res) => {
        const { cartList, orderList } = res || {};
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
        history.push({
          pathname: '/before-order',
          data: { orderData, preData: orderList, cartList },
        });
      });
    }
  };

  const itemCanChoose = useMemo(() => {
    return (
      recordsFilter(dataSet, (record) => record.get('itemCode') && record.get('invalidFlag') === 1)
        .length > 0
    );
  }, [dataSet.length]);

  // 领用商品全选控制,存在领用并且是有效的，不是很理解skuCheckFlag?有什么作用？
  const receiveCanChoose = useMemo(() => {
    return (
      recordsFilter(
        dataSet,
        (record) => record.get('receiveFlag') === 1 && record.get('invalidFlag') === 1
      ).length > 0
    );
  }, [dataSet.length]);
  // 在存在po商品的情况下，选中商品来源不一致？用于批量修改地址禁用tip
  const multSource = selectSku.some((n) => !n.qtHeaderNo);
  // 在存在po商品的情况下，选中公司不一致，用于批量修改地址禁用tip
  const multCompany = [...new Set(selectSku.map((n) => n.companyId))].length > 1;
  // 下一步按钮disabled
  const nextButtonDisabled = useMemo(
    () =>
      totalCount <= 0 ||
      cartLoading ||
      selectSku.some(
        (item) =>
          !item.invalidFlag ||
          item.templateUpdateFlag ||
          item.noErrorFlag === 0 ||
          (item.centralizedFlag && item.centralizedStatus === 'SUBMITTED' && isDemander)
      ),
    [totalCount, cartLoading, selectSku, isDemander]
  );
  // 下一步提示标识
  const nextBtnTooltipFlag = useMemo(
    () =>
      totalCount > 0 &&
      selectSku.some(
        (item) => !item.invalidFlag || item.templateUpdateFlag || item.noErrorFlag === 0
      ),
    [totalCount, selectSku]
  );
  // 失效商品
  const expiredGoods = recordsFilter(dataSet, (record) => record.get('invalidFlag') === 0);
  // 拼单 已加入拼单不可删除
  const sharedOrderSubmitedFlag = useMemo(
    () => selectSku.some((item) => item.centralizedFlag && item.centralizedStatus === 'SUBMITTED'),
    [selectSku]
  );
  // 拼单 失效商品
  const sharedOrderExpiredGoods = recordsFilter(
    dataSet,
    (record) => record.get('centralizedStatus') === 'INVALID'
  );
  const moreMenus = (
    <Menu selectable={false}>
      <CuxWrapper path="CartProCopy/renderPunchoutAdress">
        <Menu.Item r-if={poFlag}>
          <li className="cart-footer-select-po-address">
            <Tooltip
              title={
                multSource
                  ? intl
                      .get('mallf.cart.view.address.hasPunchout')
                      .d('商品来源不一致，不能批量修改地址')
                  : multCompany
                  ? intl
                      .get('mallf.cart.view.address.punchoutDidabled')
                      .d('公司不一致，不能批量修改地址')
                  : ''
              }
            >
              <span>
                <a
                  disabled={multSource || multCompany || isEmpty(selectSku)}
                  onClick={() => {
                    dataSet.setUpdatePoRecords(dataSet.selected);
                    dataSet.openAddressModal();
                  }}
                >
                  {intl.get(`mallf.cart.model.update.address`).d('修改地址')}
                </a>
              </span>
            </Tooltip>
          </li>
        </Menu.Item>
      </CuxWrapper>
      <Menu.Item onClick={handleDeleteExpiredGoods} disabled={isEmpty(expiredGoods)}>
        <span title={intl.get('mallf.cart.model.item.clearExpiredGoods').d('清空失效商品')}>
          {intl.get('mallf.cart.model.item.clearExpiredGoods').d('清空失效商品')}
        </span>
      </Menu.Item>
      <Menu.Item disabled={!receiveCanChoose} onClick={handleSelectReceive}>
        <span title={intl.get('mallf.cart.model.item.receiveSelect').d('领用商品全选')}>
          {intl.get('mallf.cart.model.item.receiveSelect').d('领用商品全选')}
        </span>
      </Menu.Item>
      <Menu.Item disabled={!itemCanChoose} onClick={handleSelectItem}>
        <span title={intl.get('mallf.cart.model.item.allSelect').d('物料全选')}>
          {intl.get('mallf.cart.model.item.allSelect').d('物料全选')}
        </span>
      </Menu.Item>
    </Menu>
  );

  function footerBarhandleScroll() {
    if (tableRef.current) {
      const tableScrollLeft = document.querySelector('.cart-footer-scroll-box').scrollLeft;
      tableRef.current.setScrollLeft(tableScrollLeft);
    }
  }

  useEventListener(
    'scroll',
    footerBarhandleScroll,
    document.querySelector('.cart-footer-scroll-box'),
    true
  );

  return (
    <>
      <div
        className={classNames({
          [styles['cart-pro-footer']]: true,
          [styles['levitate-cart-footer']]: fixed && dataSet.length,
        })}
        style={{ width: 1190 }}
      >
        <ul className={classNames([{ 'levitate-ul': !fixed }, 'cart-footer-bar-ul'])}>
          <div
            style={{
              width: 1190,
              visibility:
                dataSet.getState('cartViewType') !== 1 && fixed && footerScrollBarWidth > 1190
                  ? 'visible'
                  : 'hidden',
            }}
            className="cart-footer-scroll-box"
          >
            <div style={{ width: footerScrollBarWidth }} className="cart-footer-scroll-bar" />
          </div>
          <li className="cart-footer-selection">
            <AllCheckBox dataSet={dataSet} />
          </li>
          <li className="cart-footer-select-num">
            <span id="selected">
              {intl.get(`mallf.cart.model.all.choosed`).d('已选')}
              {`(${uniq(selectSku.map((p) => p.cartId)).length})`}
            </span>
          </li>
          <li
            className={
              selectSku.length > 0
                ? 'cart-footer-check-select'
                : 'cart-footer-check-select-disabled'
            }
            onClick={() => {
              dataSet.checkChoosed();
            }}
          >
            <a disabled={!selectSku.length > 0}>
              {dataSet.getState('checkCartChoosed') === 0 ? (
                <Tooltip title={intl.get(`mallf.cart.model.check.choosed`).d('查看已选')}>
                  <Icon type="visibility-o" />
                </Tooltip>
              ) : (
                <Tooltip title={intl.get(`mallf.cart.model.cancelCheck.choosed`).d('取消查看已选')}>
                  <Icon type="visibility_off-o" />
                </Tooltip>
              )}
            </a>
          </li>
          <li className="cart-footer-check-select" r-if={tabKey !== 4}>
            <a disabled={sharedOrderSubmitedFlag || (selectSku.length === 0 && tabKey === 3)}>
              {selectSku.length === 0 ? (
                <Tooltip title={intl.get(`mallf.cart.model.cart.deleteAll`).d('清空购物车')}>
                  <Icon type="delete_black-o" onClick={() => handleAllDelete()} />
                </Tooltip>
              ) : (
                <Tooltip title={intl.get(`mallf.cart.model.hadChoose.delete`).d('删除已选')}>
                  <Icon type="delete_black-o" onClick={() => handleBatchDelete()} />
                </Tooltip>
              )}
            </a>
          </li>
          <li className="cart-footer-check-select" r-if={!isBasket || isDemander}>
            <Divider type="vertical" />
          </li>
          <li className="cart-footer-batch-allocation" r-if={!isBasket || isDemander}>
            <BatchProductAllocation
              getCheckedProduct={selectSku}
              fetchProduct={() => dataSet.queryCartData()}
            />
          </li>
          <li className="cart-footer-batch-allocation" r-if={isDemander}>
            <a disabled={isEmpty(sharedOrderExpiredGoods)} onClick={handleDeleteExpiredGoods}>
              {intl.get('mallf.cart.model.item.clearExpiredGoods').d('清空失效商品')}
            </a>
          </li>
          <li className="cart-footer-option-more" r-if={!isBasket}>
            <Dropdown overlay={moreMenus} placement="topLeft">
              <span>
                {intl.get('hzero.common.button.more').d('更多')}
                <Icon type="expand_less" style={{ marginTop: -3 }} />
              </span>
            </Dropdown>
          </li>
          <li className="cart-footer-next">
            <Tooltip
              title={
                nextBtnTooltipFlag
                  ? intl
                      .get('mallf.cart.tooltip.cartNextDisabled')
                      .d('数据校验不通过，请查看商品行上的提示信息')
                  : null
              }
            >
              <Button
                color="primary"
                onClick={() => {
                  // 存在数量变更请求中的商品
                  if (dataSet.getState('quantityChangeCartId')) {
                    return;
                  }
                  handleSettleAccounts();
                }}
                disabled={nextButtonDisabled}
                className={classNames({
                  'cart-footer-next-btn': true,
                  'cart-footer-next-btn-disabled': nextButtonDisabled,
                })}
              >
                {isDemander
                  ? intl.get(`mallf.cart.view.next.addSharedOrder`).d('加入拼单')
                  : intl.get(`mallf.common.view.next`).d('下一步')}
              </Button>
            </Tooltip>
          </li>
          <li className="cart-footer-price">
            <div>
              总金额 (不含税)(不含运费)：
              <span className="cartRed2">
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {`${currencySymbol ? `${currencySymbol} ` : ''}`}
                </span>
                {totalExPrice}
              </span>
            </div>
            <div>
              总税额：
              <span className="cartRed2">
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {`${currencySymbol ? `${currencySymbol} ` : ''}`}
                </span>
                {totalTax}
              </span>
            </div>
            <div>
              总金额 (含税)(不含运费)：
              <span className="cartRed2">
                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                  {`${currencySymbol ? `${currencySymbol} ` : ''}`}
                </span>
                {totalPrice}
              </span>
            </div>
          </li>
          <li className="cart-footer-count">
            {intl
              .getHTML(`mallf.cart.model.hadChooseItems`, {
                value: totalCount,
              })
              .d(
                <span>
                  已选择<b>{totalCountStr}</b>件商品
                </span>
              )}
          </li>
        </ul>
      </div>
      <div r-if={fixed} style={{ height: 54 }} />
    </>
  );
}

export default compose(withRouter, observer)(CartFooter);
