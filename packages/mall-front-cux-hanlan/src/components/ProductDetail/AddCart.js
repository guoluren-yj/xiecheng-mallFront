import React from 'react';
import { AddCartCom } from 'routes/NewProductDetail/productInfo/AddCart.js';
import { getSprmListUrl } from 'utils/utils';
import styles from './index.less';

function AddCart(props) {
  const { stockNumber, isReceive } = props;

  return (
    <>
      <AddCartCom {...props} />
      {isReceive ? (
        <div className={styles['add-cart-bottom']}>
          <div style={{ marginTop: '-7px' }}>库存：{stockNumber}</div>
          <div>
            公司内部领用请前往
            <a
              href="http://mk.hanhe-cable.com:30300/web/#/1i0htbc1tw1c0w5rkl9w23hb6ubh3r452aw0/sys-modeling/HL-Hardware"
              target="_blank"
              rel="noreferrer noopener"
            >
              智慧办公平台
            </a>
          </div>
          <div>
            跨公司领用使用
            <a target="_blank" rel="noreferrer noopener" href={getSprmListUrl()}>
              公司间采购申请
            </a>
          </div>
          <div>资产类领用请线下与资产所属部门对接</div>
        </div>
      ) : null}
    </>
  );
}

export default AddCart;
