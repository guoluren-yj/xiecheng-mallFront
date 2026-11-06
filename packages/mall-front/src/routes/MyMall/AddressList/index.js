/**
 * AddressList - 收货地址管理
 * @date: 2019-10-14
 * @author: GM <ming.gao03@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import classNames from 'classnames';
import { connect } from 'dva';
import { compose } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { Tooltip, Spin } from 'hzero-ui';
import { Message, Icon, Button } from 'choerodon-ui';
import { DataSet, Table, Button as ProButton, Dropdown, Menu } from 'choerodon-ui/pro';
import SearchBar from 'components/SearchBar';
import { observer } from 'mobx-react-lite';
import Icons from 'components/Icons';
import OverflowTip from 'components/OverflowTip';
import { useModal } from 'components/Import';

import Pagination from 'components/Pagination';
import Swal from 'components/swal';
import {
  getStorage,
  setStorage,
  getUserConfigInfo,
  getPrimaryColor,
  filterNullValueObject,
} from 'utils/utils';
import {
  fetchNewAddressService,
  submitAddressService,
  deleteAddress,
  batchDeleteAddressApi,
} from 'services/addressService';
import intl from 'utils/intl';
import { fetchAddressConfig } from 'services/api';

import { math } from 'choerodon-ui/dataset';
import c7nCustomize from 'srm-front-scuz/lib/c7nCustomize';
import CuxWrapper from 'cuxTools/CuxWrapper';
import { tableDataSet, removeCacheAddress } from './tableDs';
import AddressModal from './AddressModal';
import style from './index.less';
import HeaderOther from './HeaderOther';
import CuxFn from '@/cuxTools/cuxFn';

const customizeUnitCode = 'SMALL.ADDRESS_MANAGE.FRONT_ADDRESS_SEARCH';

function AdressList(props) {
  const { userId, companyId, organizationId, addressPermission } = getUserConfigInfo();
  const [fetchStatus, setFetchStatus] = useState(false); // 请求数据loading
  const comOrPerson = !!Number(sessionStorage.getItem('comOrPersonRule')); // 1为个人，0为公司
  const blockSize = 12;
  const [initData, setInitData] = useState({
    addressEnable: [],
    enablePagination: {}, // 分页数据
    addressNoAble: [],
    noAblePagination: {},
    isAddress: false, // 地址是否为空
  });
  const { dispatch, customizeTable } = props;
  // const [enableParams, setEnableParams] = useState({
  //   page: 0,
  //   size: blockSize,
  // }); // 启用查询地址初始参数
  const [visible, setVisible] = useState(false); // 新建、编辑地址模态框是否可见
  const [initAddress, setInitAddress] = useState({}); // 传给地址模态框初始数据
  const [edit, setEdit] = useState(false); // 是否为编辑地址
  const [displayBlock, setDisplayBlock] = useState(getStorage('addressDisplayType'));

  const { first, second, third, fourth } = getStorage(`${userId}_region`) || {};
  const { shengId, shengName, sheng } = first || {};
  const { shiId, shiName, shi } = second || {};
  const { xianId, xianName, xian } = third || {};
  const { xiangzhenId, xiangzhenName, xiangzhen } = fourth || {};
  const stockArea = {
    regionIdList: [sheng, shi, xian, xiangzhen] || [],
    regionCodeList: [shengId, shiId, xianId, xiangzhenId] || [],
    regionNameList: [shengName, shiName, xianName, xiangzhenName] || [],
  };

  // 联系人不可编辑
  const linkDisabled = addressPermission === 'ADDRESS';
  // 地区不可编辑
  const regionDisabled = addressPermission === 'CONTACT';

  const tableDs = useRef(
    new DataSet(
      tableDataSet({
        organizationId,
        fetchAddress,
        comOrPerson,
      })
    )
  ).current;
  const searchBarRef = useRef();
  // 请求数据
  useEffect(() => {
    // const { page, size, ...other } = enableParams;
    fetchAddress({ page: 0, size: displayBlock ? 12 : 10 });
  }, [displayBlock]);

  useEffect(() => {
    setStorage('addressDisplayType', displayBlock);
  }, [displayBlock]);

  const clearSelected = () => {
    tableDs.clearCachedSelected();
    tableDs.unSelectAll();
  };

  /**
   * 请求地址数据
   * @param {Object} params - 查询地址参数
   * @param {Boolean} loading - 请求时是否开启loading
   */
  const fetchAddress = (params = {}, loading = true) => {
    tableDs.pageSize = displayBlock ? 12 : 10;
    const queryParams = {
      ...(filterNullValueObject(searchBarRef.current?.getQueryParameter()) || {}),
      customizeUnitCode,
    };
    const commonParams = {
      enabledFlag: 1,
      companyId,
      addressType: 'RECEIVER',
      validityFlag: 0,
    };
    const newCommonParams = CuxFn({
      name: 'AddressList-fn-fetch-commonPara',
      value: { lovPara: commonParams },
    })(() => commonParams)();

    if (!getUserConfigInfo().companyId) return;
    if (displayBlock) {
      setFetchStatus(loading);
      const newParams = {
        size: 12,
        ...newCommonParams,
        ...queryParams,
        ...params,
        time_db: new Date().getTime(),
      };
      fetchNewAddressService(newParams)
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
      const newParams = {
        ...newCommonParams,
        ...queryParams,
        ...other,
      };
      clearSelected();
      tableDs.setQueryParameter('params', newParams);
      tableDs.query();
    }
  };

  // 渲染地址列表
  const renderAddressList = (data) => {
    // 代表存在个人默认地址
    // const isUserDefault = data.some(s => s.defaultFlag === 1 && s.ownedBy !== -1);

    // const getComTextDefault = m => m.defaultFlag === 1 && m.ownedBy === -1;

    // const getComStyleDefault = m => isUserDefault && m.defaultFlag === 1 && m.ownedBy === -1;
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
                title={
                  m.defaultFlag === 1
                    ? intl.get(`mallf.addressManage.model.address.setNoDefault`).d('取消默认')
                    : intl.get(`mallf.addressManage.model.address.setDefault`).d('设为默认')
                }
              >
                {m.defaultFlag === 0 ? (
                  <Button
                    icon="predefine"
                    onClick={() => {
                      if (m.validFlag || m.defaultFlag === 1) {
                        handleSetAddress(m, { defaultFlag: m.defaultFlag === 1 ? 0 : 1 });
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
                ) : (
                  <Button
                    // icon="predefine"
                    onClick={() => handleSetAddress(m, { defaultFlag: 0 })}
                    shape="circle"
                  >
                    <Icons style={{ fontSize: 14 }} type="remove_predefine" />
                  </Button>
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
              <span className="address-detail-desc">&nbsp;/&nbsp;{m.zip}</span>
            </Tooltip>
          </OverflowTip>
          <div className="contact-mobile">
            <span>
              {`${m.internationalTelCode ? `${m.internationalTelCode} | ` : ''}${handleMobile(
                m.mobile
              )}`}
            </span>
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
    // 地址失效时 清空地址
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
      method: 'POST',
      time_db: new Date().getTime(),
    };
    submitAddressService(info).then(() => {
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
              removeCacheAddress(data);
              // 总数-1，除以页码 (all - 1) / blockSize - 1 <= number
              const { number = 0, totalElements = 0 } = enablePagination;
              const page = (totalElements - 1) / blockSize <= number ? number - 1 : number; // 删除完之后，是否减少一页
              Message.success(intl.get('mallf.addressManage.view.delete.success').d('删除成功'));
              fetchAddress({ page: page < 0 ? 0 : page });
            }
          });
        }
      }
    );
  };

  // 批量删除地址
  const batchDeleteAddress = () => {
    Swal(intl.get('mallf.addressManage.view.confirmDelete').d('确定删除？'), true).then(
      (result) => {
        if (result.value) {
          const selectedData = (tableDs?.selected || []).map((record) => record.toJSONData());
          batchDeleteAddressApi(selectedData).then((res) => {
            if (res) {
              selectedData.forEach((data) => {
                removeCacheAddress(data);
              });
              Message.success(intl.get('mallf.addressManage.view.delete.success').d('删除成功'));
              fetchAddress();
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
      width: 130,
      tooltip: 'overflow',
    },
    {
      name: 'mobile',
      width: 120,
      tooltip: 'overflow',
      renderer: ({ record }) => {
        const { internationalTelCode, mobile } = record.toData();
        return `${internationalTelCode ? `${internationalTelCode} | ` : ''}${handleMobile(mobile)}`;
      },
    },
    {
      name: 'phone',
      width: 100,
    },
    {
      name: 'belongTypeMeaning',
      width: 60,
      tooltip: 'overflow',
    },
    {
      name: 'action',
      className: 'field-action',
      lock: 'right',
      width: 180,
      renderer: ({ record }) => {
        const { defaultFlag, belongType, enabledFlag, validFlag } = record.toData();
        return (
          <>
            <a
              style={{ color: getPrimaryColor(), marginRight: '15px' }}
              onClick={() => {
                if (validFlag || defaultFlag === 1) {
                  handleSetAddress(record.toData(), { defaultFlag: defaultFlag === 1 ? 0 : 1 });
                } else {
                  Swal(
                    intl
                      .get('mallf.common.view.addressLibraryUpgradeAddressIsNoValid')
                      .d('地址库已升级，该地址已经不存在')
                  );
                }
              }}
            >
              {defaultFlag === 1
                ? intl.get(`mallf.addressManage.model.address.setNoDefault`).d('取消默认')
                : intl.get(`mallf.addressManage.model.address.setDefault`).d('设为默认')}
            </a>
            {belongType === 2 && enabledFlag === 1 && comOrPerson && (
              <>
                <a
                  style={{ color: getPrimaryColor(), marginRight: '15px' }}
                  onClick={() => openAddressModal(record.toData(), true)}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                <a
                  style={{ color: getPrimaryColor() }}
                  onClick={() => {
                    tableDs.delete(record);
                  }}
                >
                  {intl.get('hzero.common.btn.delete').d('删除')}
                </a>
              </>
            )}
          </>
        );
      },
    },
  ];

  // const prefix = (
  //   <Icon
  //     onClick={() => {
  //       fetchAddress({ fullAddress: currentFullAddress });
  //     }}
  //     style={{ marginLeft: 10, cursor: 'pointer' }}
  //     type="search"
  //   />
  // );

  const DeleteBtn = observer(({ ds = {} }) => {
    // 选择公司级地址不可删除
    const isHaveCompany = ds.selected.some(
      (record) => record.get('belongType') === 1 && record.get('enabledFlag') === 1
    );
    const disabled = ds.selected.length === 0 || isHaveCompany;
    return (
      <ProButton
        funcType="flat"
        onClick={batchDeleteAddress}
        disabled={disabled}
        className="address-search-del"
      >
        {intl.get('mallf.common.button.delete').d('删除')}
      </ProButton>
    );
  });

  const handleImport = () => {
    const modal = useModal().openModal({
      businessObjectTemplateCode: regionDisabled
        ? 'SMAL_PERSONAL_UNREGION_ADDRESS_IMPORT'
        : 'SMAL_PERSONAL_ADDRESS_IMPORT',
      refreshButton: true,
      prefixPatch: '/smal',
      successCallBack: () => {
        fetchAddress();
        modal.close();
      },
      args: {
        companyId,
      },
    });
  };

  const menu = (
    <Menu selectable={false}>
      <Menu.Item onClick={() => openAddressModal()}>
        {intl.get('hzero.common.button.handleadd').d('手工新建')}
      </Menu.Item>
      {/* 联系人不可编辑不允许导入 */}
      {!linkDisabled && (
        <Menu.Item onClick={() => handleImport()}>
          {intl.get('hzero.common.button.import').d('导入')}
        </Menu.Item>
      )}
    </Menu>
  );

  const operateBtns = useMemo(() => {
    return [
      {
        hidden: !comOrPerson,
        // icon: 'add',
        // onClick: openAddressModal,
        // title: intl.get('mallf.addressManage.model.addAddress').d('新建地址'),
        render: () => (
          <Dropdown overlay={menu} placement="bottomLeft">
            <ProButton icon="add" color="primary" funcType="flat">
              {intl.get('mallf.addressManage.model.addAddress').d('新建地址')}
              <Icon type="expand_more" style={{ fontSize: 14, marginLeft: 4, marginBottom: 2 }} />
            </ProButton>
          </Dropdown>
        ),
      },
      {
        hidden: !!displayBlock || !comOrPerson,
        render: () => <DeleteBtn ds={tableDs} />,
      },
      {
        icon: displayBlock ? 'view_list' : 'dashboard',
        onClick: () => setDisplayBlock(!displayBlock),
        title: displayBlock
          ? intl.get('mallf.addressManage.view.button.switchLineView').d('切换列表视图')
          : intl.get('mallf.addressManage.view.button.switchBlockView').d('切换块状视图'),
      },
    ];
  }, [displayBlock]);

  const headerOther = () => {
    return (
      <CuxWrapper
        path="MyMall/AddressList/BtnsWrapper"
        value={{
          successCallBack: () => fetchAddress(),
          tableDs,
          displayBlock,
          searchBarRef,
          customizeUnitCode,
          operateBtns,
        }}
      >
        <HeaderOther operateBtns={operateBtns} />
      </CuxWrapper>
    );
  };
  return (
    <React.Fragment>
      <div className={style['address-container']}>
        <div className="address-header">
          <div className="address-search">
            <SearchBar
              searchBarRef={(ref) => {
                searchBarRef.current = ref;
              }}
              handleSearch={({ params }) => {
                fetchAddress({ page: 0, ...params });
              }}
              searchCode={customizeUnitCode}
              headerOther={headerOther()}
            />
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
                  {/* {comOrPerson ? (
                    <div className="create-address" onClick={openAddressModal}>
                      <div style={{ fontSize: '47px', color: '#898989' }}>+</div>
                      <div className="new-address">
                        {intl.get('mallf.addressManage.model.addAddress').d('新建地址')}
                      </div>
                    </div>
                  ) : (
                    ''
                  )} */}
                </div>
                <div className={style['address-list-page']}>
                  <Pagination
                    zeroStart
                    showQuickJumper
                    {...enablePagination}
                    pageSizeOptions={['10', '20', '30', '100']}
                    onForward={(params) => {
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
                  code: 'SMALL.ADDRESS_MANAGE.FRONT_ADDRESS_TABLE',
                },
                <Table
                  border={false}
                  dataSet={tableDs}
                  columns={columns}
                  pagination={{ pageSizeOptions: ['10', '20', '30', '100'] }}
                />
              )}
            </>
          )}
        </Spin>
      </div>
      <AddressModal
        edit={edit}
        initAddress={(edit && initAddress) || {}}
        visible={visible}
        // stockArea={stockArea}
        onCancel={handleCancel}
        setVisible={setVisible}
        onSuccess={handleSuccess}
      />
    </React.Fragment>
  );
}

export default compose(
  connect(),
  formatterCollections({ code: ['mallf.addressManage'] }),
  c7nCustomize({
    unitCode: ['SMALL.ADDRESS_MANAGE.FRONT_ADDRESS_TABLE'],
  })
)(AdressList);
