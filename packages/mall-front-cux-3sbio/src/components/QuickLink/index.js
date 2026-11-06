import React, { useState, useEffect, useMemo } from 'react';
import { Spin, Popover } from 'choerodon-ui';
import qs from 'qs';
import { Modal, Button } from 'choerodon-ui/pro';

import Link from 'components/Link';
import {
  getAccessToken,
  getUserConfigInfo,
  getProductLinkParams,
  openPage,
  getOnlyInStock,
} from 'utils/utils';
import { fetchZhuanqu, checkIn } from 'services/headerService';
import intl from 'utils/intl';
import style from 'components/swal/index.less';
import Swal from 'components/swal';
import logo01 from '@/assets/merck-logo.png';
import logo02 from '@/assets/182158873-logo.png';
import logo03 from '@/assets/univ.png';
import logo04 from '@/assets/biosystems.png';
import { fetchAddressService } from 'services/addressService';
import HmallConfig from 'utils/api-config';
import styles from './index.less';

const imgMapping = {
  182158873: logo02,
  MERCK: logo01,
  'UNIV-PUNCHOUT': logo03,
  'ACRO-PUNCHOUT': logo04,
};

const renderUNIVTip = () => {
  return (
    <>
      <div style={{ marginBottom: '10px', fontWeight: 'bold', fontSize: '16px' }}>
        生命科学一站式供应商，专业全面安全便捷
      </div>
      <div style={{ width: '510px' }}>
        <span style={{ fontWeight: 'bold' }}>60+国际知名品牌代理</span>
        （BD、Miltenyi、Jackson、Cytiva、CST、santa、Bioxcell、Lonza，polyplus、lKA,Carna,lifespan,Biogenes,Bioauxilium等）
      </div>
      <div>
        <span style={{ fontWeight: 'bold' }}>4个自主品牌</span>（UA
        BIOSCIENCE，Starter，Absin、labex）
      </div>
    </>
  );
};

function getLinkUrl(data, { mallType }) {
  if (data.pickSupplierFlag) {
    // 跳转甄选专区
    return '/zone-supplier-list';
  }
  const { productGroup, productGroupId, bannerName, blockId } = data || {}; // 商品组信息
  const { productGroupAssignList = [], groupType, orderType, includeNoStockFlag } =
    productGroup || {}; // 商品组行信息
  const params = {
    blockId,
    bannerName,
    onlyInStock: getOnlyInStock(includeNoStockFlag),
  };
  const newParams = getProductLinkParams({
    param: params,
    orderType,
    groupType,
    productGroupId,
    productGroupAssignList,
    isLink: true,
  });
  return `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(newParams)}`;
}

