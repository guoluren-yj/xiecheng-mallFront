import React, { useState, useEffect, useRef } from 'react';

import Icons from 'components/Icons';
import { getUserConfigInfo, getAccessToken, getStorage, removeStorage } from 'utils/utils';
import intl from 'utils/intl';
import { fetchAddressService } from 'services/addressService';
import StockArea from './StockArea';
import style from './index.less';

let timer;
function AddressArea() {
  const isLogin = !!getAccessToken();
  const isShowArea = window.location.href.match('product-detail');
  const { userId, companyId } = getUserConfigInfo();
  const area = useRef(null);
  const { first, second, third, fourth } = getStorage(`${userId}_region`) || {};
  const [visible, setVisible] = useState(false);
  const [defaultAddressInfo, setDefaultAddress] = useState({});
  const [blackBg, setBlackBg] = useState(false);
  const [whiteBg, setWhiteBg] = useState(false);
  const { shengName } = first || {};
  const { shiName, isNAFlag: secondNAFlag } = second || {};
  const { xianName, isNAFlag: thirdNAFlag } = third || {};
  const { xiangzhenName } = fourth || {};
  const isShiNAFlag = secondNAFlag ? shengName : shiName;
  let detailArea = `${shengName} ${secondNAFlag ? '' : shiName} ${thirdNAFlag ? '' : xianName}`;
  const defaultAddress = (defaultAddressInfo.regionNameList || []).join('');
  if (xiangzhenName) {
    detailArea = `${detailArea} ${xiangzhenName}`;
  }
  detailArea = isShiNAFlag ? detailArea : defaultAddress;

  /**
   * 请求地址数据
   */
  const fetchAddress = () => {
    const params = {
      addressType: 'RECEIVER',
      enabledFlag: 1,
      defaultFlag: 1,
      userId,
      companyId,
    };
    fetchAddressService(params).then((res) => {
      const { content = [] } = res;
      if (content.length === 0) {
        removeStorage(`${userId}_defaultAddressName`);
        removeStorage(`${userId}_defaultAddressCode`);
        removeStorage(`${userId}_defaultAddressId`);
        removeStorage(`${userId}_defaultAddressPhone`);
        if (!third) {
          setVisible(true);
        }
      } else {
        setDefaultAddress(content[0]);
      }
    });
  };

  useEffect(() => {
    if (isLogin && companyId) {
      fetchAddress({ enabledFlag: 1, defaultFlag: 1, userId, companyId });
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown, false);
    return () => {
      document.addEventListener('mousedown', handleMouseDown, false);
    };
  }, []);

  function handleMouseDown(e) {
    if (
      area.current &&
      !area.current.contains?.(e.target) &&
      (getStorage(`${userId}_defaultAddressId`) || getStorage(`${userId}_region`))
    ) {
      setVisible(false);
    }
  }

  return (
    <div
      className={style['address-area']}
      style={{ position: 'relative', display: 'inline-block' }}
    >
      {isLogin && !isShowArea && companyId && (
        <>
          <div className="header-vertical" />
          <div
            className="header-area"
            onFocus
            onMouseOver={() => {
              setVisible(true);
            }}
          >
            <Icons
              type="icon_location"
              size={14}
              style={{ marginRight: '4px', position: 'relative', top: 2 }}
            />
            <span
              title={visible ? detailArea : isShiNAFlag || defaultAddressInfo.regionNameList?.[1]}
            >
              {(visible ? detailArea : isShiNAFlag || defaultAddressInfo.regionNameList?.[1]) ||
                intl.get('mallf.common.view.add.addressInfo').d('添加地区信息')}
            </span>
          </div>
        </>
      )}
      {companyId && (
        <div
          className={`${blackBg ? 'black-stock-area' : ''} ${
            whiteBg ? 'white-stock-area' : ''
          } stock-area-bg`}
        />
      )}
      <div id="shade-content" className="stock-area" ref={area}>
        {isLogin && visible && companyId && (
          <StockArea
            setWhite={() => setWhiteBg(true)}
            setblack={() => {
              setBlackBg(true);
              clearTimeout(timer);
              timer = setTimeout(() => {
                setBlackBg(false);
              }, 3000);
            }}
            visible={visible}
            setVisible={setVisible}
          />
        )}
      </div>
    </div>
  );
}

export default AddressArea;
