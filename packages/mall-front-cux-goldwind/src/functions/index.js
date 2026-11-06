import React, { useEffect } from 'react';
import { DataSet, Modal, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import qs from 'qs';

import HmallConfig from 'utils/api-config';
import request from 'utils/request';
import intl from 'utils/intl';
import Swal from 'components/swal';
import { getCurrentUser, getDefaultAddress, getUserConfigInfo } from 'utils/utils';
import { openComfirmModal } from 'utils/modals';
import ds from '@/components/ChooseUnit/ds';
import UnitForm from '@/components/ChooseUnit/UnitForm';
import { saveConfigInfo, getAveragePrice } from '@/services';
import { handleHeaderFixLov } from 'mall-front/lib/routes/CartProCopy/ProductAllocation/func';
import style from './index.less';

export function alertEmptyInfoTips({ data, error = {} }) {
  const { loginName, realName, id } = getCurrentUser();
  if (+data?.bizErrorFlag === 1) {
    const formDs = new DataSet(ds());
    openComfirmModal({
      title: intl.get(`mcux.common.view.purchaseOrg.confirm.title`).d('采买组织确认'),
      closable: false,
      cancelButton: false,
      children: (
        <>
          <p style={{ marginBottom: 5 }}>
            {realName}({loginName})，
            {intl.get(`mcux.common.view.purchaseOrg.confirm`).d('您好！请确认您的采买组织：')}
          </p>
          <div style={{ marginTop: 20 }}>
            <UnitForm dataSet={formDs} />
          </div>
        </>
      ),
      okText: intl.get('hzero.common.button.confrim').d('确定'),
      onOk: async () => {
        const flag = await formDs.validate();
        const info = formDs.current?.toData();
        if (flag) {
          await saveConfigInfo({
            userId: id,
            companyId: info.companyId,
            unitId: info.unitId,
          });
          window.location.reload();
        }
        return flag;
      },
    });
  } else if (error.successFlag !== 1) {
    Swal(error?.errorMsg);
  }
}

export function allocationCreate({ dimensionList, data, ds: headerDs }) {
  const { userConfig } = getUserConfigInfo() || {};
  const {
    unitId,
    unitName,
    levelPath,
    companyId,
    companyName,
    ouId,
    ouName,
    invoiceOrgId,
    invoiceOrgName,
    purchaseOrgId,
    purchaseOrgName,
  } = userConfig || {};
  const { fullAddress, addressId } = getDefaultAddress() || {};
  const defaultUnitData = handleHeaderFixLov({
    dimensionList,
    unitData: {
      companyId,
      companyName,
      ouId,
      ouName,
      purOrganizationName: purchaseOrgName,
      purOrganizationId: purchaseOrgId,
      invOrganizationName: invoiceOrgName,
      invOrganizationId: invoiceOrgId,
    },
  });
  // 清除空值，不然影响固定默认值
  Object.keys(defaultUnitData).forEach((key) => {
    if (isEmpty(defaultUnitData[key])) {
      delete defaultUnitData[key];
    }
  });
  // 因为标准的公司带出业务实体，业务实体带出库存组织逻辑，所以这里要把companyIdLov, ouIdLov剔除，不然会级联清空lov
  const { invOrganizationIdLov, purOrganizationIdLov } = defaultUnitData || {};
  headerDs.create(
    {
      ...data,
      levelPath,
      unitId,
      unitName,
      companyId,
      companyName,
      ouId,
      ouName,
      invOrganizationIdLov,
      purOrganizationIdLov,
      fullAddress,
      addressId,
    },
    0
  );
}

export function hasReceiveProduct() {
  return false;
}

// 修改售后
export function afterSaleInitDs(props) {
  const { initDs, state, setState } = props;
  useEffect(() => {
    if (+state?.goodsData?.scuxAfterSaleFlag !== 1) return;
    [
      'returnWareAddress',
      'returnWareFullAddress',
      'customerContactName',
      'customerMobilePhone',
      'customerInternationalTelCode',
    ].forEach((field) => {
      initDs.getField(field).set('disabled', true);
    });
    changeCompanyId();
  }, [state?.goodsData, initDs]);

  function changeCompanyId() {
    const customerAddressLovPara = { ...state.customerAddressLovPara };
    customerAddressLovPara.lovPara.companyId = state?.goodsData?.scuxCompanyId;
    customerAddressLovPara.lovPara.belongType = 1;
    setState({
      customerAddressLovPara,
    });
  }
}

export function renderAddressInfo({ state }) {
  return (
    <>
      {+state.goodsData?.scuxAfterSaleFlag === 1 ? (
        <p style={{ position: 'relative', top: -15, color: 'rgba(0,0,0, 0.45)' }}>
          {intl
            .get(`mcux.common.view.selectCompanyAddress.confirm`)
            .d(' 数字化资产类换货需经过桌面验收，请直接选择公司级地址')}
        </p>
      ) : null}
    </>
  );
}

export function getMobileAveragePrice(props) {
  const { setProductData, productData, tenantId, warehouseId } = props;
  // 有库房时则发送请求
  if (warehouseId) {
    const params = { skuId: productData?.productId, tenantId, warehouseId };
    getAveragePrice(params).then((res) => {
      // 无物料则展示‘-’
      setProductData((data) => ({ ...data, averagePrice: res.itemAveragePrice || '-' }));
    });
  }
}

export function openCompanyAddressTipsModal(props) {
  const { res, preReqSku, preReqOrder } = props;

  const productNameList = res?.cartList?.reduce((pre, cur) => {
    return cur.checkAddressFlag ? [...pre, cur.productName] : pre;
  }, []);

  if (productNameList.length) {
    Modal.open({
      className: style['modal-tips-name'],
      border: false,
      children: (
        <>
          <div>
            商品【
            <span title={`【${productNameList.join('】、【')}】`}>
              {productNameList.join('】、【')}{' '}
            </span>
            {productNameList.length === 1 ? '】' : '】等'}
            的收货地址为公司地址，收件人可能并非您本人，请确保已与收件人确认，若确认无误可继续预生成采购申请
          </div>
        </>
      ),
      autoCenter: true,
      title: (
        <>
          <Icon type="error" style={{ color: '#FF9500' }} />
          {intl.get('mallf.common.view.change.warning').d('温馨提示')}
        </>
      ),
      onOk: async () => {
        const newPreReqSku = preReqSku.map((item) => {
          return { ...item, unCheckAddressFlag: 1 };
        });
        return preReqOrder(newPreReqSku);
      },
    });
  }
}

export function fetchPurchaseAgent() {
  // do nothing
}

export async function submitValid({ params, setSubmitLoading }) {
  setSubmitLoading(true);
  const { organizationId } = getUserConfigInfo();
  const url = `${HmallConfig.apiGateway}/marmot/v1/${organizationId}/marmot-api/khkId00c1yPBESViauEqSuINfjCKJjSsyVibvibB0BT5aI`;
  let res = [];
  try {
    res = await request(url, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  } catch {
    setSubmitLoading(false);
  }
  if (isEmpty(res)) return true;
  // 1是京东选的非京东地址，0是非京东选的京东地址
  const jdAddress = res.reduce(
    (pre, curr) => {
      const { jdFlag, fullInvoiceAddress, invoiceAddressId } = curr.orderInvoiceInfo || {};
      if (jdFlag === '1' && !pre.includes(`${invoiceAddressId}&${fullInvoiceAddress}`)) {
        pre[0].push(`${invoiceAddressId}&${fullInvoiceAddress}`);
      }
      if (jdFlag === '0' && !pre.includes(`${invoiceAddressId}&${fullInvoiceAddress}`)) {
        pre[1].push(`${invoiceAddressId}&${fullInvoiceAddress}`);
      }
      return pre;
    },
    [[], []]
  );
  const [jdYes, jsNo] = jdAddress;
  if (isEmpty(jdYes.concat(jsNo))) {
    return true;
  } else {
    Modal.open({
      className: style['modal-tips-name'],
      border: false,
      closable: true,
      children: (
        <>
          {!isEmpty(jdYes) && (
            <>
              <div>以下京东的预采申请所选为非京东的收单地址：</div>
              {jdYes.map((n) => (
                <p style={{ paddingLeft: 30 }}>{n.split('&')[1]}</p>
              ))}
            </>
          )}
          {!isEmpty(jsNo) && (
            <>
              <div>以下非京东的预采申请所选为京东的收单地址：</div>
              {jsNo.map((n) => (
                <p style={{ paddingLeft: 30 }}>{n.split('&')[1]}</p>
              ))}
            </>
          )}
          {/* <div>是否继续提交？</div> */}
        </>
      ),
      autoCenter: true,
      title: (
        <>
          <Icon type="error" style={{ color: '#FF9500' }} />
          {intl.get('mallf.common.view.change.warning').d('温馨提示')}
        </>
      ),
      footer: null,
    });
    setSubmitLoading(false);
  }
}

export function getColumns() {
  return [
    // 收单地址
    {
      title: intl.get(`mallf.common.view.contact`).d('联系人'),
      align: 'left',
      width: 100,
      dataIndex: 'contactName',
      isQuery: true,
    },
    {
      title: intl.get(`mallf.common.view.tel`).d('电话'),
      align: 'left',
      width: 120,
      dataIndex: 'mobilePlusTelCode',
    },
    {
      title: intl.get(`mallf.common.view.email`).d('邮箱'),
      align: 'left',
      width: 200,
      dataIndex: 'email',
    },
    {
      title: intl.get(`mcux.common.view.jdFlag`).d('是否京东'),
      align: 'left',
      width: 100,
      dataIndex: 'attributeBigint1',
      renderer: ({ value }) =>
        value === 1
          ? intl.get('hzero.common.status.yes').d('是')
          : intl.get('hzero.common.status.no').d('否'),
    },
    {
      title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      align: 'left',
      width: 240,
      isQuery: true,
      dataIndex: 'fullAddress',
    },
  ];
}

export function getInvoiceAddress({ addressInfo, item }) {
  const addressId =
    item.productSource === 'JD'
      ? item?.invoiceAddressId || ''
      : addressInfo?.addressId || (item?.proxySupplierCompanyId ? '' : item.invoiceAddressId);
  const fullAddress =
    item.productSource === 'JD'
      ? item?.fullInvoiceAddress || ''
      : addressInfo?.fullAddress || (item?.proxySupplierCompanyId ? '' : item.fullInvoiceAddress);
  return [addressId, fullAddress];
}

// 仅展示公司下【是否京东-为是】的收单地址
export function getECInvoiceParams({ order }) {
  return qs.stringify({
    customizeUnitCode: 'SMALL_ADDRESS_ACQUIRING.SEARCH_ALL',
    attributeBigint1: order.productSource === 'JD' ? 1 : undefined,
    customizeFilterComparison: 'attributeBigint1:=',
    addressType: 'INVOICE',
    enabledFlag: 1,
    companyId: order?.proxySupplierCompanyId || order?.companyId,
    isFlag: order?.proxySupplierCompanyId ? 1 : 0,
  });
}
