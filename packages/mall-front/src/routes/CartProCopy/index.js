import React, { useRef, useEffect, useCallback, useState } from 'react';
import qs from 'qs';
import { connect } from 'dva';
import { Observer } from 'mobx-react';
import { compose } from 'lodash';
import { withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { Table, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getUserConfigInfo } from 'utils/utils';
import Loading from 'components/loading';
import BreadCrumbs from 'components/BreadCrumbs';
import AddressLov from 'components/AddressLov';
import { fetchCartConfig } from 'services/newCartService';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { groupField } from './enum';
import { recordsFilter } from './func';

import EmptyCart from './EmptyCart';
import CartFooter from './CartFooter';
import useCartDataSet from './useCartDataSet';
import useTabGroup from './useTabGroup';

import styles from './index.less';
import CartHeader from './CartHeader';

function CartPro(props) {
  const {
    location,
    oldTenantFlag,
    batchAllocationCount,
    constants: { footerPaddingBottom },
  } = props;
  const addressRef = useRef();
  const tableRef = useRef();
  const [{ centralizedFlag, centralizedOrderFlag }, setCartConfig] = useState({});
  const { userId, companyId } = getUserConfigInfo();

  const { dataSet: cartDataSet, basketDataSetList } = useCartDataSet();
  const { initKey, tabKey, tabs, groups, isBasket, onTabChange, onResetTab } = useTabGroup({
    centralizedFlag,
    centralizedOrderFlag,
    tabChange: handleTabChange,
  });

  function getDataSet(key) {
    return key === 3 ? basketDataSetList[0] : key === 4 ? basketDataSetList[1] : cartDataSet;
  }

  const dataSet = getDataSet(tabKey);

  useEffect(() => {
    if (oldTenantFlag !== undefined) {
      cartInit();
    }
    const againCartIds = Object.values(qs.parse(location?.query));
    cartDataSet.setAgainCartIds(againCartIds);
    cartDataSet.openAddressModal = openAddressModal;
    basketDataSetList[0].openAddressModal = openAddressModal;
    basketDataSetList[1].openAddressModal = openAddressModal;
    basketDataSetList[0].setCartConfig = setCartConfig; // 挂载更新配置方法
  }, [oldTenantFlag]);

  async function cartInit() {
    let cartConfig;
    try {
      cartConfig = await fetchCartConfig();
      if (cartConfig) {
        setCartConfig(cartConfig);
      }
    } finally {
      let currentDataSet;
      if (cartConfig?.centralizedFlag && initKey === 3) {
        currentDataSet = basketDataSetList?.[0];
      } else if (cartConfig?.centralizedOrderFlag && initKey === 4) {
        currentDataSet = basketDataSetList?.[1];
      } else {
        // 初始为购物篮tab重置为1
        // const resetKey = [3, 4].includes(initKey) ? initKey : 1;
        // onResetTab(resetKey);
        currentDataSet = cartDataSet;
      }
      // 无权限且有tab缓存 重置
      if (
        (!cartConfig?.centralizedFlag && initKey === 3) ||
        (!cartConfig?.centralizedOrderFlag && initKey === 4)
      ) {
        onResetTab(1);
      }
      currentDataSet.queryCartData();
      currentDataSet.setBackCartIds(location?.cartList || []);
    }
  }

  // 标签切换回调
  function handleTabChange(key, groupType) {
    const ds = getDataSet(key);
    if (groupType === 'cart') {
      if (ds.cartLoading) {
        ds.queryCartData();
      } else {
        if (!ds.isCartEmpty) {
          ds.setViewSpinning(true);
        }
        setTimeout(() => {
          ds.changeViewType(key);
        }, 200);
      }
    } else {
      ds.queryCartData();
    }
  }

  // 打开地址弹窗
  function openAddressModal() {
    addressRef.current.element.element.click();
  }

  // 设置onRow => object
  const tableOnRow = useCallback(({ record, dataSet: ds }) => {
    const {
      [groupField.groupFlag]: groupFlag,
      [groupField.againFlag]: againFlag,
      invalidFlag,
      // qtHeaderNo,
    } = record.get([groupField.groupFlag, groupField.againFlag, 'invalidFlag', 'qtHeaderNo']);
    const isInvalid = !invalidFlag;
    return {
      className: classNames({
        'cart-pro-item': true,
        'cart-pro-item-header': groupFlag,
        'cart-pro-item-header-group': ds.getState('cartViewType') === 1 && groupFlag,
        'cart-pro-item-again': againFlag,
        'cart-pro-item-invalid': isInvalid,
      }),
    };
  }, []);

  // 内容渲染
  const cartContentRender = () => {
    return (
      <Observer>
        {() => {
          const cartIsLoading = [cartDataSet, ...basketDataSetList].every((e) => e.cartLoading);
          if (cartIsLoading) return <Loading />;
          return (
            <Spin dataSet={dataSet}>
              <CartHeader
                tabKey={tabKey}
                tabs={tabs}
                groups={groups}
                dataSet={dataSet}
                onTabChange={onTabChange}
              />
              {dataSet.cartLoading ? null : dataSet.isCartEmpty ? (
                <EmptyCart isBasket={isBasket} />
              ) : (
                <>
                  <div className="cart-pro-body">
                    <Table
                      virtual
                      virtualSpin
                      dataSet={dataSet}
                      columns={dataSet.tabelColumns}
                      ref={tableRef}
                      rowHeight="auto"
                      headerRowHeight={42}
                      selectionMode="none"
                      onRow={tableOnRow}
                      onScrollLeft={(left) => {
                        if (document.querySelector('.cart-footer-scroll-box')) {
                          document.querySelector('.cart-footer-scroll-box').scrollLeft = left;
                        }
                      }}
                      spin={{ spinning: false }}
                      highLightRow={false}
                      columnResizable
                      selectedHighLightRow={false}
                      groups={dataSet.tabelGroups}
                      customizedCode={
                        tabKey === 1
                          ? 'OPEN_CART_TABLE_A'
                          : tabKey === 2
                          ? 'OPEN_CART_TABLE_B'
                          : null
                      }
                      // style={{ maxHeight: tabelMaxHeight }}
                    />
                  </div>
                  <CartFooter
                    tableRef={tableRef}
                    dataSet={dataSet}
                    tabKey={tabKey}
                    isBasket={isBasket}
                    footerPaddingBottom={footerPaddingBottom}
                    batchAllocationCount={batchAllocationCount}
                  />
                </>
              )}
            </Spin>
          );
        }}
      </Observer>
    );
  };

  return (
    <div className={styles['cart-pro-wrapper']}>
      <CuxWrapper path="CartProCopy/renderGuide" />
      <BreadCrumbs
        className="breadCrumbs"
        value={{
          pageTitle: intl.get(`mallf.common.view.cart`).d('购物车'),
        }}
      />
      <div className="cart-pro-body-box container">
        {cartContentRender()}
        <div className="cart-pro-body-box-spinning">
          <Spin wrapperClassName="cart-pro-body-box-spinning-Spin">
            <div style={{ width: '100%', height: window.innerHeight - 230 }} />
          </Spin>
        </div>
      </div>
      {/* 地址弹窗：display:none，修改地址 */}
      <Observer>
        {() => {
          const lovPara = isBasket
            ? {
                userId,
                companyId:
                  recordsFilter(dataSet.selected)?.[0]?.HEADER_companyId_value || companyId,
              }
            : { userId, companyId };
          return (
            <AddressLov
              mode="button"
              className="address-lov"
              clearButton={false}
              onRef={(ref) => {
                addressRef.current = ref;
              }}
              lovPara={lovPara}
              onChange={(item) => dataSet.updatePoAddress(item.addressId)}
            />
          );
        }}
      </Observer>
    </div>
  );
}

export default compose(
  withRouter,
  formatterCollections({ code: 'mallf.cart' }),
  connect(({ global }) => ({
    isNewCart: global.isNewCart,
    webConfig: global.webConfig,
    constants: global.constants,
    oldTenantFlag: global.oldTenantFlag,
    batchAllocationCount: global.batchAllocationCount,
  }))
)(CartPro);
