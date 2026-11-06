/**
 * AddressList - 收货地址管理
 * @date: 2019-10-14
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { Tooltip, Spin } from 'hzero-ui';
import { Message, Icon, Button } from 'choerodon-ui';
import { DataSet, Table, Button as ProButton } from 'choerodon-ui/pro';
import { compose } from 'lodash';
import Pagination from 'components/Pagination';
import Swal from 'components/swal';
import formatterCollections from 'utils/intl/formatterCollections';
import { getStorage, setStorage, getUserConfigInfo, getPrimaryColor } from 'utils/utils';
import Search from 'components/NewMyMallSearch';
import {
  fetchAcAddressService,
  setDefaultAddressService,
  deleteAddress,
} from 'services/addressService';
import intl from 'utils/intl';
import { fetchAddressConfig } from 'services/api';

import { math } from 'choerodon-ui/dataset';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import useUpdateEffect from 'hooks/useUpdateEffect';
import OverflowTip from 'components/OverflowTip';
import { tableDataSet } from './tableDs';
import AddressModal from './AddressModal';
import style from './index.less';

function AdressList(props) {
  const { userId: strorageName, companyId, organizationId } = getUserConfigInfo();
  const [fetchStatus, setFetchStatus] = useState(false); // 请求数据loading
  const [initData, setInitData] = useState({
    addressEnable: [],
    enablePagination: {}, // 分页数据
    addressNoAble: [],
    noAblePagination: {},
    isAddress: false, // 地址是否为空
  });
  const { dispatch, customizeTable } = props;
  const comOrPerson = !!Number(sessionStorage.getItem('comOrPersonInvoiceRule')); // 1为个人，0为公司
  const blockSize = comOrPerson ? 11 : 12;
  const [enableParams, setEnableParams] = useState({}); // 启用查询地址初始参数
  const [visible, setVisible] = useState(false); // 新建、编辑地址模态框是否可见
  const [initAddress, setInitAddress] = useState({}); // 传给地址模态框初始数据
  const [edit, setEdit] = useState(false); // 是否为编辑地址
  const [displayBlock, setDisplayBlock] = useState(getStorage('addressDisplayType'));

  const { first, second, third, fourth } = getStorage(`${strorageName}_region`) || {};
  const { shengId, shengName, sheng } = first || {};
  const { shiId, shiName, shi } = second || {};
  const { xianId, xianName, xian } = third || {};
  const { xiangzhenId, xiangzhenName, xiangzhen } = fourth || {};
  const stockArea = {
    regionIdList: [sheng, shi, xian, xiangzhen] || [],
    regionCodeList: [shengId, shiId, xianId, xiangzhenId] || [],
    regionNameList: [shengName, shiName, xianName, xiangzhenName] || [],
  };

  const tableDs = useRef(
    new DataSet(
      tableDataSet({
        organizationId,
        fetchAddress,
      })
    )
  ).current;

  // 请求数据
  useUpdateEffect(() => {
    const { page, size, ...other } = enableParams;
    fetchAddress({ ...other, page: 0, size: displayBlock ? 11 : 10 });
  }, [displayBlock]);

  // 请求数据
  useUpdateEffect(() => {
    fetchAddress();
  }, [enableParams]);

  useEffect(() => {
    setStorage('addressDisplayType', displayBlock);
  }, [displayBlock]);

  /**
   * 请求地址数据
   * @param {Object} params - 查询地址参数
   * @param {Boolean} loading - 请求时是否开启loading
   */
  const fetchAddress = (params = {}, loading = true) => {
    tableDs.pageSize = displayBlock ? 11 : 10;
    const newParams = {
      page: 0,
      addressType: 'INVOICE',
      ...enableParams,
      ...params,
      size: blockSize,
      companyId,
      enabledFlag: 1,
      time_db: new Date().getTime(),
      validityFlag: 0,
    };
    if (!getUserConfigInfo().companyId) return;
    if (displayBlock) {
      setFetchStatus(loading);
      fetchAcAddressService(newParams)
        .then((res) => {
          const { content = [], ...pagination } = res;
          setInitData({
            ...initData,
            addressEnable: content,
            enablePagination: pagination,
            isAddress: content.length > 0,
          });
        })
        .finally(() => {
          setFetchStatus(false);
          document.querySelector('body').scrollTop = 0;
        });
    } else {
      const { page, size, ...other } = params;
      const param = {
        addressType: 'INVOICE',
        ...enableParams,
        ...other,
        companyId,
        enabledFlag: 1,
        time_db: new Date().getTime(),
        validityFlag: 0,
      };
      tableDs.setQueryParameter('params', param);
      tableDs.query();
    }
  };

  // 渲染地址列表
  const renderAddressList = (data) => {
    const AddressList = data.map((m) => {
      return (
        <div
          className={classNames({
            'address-item': true,
            'address-item-default': m.defaultFlag === 1,
            'address-item-disable': m.enabledFlag === 0,
          })}
          key={m?.addressId}
        >
          <div className="contact-name">
            {m.belongType === 1 && (
              <Tooltip
                placement="bottom"
                title={intl.get(`mallf.addressManage.view.companyAddress`).d('公司地址')}
              >
                <span className="adress-type">
                  <Icon type="domain" size={12} style={{ marginRight: '5px', fontSize: '14px' }} />
                </span>
              </Tooltip>
            )}
            <span className="address-contact-name">{m.contactName}</span>
            {m.defaultFlag === 1 && (
              <span className="adress-default">
                {intl.get(`mallf.addressManage.model.address.setDefaulted`).d('默认')}
              </span>
            )}
            <div className="address-operat">
              <Tooltip
                placement="bottom"
                title={intl.get(`mallf.addressManage.model.address.setDefault`).d('设为默认')}
              >
                {m.defaultFlag === 0 && (
                  <Button
                    icon="predefine"
                    onClick={() => {
                      if (m.validFlag) {
                        handleSetAddress(m, { defaultFlag: 1 });
                      } else {
                        Swal(
                          intl
                            .get('mallf.common.view.addressLibraryUpgradeAddressIsNoValid')
                            .d('地址库已升级，该地址已经不存在')
                        );
                      }
                    }}
                    shape="circle"
                  />
                )}
              </Tooltip>
              {m.belongType === 2 && m.enabledFlag === 1 && comOrPerson && (
                <>
                  <Tooltip
                    placement="bottom"
                    title={intl.get('hzero.common.button.edit').d('编辑')}
                  >
                    <Button
                      icon="mode_edit"
                      onClick={() => openAddressModal(m, true)}
                      shape="circle"
                    />
                  </Tooltip>
                  <Tooltip
                    placement="bottom"
                    title={intl.get(`mallf.addressManage.button.delete`).d('删除')}
                  >
                    <Button icon="delete" onClick={() => handleDeleteAddress(m)} shape="circle" />
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <div className="divider-line" />
          <OverflowTip className={`address-detail ${!m.validFlag ? 'disabled-tips' : ''}`}>
            <Tooltip
              placement="bottom"
              title={
                !m.validFlag
                  ? intl
                      .get('mallf.common.view.addressLibraryUpgradeAddressIsNoValid')
                      .d('地址库已升级，该地址已经不存在')
                  : null
              }
            >
              {m.regionNameList.map((n) => `${n} / `)}
              <span className="address-detail-desc">{m.address}</span>
            </Tooltip>
          </OverflowTip>
          <div className="contact-mobile">
            {`${m.internationalTelCode ? `${m.internationalTelCode} | ` : ''}${handleMobile(
              m.mobile
            )}`}
          </div>
        </div>
      );
    });
    return AddressList;
  };

  // 处理电话号码格式
  function handleMobile(mobile) {
    const mobileArr = mobile.split('');
    mobileArr.splice(3, 4, '****');
    return mobileArr.join('');
  }

  // 取消新建或编辑
  const handleCancel = () => {
    setVisible(false);
    setEdit(false);
  };

  /**
   * 打开地址模态框
   * @param Object address - 初始地址
   * @param {Boolean} isEdit - 是否为编辑
   */
  const openAddressModal = (address = {}, isEdit = false) => {
    const { validFlag } = address;
    if (!validFlag) {
      Object.assign(address, {
        regionIdList: [],
        regionCodeList: [],
        regionNameList: [],
        validFlag: 1,
      });
    }
    fetchAddressConfig(organizationId, companyId).then((result) => {
      dispatch({
        type: 'global/update',
        payload: { addressPermission: result },
      });
    });
    setInitAddress(address || stockArea);
    setVisible(true);
    setEdit(isEdit);
  };

  /**
   * 修改地址
   * @param {Object} record - 当前地址数据
   * @param {Object} params - 所要修改的地址数据字段
   */
  const handleSetAddress = (record, params) => {
    const info = {
      ...record,
      regionId: record.regionIdList[record.regionIdList.length - 1],
      ...params,
      companyId,
      ownedBy: strorageName,
      belongType: 2,
    };
    setDefaultAddressService(info).then(() => {
      fetchAddress();
    });
  };

  /**
   * 删除个人收货地址
   */
  const handleDeleteAddress = (data) => {
    Swal(intl.get('mallf.addressManage.view.confirmDelete').d('确定删除？'), true).then(
      (result) => {
        if (result.value) {
          deleteAddress(data).then((res) => {
            if (res) {
              // 总数-1，除以页码 (all - 1) / blockSize - 1 <= number
              const { number = 0, totalElements = 0 } = enablePagination;
              const page = (totalElements - 1) / blockSize <= number ? number - 1 : number; // 删除完之后，是否减少一页
              Message.success(intl.get('mallf.addressManage.view.delete.success').d('删除成功'));
              fetchAddress({ enabledFlag: 1, page: page < 0 ? 0 : page });
            }
          });
        }
      }
    );
  };

  // 新建成功收货地址后 // 是否默认， 是否编辑
  const handleSuccess = (isDefault = false, isEdit = false) => {
    // 默认则查第一页、编辑则查当前页、否则查最后一页，为当前总数+1除以blockSize
    const { number = 0, totalElements = 0 } = enablePagination;
    const nextPage = math.ceil((totalElements + 1) / blockSize) - 1;
    const page = isDefault ? 0 : isEdit ? number : nextPage;
    fetchAddress({ page });
  };

  const { isAddress, addressEnable, enablePagination } = initData;

  const columns = [
    {
      name: 'contactName',
      with: 130,
      renderer: ({ record }) => {
        const { defaultFlag, contactName } = record.toData();
        return (
          <>
            {contactName}
            {defaultFlag === 1 && (
              <span className="adress-default">
                {intl.get(`mallf.addressManage.model.address.setDefaulted`).d('默认')}
              </span>
            )}
          </>
        );
      },
    },
    {
      name: 'regionNameList',
      width: 250,
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const { regionNameList, validFlag } = record.get(['regionNameList', 'validFlag']);
        return (
          <Tooltip
            placement="bottom"
            title={
              !validFlag
                ? intl
                    .get('mallf.common.view.addressLibraryUpgradeAddressIsNoValid')
                    .d('地址库已升级，该地址已经不存在')
                : null
            }
          >
            <span className={`${!validFlag && 'disabled-tips'}`}>{regionNameList.join('/')}</span>
          </Tooltip>
        );
      },
    },
    {
      name: 'address',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'mobile',
      width: 150,
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const { internationalTelCode, mobile } = record.toData();
        return `${internationalTelCode ? `${internationalTelCode} | ` : ''}${handleMobile(mobile)}`;
      },
    },
    {
      name: 'belongTypeMeaning',
      width: 100,
      tooltip: 'overflow',
    },
    {
      name: 'action',
      width: 180,
      lock: 'right',
      className: 'field-action',
      renderer: ({ record }) => {
        const { defaultFlag, belongType, enabledFlag, validFlag } = record.toData();
        return (
          <>
            {defaultFlag === 0 && (
              <a
                style={{ color: getPrimaryColor(), marginRight: '15px' }}
                onClick={() => {
                  if (validFlag) {
                    handleSetAddress(record.toData(), { defaultFlag: 1 });
                  } else {
                    Swal(
                      intl
                        .get('mallf.common.view.addressLibraryUpgradeAddressIsNoValid')
                        .d('地址库已升级，该地址已经不存在')
                    );
                  }
                }}
              >
                {intl.get(`mallf.addressManage.model.address.setDefault`).d('设为默认')}
              </a>
            )}
            {belongType === 2 && enabledFlag === 1 && comOrPerson && (
              <>
                <a
                  style={{ color: getPrimaryColor(), marginRight: '15px' }}
                  onClick={() => openAddressModal(record.toData(), true)}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <a style={{ color: getPrimaryColor() }} onClick={() => tableDs.delete(record)}>
                  {intl.get('hzero.common.btn.delete').d('删除')}
                </a>
              </>
            )}
          </>
        );
      },
    },
  ];
  const searchProps = {
    onSearch: (params) => {
      setEnableParams(params);
    },
    configs: [
      {
        defaultFlag: true,
        fieldCode: 'fullAddress',
        fieldName: intl.get('mallf.addressManage.view.myMall.acAdress').d('收单地址'),
      },
      {
        fieldCode: 'contactName',
        fieldName: intl.get(`mallf.addressManage.view.contact`).d('联系人'),
      },
      {
        fieldCode: 'mobile',
        fieldName: intl.get(`mallf.common.view.contactPhone`).d('联系电话'),
      },
    ],
  };
  return (
    <React.Fragment>
      <div className={style['address-container']}>
        <div className="address-header">
          <div className="address-search">
            <Search {...searchProps} />
          </div>
          <div style={{ flex: 1, textAlign: 'right' }}>
            {!displayBlock && comOrPerson && (
              <ProButton color="primary" funcType="flat" icon="add" onClick={openAddressModal}>
                {intl.get('mallf.addressManage.model.addAddress').d('新建地址')}
              </ProButton>
            )}
            <ProButton
              color="primary"
              funcType="flat"
              icon={displayBlock ? 'view_list' : 'dashboard'}
              onClick={() => setDisplayBlock(!displayBlock)}
            >
              {displayBlock
                ? intl.get('mallf.addressManage.view.button.switchLineView').d('切换列表视图')
                : intl.get('mallf.addressManage.view.button.switchBlockView').d('切换块状视图')}
            </ProButton>
          </div>
        </div>
        <Spin spinning={fetchStatus}>
          {displayBlock ? (
            !isAddress && !fetchStatus ? (
              <div className="empty-address">
                <h4>{intl.get(`mallf.common.model.noData`).d('暂无数据')}</h4>
                {!!comOrPerson && (
                  <span className="new-address-btn" onClick={openAddressModal}>
                    {intl.get('mallf.addressManage.model.addAddress').d('新建地址')}
                  </span>
                )}
              </div>
            ) : (
              <React.Fragment>
                <div className="address-content">
                  {renderAddressList(addressEnable)}
                  {comOrPerson ? (
                    <div className="create-address" onClick={openAddressModal}>
                      <div style={{ fontSize: '47px', color: '#898989' }}>+</div>
                      <div className="new-address">
                        {intl.get('mallf.addressManage.model.addAddress').d('新建地址')}
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                </div>
                <div className={style['address-list-page']}>
                  <Pagination
                    zeroStart
                    showQuickJumper
                    {...enablePagination}
                    onForward={(params) => {
                      // setEnableParams({
                      //   ...enableParams,
                      // });
                      fetchAddress({ ...params });
                    }}
                  />
                </div>
              </React.Fragment>
            )
          ) : (
            <>
              {customizeTable(
                {
                  code: 'SMALL_ADDRESS_ACQUIRING.FRONT_TABLE',
                },
                <Table border={false} dataSet={tableDs} columns={columns} />
              )}
            </>
          )}
        </Spin>
      </div>
      {visible && (
        <AddressModal
          edit={edit}
          initAddress={(edit && initAddress) || {}}
          visible={visible}
          // stockArea={stockArea}
          onCancel={handleCancel}
          setVisible={setVisible}
          onSuccess={handleSuccess}
        />
      )}
    </React.Fragment>
  );
}

export default compose(
  connect(),
  formatterCollections({ code: ['mallf.addressManage'] }),
  c7nCustomize({
    unitCode: ['SMALL_ADDRESS_ACQUIRING.FRONT_TABLE'],
  })
)(AdressList);