export default function QuickLink({ ecList }) {
  const poList = useMemo(() => {
    const list = ecList.filter((f) => f.interfaceType === 'PO');
    const newList = list.map((item) => {
      if (item.ecPlatformCode === 'UNIV-PUNCHOUT') {
        return {
          ...item,
          renderTip: renderUNIVTip(),
        };
      }
      return item;
    });
    // const univ = {
    //   ecPlatformCode: 'UNIV-PUNCHOUT',
    //   ecPlatformName: intl.get('mallf.header.view.univ').d('UNIV-PUNCHOUT'),
    //   renderTip: renderUNIVTip(),
    // };
    return newList;
  }, [ecList]);
  const [quickLinkList, setQuickLinkList] = useState([]);
  const { pickSupplierFlag } = getUserConfigInfo();
  const { unitId = null, mallType } = getUserConfigInfo();
  useEffect(() => {
    if (unitId || mallType === 'sigl') {
      fetchZhuanqu({
        belongType: 0,
        channel: mallType === 'sigl' ? 1 : 0,
        filterLabelFlag: 1, // 过滤会员标签
        shelfFlag: 1,
        unitId,
      }).then((res) => {
        const zhenxuanObj =
          mallType === 'sigl'
            ? {}
            : {
                blockTitle: intl.get(`mallf.header.view.zhenxuanzhuanqu`).d('甄选专区'),
                boldFlag: 1,
                pickSupplierFlag: 1,
              };
        const linkArr = pickSupplierFlag
          ? [zhenxuanObj, ...(res?.content?.slice(0, 6) || [])]
          : res?.content?.slice(0, 7) || [];
        setQuickLinkList(linkArr);
      });
    }
  }, [unitId]);

  const [checkLoading, setCheckLoading] = useState(false);

  function isJson(res) {
    let result;
    try {
      result = JSON.parse(res);
    } catch (e) {
      return false;
    }
    return typeof result === 'object' && typeof result !== 'string';
  }

  async function checkGetUrl(item) {
    try {
      const { ecPlatformCode: supplierCode } = item;
      const { userId, companyId } = getUserConfigInfo();
      const onOk = async () => {
        const res = await checkIn({ supplierCode, webUrl: `${window.location.origin}/cart` });
        if (isJson(res) && JSON.parse(res).failed) {
          Swal(JSON.parse(res).message);
        } else if (res) {
          openPage(res, true);
        }
        return true;
      };
      setCheckLoading(true);
      if (['ACRO-PUNCHOUT', 'UNIV-PUNCHOUT'].includes(supplierCode)) {
        // UNIV不需校验地址
        await onOk();
        setCheckLoading(false);
        return;
      }
      const params = {
        addressType: 'RECEIVER',
        enabledFlag: 1,
        defaultFlag: 1,
        userId,
        companyId,
      };
      const defaultAddress = await fetchAddressService(params);
      setCheckLoading(false);
      if (defaultAddress) {
        const address = defaultAddress?.content?.[0]?.fullAddress || ' - ';
        const modal = Modal.open({
          className: style['modal-tips-name'],
          border: false,
          autoCenter: true,
          title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
          cancelText: '关闭',
          okText: '跳转至外部商城',
          children: (
            <>
              <div>
                1. 您目前的默认地址是:{address}，请确认是否正确，如需修改，请前往【地址管理】设置。
              </div>
              <div style={{ marginTop: 5 }}>2. 一旦前往外部商城再修改默认地址将不生效。</div>
              <div style={{ marginTop: 5 }}>
                3. 外部商城仅可使用【公司级】地址，否则将影响收货，如有疑问请联系系统管理员咨询。
              </div>
            </>
          ),
          footer: (okBtn, cancelBtn) => (
            <div>
              {cancelBtn}
              <Button
                onClick={() => {
                  modal.close();
                  openPage(`${HmallConfig.contextPath}/my-mall/address-list`, true);
                }}
              >
                跳转至地址管理
              </Button>
              {okBtn}
            </div>
          ),
          onOk,
        });
      }
    } catch (error) {
      setCheckLoading(false);
    }
  }

  function getLink(item) {
    return (
      <Link
        to={
          +item.blockType === 2
            ? item.quickUrl?.replace('{access_token}', getAccessToken())
            : getLinkUrl(item, { mallType })
        }
        style={{
          color: item.fontColor || '#000',
          fontWeight: +item.boldFlag === 1 ? 600 : 'none',
          fontStyle: +item.slantFlag === 1 ? 'italic' : 'normal',
        }}
      >
        {item.blockTitle}
      </Link>
    );
  }

  return (
    <>
      <li className={styles['other-mall-list']}>
        外部商城
        <Spin spinning={checkLoading}>
          {poList?.map((p) => {
            return p?.renderTip ? (
              <Popover content={p.renderTip} placement="right">
                <div className="other-mall-list-item" onClick={() => checkGetUrl(p)}>
                  <img src={imgMapping[p.ecPlatformCode]} alt={p.ecPlatformName} />
                </div>
              </Popover>
            ) : (
              <div className="other-mall-list-item" onClick={() => checkGetUrl(p)}>
                <img src={imgMapping[p.ecPlatformCode]} alt={p.ecPlatformName} />
              </div>
            );
          })}
        </Spin>
      </li>
      {quickLinkList.map((link) => {
        return <li className="quick-link">{getLink(link)}</li>;
      })}
    </>
  );
}
