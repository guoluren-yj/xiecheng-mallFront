import React, { useState, useMemo } from 'react';
import { Modal, Input, Popover, Icon } from 'hzero-ui';
import { InputNumber } from 'choerodon-ui';

import Link from 'components/Link';
import Image from 'components/Image';
import SwalAlert from 'components/swal';
import Icons from 'components/Icons';
import intl from 'utils/intl';
import { openComfirmModal } from 'utils/modals';
import { numberRender, convertImg } from 'utils/utils';
import style from './cartItem.less';
import BudgetInfo from './Budget';

const { TextArea } = Input;

function CartItem(props) {
  const symbol = '';
  /** 新增的多语言 */
  const pieces = intl.get(`mallf.cart.model.cart.pieces`).d('件');
  // 选择的货币类型
  const {
    updateCart,
    deleteCart,
    // updateCheck,
    item,
    item: { ladderPrices },
    editBudget,
    budgetList,
    budgetSelectList,
    // currentCode,
  } = props;

  const [morePrice, setMorePrice] = useState(false);
  // 图片usrl跳转
  const HandleImgUrl = (code, url) => {
    return code === 'CATA' ? url : convertImg(url, 1, code);
  };
  const [remarkVisible, setRemarkVisible] = useState(false);
  const [remarkValue, setRemarkValue] = useState();

  // /**
  //  * 单条收藏商品
  //  */
  // const handleCollect = () => {
  //   // if (item.productSource !== 'CATA') {
  //   //   item.productSource = 'EC';
  //   // }
  //   const collectProduct = [
  //     {
  //       companyId: item.companyId,
  //       productId: item.productId,
  //       productSource: item.productSource,
  //       purchaseType,
  //       tenantId: item.tenantId,
  //     },
  //   ];
  //   if (item.collectFlag === 1) {
  //     return;
  //   }
  //   collectProductService(collectProduct).then(
  //     SwalAlert(intl.get(`mallf.cart.view.cart.hasCollected`).d('已加入收藏'))
  //   );
  // };

  /**
   * 单条删除商品
   */
  const handleDelete = () => {
    openComfirmModal({
      title: intl.get('mallf.common.view.confirmDeleteTitle').d('确认删除'),
      border: false,
      children: (
        <span>{intl.get(`mallf.cart.model.confirm.deleteProduct`).d('确认删除该商品？')}</span>
      ),
      onOk: () => {
        deleteCart([item]);
      },
    });
  };

  /**
   * 京东服务费用
   */
  const handleDeleteService = (i) => {
    const msg =
      i.skuType === 2
        ? intl.get(`mallf.cart.model.confirm.deleteProductGift`).d('确认删除该赠品？')
        : intl.get(`mallf.cart.model.confirm.deleteProductService`).d('确认删除该服务？');
    SwalAlert(msg, true).then((res) => {
      if (res.value) {
        deleteCart([i]);
      }
    });
  };

  function handleMouseEnter() {
    setMorePrice(true);
  }
  function handleMouseLeave() {
    setMorePrice(false);
  }

  const showLadderPrices = useMemo(() => {
    if (ladderPrices) {
      return (
        <div
          style={{ position: 'relative', fontSize: '12px', color: '#888' }}
          onMouseEnter={() => handleMouseEnter()}
          onMouseLeave={() => handleMouseLeave()}
        >
          {intl.get(`mallf.cart.view.cart.rangPrice`).d('阶梯价格')}
          <Icons type="question" size="11" style={{ paddingLeft: 6 }} />
          {morePrice && (
            <div className="ladderPrice">
              {/* <div className='fixed-top' /> */}
              <div className="ladderPrice-content">
                {ladderPrices.map((tmp) =>
                  tmp.ladderTo ? (
                    <div
                      className={`ladderPrice-item ${
                        numberRender(tmp.taxPrice) === numberRender(item.latestPrice)
                          ? 'currency-color'
                          : ''
                      }`}
                    >
                      <div className="ladderPrice-number">
                        {tmp.ladderFrom}-{tmp.ladderTo}
                        {pieces}
                      </div>
                      <div className="ladderPrice-price">
                        {symbol}
                        {numberRender(tmp.taxPrice)}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`ladderPrice-item ${
                        numberRender(tmp.taxPrice) === numberRender(item.latestPrice)
                          ? 'currency-color'
                          : ''
                      }`}
                    >
                      <div className="ladderPrice-number">
                        {`>=${tmp.ladderFrom}`}
                        {pieces}
                      </div>
                      <div className="ladderPrice-price">
                        {symbol}
                        {numberRender(tmp.taxPrice)}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      );
    } else {
      return <></>;
    }
  }, [ladderPrices, morePrice]);

  const { shelf } = props;

  const editRemark = () => {
    updateCart({
      ...item,
      remark: remarkValue,
    });
    setRemarkVisible(false);
  };

  const remarkChange = (e) => {
    const val = e.target.value;
    setRemarkValue(val || '');
  };

  const remarkEditModal = () => {
    return (
      <Modal
        destroyOnClose
        wrapClassName="hmall-content-Modal add-adrees-modal"
        width={400}
        title={intl.get('mallf.cart.view.product.remark').d('商品备注')}
        visible={remarkVisible}
        okText={intl.get(`mallf.cart.model.confirm`).d('确认')}
        cancelText={intl.get(`mallf.cart.button.cancel`).d('取消')}
        onCancel={() => setRemarkVisible(false)}
        onOk={editRemark}
        // confirmLoading={saveLoading}
      >
        <TextArea value={remarkValue} rows={3} onChange={(e) => remarkChange(e)} />
      </Modal>
    );
  };

  return (
    <div id={item.cartId} className={style['cart-body-container']} key={item.cartId}>
      <ul className="cart-body-wrapper">
        <li className="interval" />
        <li className="cart-body-img">
          <div>
            <Image
              value={HandleImgUrl(item.productSource, item.imagePath)}
              width={72}
              height={72}
            />
          </div>
        </li>
        <li className="cart-body-detail">
          <div className="cart-body-name" title={`${item.productName}`}>
            <Link disabled style={{ color: '#191919' }}>
              {item.productName}{' '}
            </Link>
          </div>
        </li>
        <li className="cart-body-purches" style={{ borderColor: '#fff' }}>
          <p className={`detail-info-remark ${item.remark && 'remark-no-hover'}`}>
            <div style={{ display: 'inline-block', width: 70, verticalAlign: 'top' }}>
              商品备注：
            </div>
            <div style={{ display: 'inline-block', width: 120, height: 40, overflow: 'hidden' }}>
              {item.remark && (
                <Popover content={item.remark}>
                  <span>{item.remark}</span>
                </Popover>
              )}
              {remarkVisible && remarkEditModal()}
            </div>
            <div
              style={{
                display: 'inline-block',
                width: 40,
                overflow: 'hidden',
                verticalAlign: 'top',
              }}
            >
              <a
                style={{ marginLeft: 4 }}
                className="detail-info-update"
                onClick={() => setRemarkVisible(true)}
              >
                {intl.get(`mallf.cart.model.update`).d('修改')}
              </a>
            </div>
          </p>
        </li>
        {/* <li className="cart-body-unit">{item.currencyCode || 'CNY'}</li> */}
        <li className="cart-body-price">
          <div>
            {/* {item.shelfFlag === 1 && item.invalidFlag !== 0
              ? numberRender(item.latestPrice)
              : numberRender(item.unitPrice)} */}
            {item.latestPriceMeaning || item.latestPrice}
          </div>
          <div>
            {!!item.diffPrice && shelf && (
              <React.Fragment>
                {item.diffPrice > 0 ? (
                  <span className="diffPrice-up">
                    <Icons
                      type="prise_rise"
                      size="10"
                      style={{ color: '#d0521e', marginRight: '8px' }}
                    />
                    {item.diffPrice}
                  </span>
                ) : (
                  <span name="prise_down">
                    <Icons
                      type="prise_down"
                      size="10"
                      style={{ color: '#5CAE2A', marginRight: '8px' }}
                    />
                    {Math.abs(item.diffPrice)}
                  </span>
                )}
              </React.Fragment>
            )}
          </div>
          {!!ladderPrices && showLadderPrices}
        </li>
        <li className="cart-body-count">
          <InputNumber style={{ width: 86 }} value={item.quantity} disabled />
        </li>
        <li
          className="cart-body-all-price text-overflow"
          title={`${item.totalAmountMeaning || item.totalAmount}${item.currencyCode}`}
        >
          {item.totalAmountMeaning || item.totalAmount}
          <p>{item.currencyCode}</p>
        </li>
        <li className="cart-body-option">
          <div className="remove-btn">
            <div
              onClick={() => {
                handleDelete();
              }}
            >
              <a>{intl.get(`mallf.cart.view.cart.delete.product`).d('删除商品')}</a>
            </div>
          </div>
          <BudgetInfo
            budgetData={item}
            budgetList={budgetList}
            budgetSelectList={budgetSelectList}
            saveCallBack={editBudget}
          />
        </li>
      </ul>
      {item.seSkuList?.length > 0 && (
        <ul className="cart-service" style={{ paddingBottom: 16 }}>
          {item.seSkuList.map((i) => (
            <div
              className="cart-service-body"
              style={{
                fontSize: '12px',
                color: i.skuType === 1 ? '#5cae2a' : i.skuType === 2 ? '#5cae2a' : '#999',
              }}
            >
              <span style={{ marginLeft: '160px' }}>
                {`【${
                  i.skuType === 1
                    ? intl.get(`mallf.cart.view.common.annex`).d('附件')
                    : i.skuType === 2
                    ? intl.get(`mallf.cart.view.common.giveaway`).d('赠品')
                    : i.skuType === 3
                    ? intl.get(`mallf.cart.view.common.service`).d('服务')
                    : ''
                }】`}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '200px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                  verticalAlign: 'bottom',
                }}
                title={i.productName}
              >
                {i.productName}
              </span>
              <span
                style={{
                  marginLeft: '5px',
                  display: 'inline-block',
                  width: '26px',
                  marginRight: 2,
                }}
              >
                x{i.quantity}
              </span>
              <span
                style={{
                  display: 'inline-block',
                  width: '60px',
                  textAlign: 'right',
                  marginRight: '20px',
                }}
              >
                {numberRender(i.quantity * i.latestPrice)}
              </span>
              {i.skuType !== 1 && (
                <a className="btn-del" onClick={() => handleDeleteService(i)}>
                  {intl.get(`mallf.cart.button.delete`).d('删除')}
                </a>
              )}
            </div>
          ))}
        </ul>
      )}
      {/* 预算检验不通过提示 */}
      {(item.success === 0 || item.errorOutFlag) && (
        <div className="cart-budget-warn">
          <span>
            <Icon type="exclamation-circle" size={13} style={{ marginRight: '6px' }} />
            {item.occupancyMessage ||
              intl.get('mallf.cart.view.cartBudgetWarn').d('预算信息不通过，点击预算信息查看详情')}
          </span>
        </div>
      )}
    </div>
  );
}

export default CartItem;
