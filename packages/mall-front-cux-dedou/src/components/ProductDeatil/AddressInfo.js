import React, { useState } from 'react';

import { fetchAddressConfig } from 'services/api';
import AddressModal from 'routes/MyMall/AddressList/AddressModal';
import HmallConfig from 'utils/api-config';
import useRequest from 'mall-front/lib/hooks/useRequest';

import { getPrimaryColor, getUserConfigInfo, getCookie } from 'utils/utils';
import intl from 'utils/intl';
import NewLov from 'components/NewLov';

export default function AddressInfo(props) {
  const {
    currentAddress,
    ChangeAddressModalProps,
    dispatch,
    fetchDefaultAddress,
    // openTable,
  } = props;
  const { chooseAddress } = ChangeAddressModalProps;
  const { userId, organizationId, companyId } = getUserConfigInfo();

  const { resData: belongTypeList } = useRequest({
    url: `${HmallConfig.apiGateway}/hpfm/v1/${organizationId}/lovs/value`,
    query: { lovCode: 'SMAL.ADDRESS_BELONG_TYPE_ONLYCOMPANY' },
  });

  const comOrPerson = !!Number(sessionStorage.getItem('comOrPersonRule')); // 1为个人，0为公司

  const [visible, setVisible] = useState(false);

  function handleCancel() {
    setVisible(false);
  }

  function openModal() {
    fetchAddressConfig(organizationId, companyId).then((result) => {
      dispatch({
        type: 'global/update',
        payload: { addressPermission: result },
      });
    });
    setVisible(true);
  }

  const DEDOUColumns = [
    {
      title: intl.get('mallf.common.view.sourceFrom').d('来源'),
      align: 'left',
      width: 120,
      dataIndex: 'addressFrom',
    },
    {
      title: intl.get(`mallf.common.view.baiyingOrderId`).d('百应工单'),
      align: 'left',
      width: 120,
      dataIndex: 'orderId',
    },
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
      dataIndex: 'mobile',
      isQuery: true,
    },
    {
      title: intl.get(`mallf.common.model.addressDetail`).d('详细地址'),
      align: 'left',
      width: 240,
      isQuery: true,
      dataIndex: 'fullAddress',
    },
  ];
  const { orderId = null } = getCookie('SRM-DEDOU') || {};

  return (
    <div className="product-config-link">
      <div className="product-attr">
        <div className="p-label " style={{ verticalAlign: 'top' }}>
          {intl.get(`mallf.common.view.receive.info`).d('收货信息')}
        </div>
        <div className="p-content">
          <span
            title={
              currentAddress.addressName ||
              (comOrPerson
                ? intl.get('mallf.common.model.add.receive.info').d('请添加收货信息')
                : intl.get('mallf.productDetail.model.noAddress.warning').d('请维护公司地址'))
            }
            style={{ marginRight: '20px', width: '200px' }}
            className="mainAddress"
          >
            {currentAddress.addressName ||
              (comOrPerson
                ? intl.get('mallf.common.model.add.receive.info').d('请添加收货信息')
                : intl.get('mallf.productDetail.model.noAddress.warning').d('请维护公司地址'))}
          </span>
        </div>
        <div className="set" style={{ display: 'flex' }}>
          <NewLov
            columnsParams={{ belongTypeList }}
            columns={DEDOUColumns}
            lovOptions={{ displayField: 'fullAddress', valueFeild: 'addressId' }}
            onOk={(_, data) => {
              chooseAddress(data, data);
            }}
            queryUrl={`${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/${organizationId}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}&orderId=${orderId}`}
          >
            <span
              style={{
                marginRight: '4px',
                color: getPrimaryColor(),
                cursor: 'pointer',
                verticalAlign: 'top',
              }}
            >
              {intl.get('mallf.common.model.update').d('修改')}
            </span>
          </NewLov>
          {comOrPerson && (
            <div className="model-control">
              <span className="lov-link" style={{ color: getPrimaryColor() }} onClick={openModal}>
                {intl.get('mallf.common.model.addAddress').d('新建地址')}
              </span>
              {visible && (
                <AddressModal
                  setDefault
                  initAddress={{}}
                  visible={visible}
                  onCancel={handleCancel}
                  setVisible={setVisible}
                  onSuccess={fetchDefaultAddress}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
