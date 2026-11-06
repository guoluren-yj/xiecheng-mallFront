/* eslint-disable no-param-reassign */
import React, { useEffect, useRef, useState } from 'react';
import uuidv4 from 'uuid/v4';
import formatterCollections from 'utils/intl/formatterCollections';
import { sum, isEmpty } from 'lodash';
import { DataSet, Table, NumberField, Lov, DatePicker, Attachment, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { openComfirmModal } from 'utils/modals';
import { accept } from 'utils/constants';
import { PermissionButton } from 'components/Permission';
import {
  importPurchaseApplyLine,
  importPurchaseApplyLineNew,
} from 'components/Permission/permissionCode';
import CuxFn from '@/cuxTools/cuxFn';
import AddressLov from 'components/AddressLov';
import { precisionEditor } from 'utils/precision';
import { getUserConfigInfo, getOrganizationId, numberRender } from 'utils/utils';
import {
  deleteOMSLines,
  getDoubleUomQuantityService,
  getDoubleUomPriceService,
} from 'services/purchaseRequestService';
import intl from 'utils/intl';
import request from 'utils/request';
import customizes from 'cuxTools/customizes';
import ds from './ds';

function ApplyInfoTable(props) {
  const {
    onDsRef,
    manualRequestId,
    fetchDetail,
    companyId,
    custTable,
    headerDs,
    handleOk,
    doubleUomFlag,
  } = props; // custTable

  const {
    custWebConfig: { manualFileSize = 100 },
    userId,
  } = getUserConfigInfo();

  const DS = useRef(new DataSet(ds({ headerDs, doubleUomFlag })));
  const addressRef = useRef();
  const initDs = CuxFn({
    name: 'OMSAddPurchaseApply-fn-initDs',
    value: {
      ds: DS.current,
    },
  })(() => DS.current)();
  const [visible, setVisible] = useState(false);
  // const [uomPrecision, setUomPrecision] = useState(undefined);
  useEffect(() => {
    onDsRef(initDs);
  }, []);

  const toggleModal = () => {
    setVisible(!visible);
  };

  const getCatagory = (itemId) => {
    request(`/smdm/v1/${getOrganizationId()}/item-categories/lov`, {
      query: {
        lovCode: 'SMDM.TREE_ITEM_CATEGORY_TILED',
        enabledFlag: 1,
        tenantId: getOrganizationId(),
        itemId,
        prTypeId: headerDs.current.get('prTypeId'),
        size: 1000,
      },
    }).then((catagory) => {
      if (catagory?.content?.[0]) {
        const { categoryId, categoryName, categoryCode } = catagory.content[0] || {};
        initDs.current.set('categoryLov', {
          categoryId,
          categoryName,
          categoryCode,
        });
      }
    });
  };

  const getUomPrecision = (uomCode) => {
    request(`/smdm/v1/${getOrganizationId()}/uom/item-org-relation`, {
      query: {
        lovCode: 'SMDM.DUAL_UOM',
        enabledFlag: 1,
        uomCode,
        size: 10,
      },
    }).then((res) => {
      if (res?.content?.[0]) {
        initDs.current.set('uomPrecision', res?.content?.[0]?.uomPrecision);
      }
    });
  };

  // const handleUomPrecision = (lovValue) => {
  //   const { uomPrecision: lovUomPrecision = 0 } = lovValue || {};
  //   setUomPrecision(lovUomPrecision);
  // };

  const handleInvChange = (item) => {
    if (!isEmpty(item)) {
      CuxFn({
        name: 'OMSAddPurchaseApply-fn-handleInvChange',
        value: {
          item,
          initDs,
          companyId,
          userId,
          addressRef,
        },
      })(() => {})();
    }
  };

  // 调用接口得到换算后的数量
  const fetchQuantity = (record) => {
    const { itemId, customUomId, uomId, packageQuantity } = record.toData();
    const params = [
      {
        secondaryQuantity: packageQuantity, // 辅助单位数量
        businessKey: uuidv4(),
        itemId,
        doublePrimaryUomId: uomId, // 基本单位
        secondaryUomId: customUomId, // 辅助单位
      },
    ];
    getDoubleUomQuantityService(params).then((res) => {
      if (res) {
        const { primaryQuantity } = res?.[0] || {};
        record.set('requestQuantity', primaryQuantity);
      }
    });
  };

  // 获取换算后的单价
  const fetchPredictUnitPrice = (record) => {
    const {
      itemId,
      customUomId,
      uomId,
      packageQuantity,
      requestQuantity,
      packageUnitPrice,
    } = record.toData();
    const params = [
      {
        currencyCode: headerDs.current.get('currencyCode'),
        packageUnitPrice, // 辅助单价
        quantity: requestQuantity, // 基本数量
        packageQuantity, // 辅助单位数量
        businessKey: uuidv4(),
        itemId,
        uomId, // 基本单位
        customUomId, // 辅助单位
      },
    ];
    getDoubleUomPriceService(params).then((res) => {
      if (res) {
        const { taxIncludedUnitPrice } = res?.[0] || {};
        record.set('predictUnitPrice', taxIncludedUnitPrice);
      }
    });
  };

  const columns = [
    {
      name: 'entryCode',
      width: 80,
      renderer: ({ record }) => {
        return (record.index || 0) + 1;
      },
    },
    {
      name: 'goodsName',
      width: 80,
      editor: true,
    },
    doubleUomFlag && {
      name: 'customUomLov',
      width: 80,
      editor: true,
    },
    doubleUomFlag && {
      name: 'packageQuantity',
      width: 80,
      editor: (record) =>
        precisionEditor({
          name: 'packageQuantity',
          precision: record.get('secondaryUomPrecision') || 0,
          record,
          onBlur: () => {
            // 有物料并且开启双单位，其他情况和数量绑定
            if (record.get('itemId') && doubleUomFlag) {
              fetchQuantity(record);
            }
          },
        }),
    },
    {
      name: 'uomLov',
      width: 80,
      editor: !doubleUomFlag,
    },
    {
      name: 'requestQuantity',
      width: 80,
      editor: (record) =>
        !doubleUomFlag &&
        precisionEditor({
          name: 'requestQuantity',
          precision: record.get('uomPrecision') || 0,
          record,
        }),
    },
    {
      name: 'itemCodeLov',
      width: 100,
      editor: () => {
        const onChange = (data) => {
          const {
            itemName,
            itemCode,
            itemId,
            uomId,
            uomCode,
            uomName,
            secondaryUomId,
            secondaryUomCode,
            secondaryUomName,
            secondaryUomPrecision,
            uomPrecision,
          } = data || {};
          initDs.current.set('itemNameLov', { itemName, itemCode, itemId });
          initDs.current.set(
            'uomLov',
            uomId
              ? {
                  uomId,
                  uomCode,
                  uomName,
                  uomCodeAndName: `${uomCode}/${uomName}`,
                }
              : null
          );
          if (doubleUomFlag) {
            // 值集返回辅助单位，无辅助单位取基本单位
            initDs.current.set(
              'customUomLov',
              isEmpty(data)
                ? null
                : {
                    uomId: secondaryUomId || uomId,
                    uomCode: secondaryUomCode || uomCode,
                    uomName: secondaryUomName || uomName,
                    uomCodeAndName: `${secondaryUomCode || uomCode}/${secondaryUomName || uomName}`,
                    secondaryUomPrecision: secondaryUomPrecision || uomPrecision,
                  }
            );
          }
          getCatagory(itemId);
          getUomPrecision(uomCode);
        };
        const renderItemLov = CuxFn({
          name: 'OMSAddPurchaseApply-fn-renderItemLov',
          value: { onChange },
        })(() => <Lov onChange={onChange} />);
        return renderItemLov();
      },
    },
    {
      name: 'itemName',
      width: 100,
      editor: true,
    },
    {
      name: 'categoryLov',
      width: 100,
      editor: () => <Lov />,
    },
    {
      name: 'needByDate',
      width: 120,
      editor: () => <DatePicker name="requestDate" />,
    },
    doubleUomFlag && {
      name: 'packageUnitPrice',
      width: 100,
      editor: (record) => {
        return precisionEditor({
          record,
          name: 'packageUnitPrice',
          precision: headerDs?.current?.get('defaultPrecision'),
          onBlur: () => {
            // 开启双单位且有物料，关闭时和预估单价（含税）绑定
            if (doubleUomFlag && record.get('itemId')) {
              fetchPredictUnitPrice(record);
            }
          },
        });
      },
    },
    {
      name: 'predictUnitPrice',
      width: 100,
      editor: (record) =>
        !doubleUomFlag &&
        precisionEditor({
          record,
          name: 'predictUnitPrice',
          precision: headerDs?.current?.get('defaultPrecision'),
        }),
    },
    {
      name: 'predictEntryAmount',
      width: 100,
      editor: () => <NumberField min={0} />,
      renderer: ({ record }) => {
        const predictEntryAmount = record.get('predictEntryAmount');
        const financialPrecision = headerDs?.current?.get('financialPrecision');
        return numberRender(predictEntryAmount, financialPrecision, true);
      },
    },
    {
      name: 'addressLov',
      width: 240,
      editor: () => (
        <Lov
          onClick={() => {
            toggleModal();
            addressRef.current.element.element.click();
          }}
        />
      ),
    },
    {
      name: 'remark',
      width: 100,
      editor: true,
    },
    {
      name: 'invOrganizationLov',
      width: 100,
      editor: () => <Lov onChange={(item) => handleInvChange(item)} />,
    },
    {
      name: 'attachmentUuid',
      width: 120,
      renderer: ({ record }) => {
        if (!record.get('attachmentUuid')) {
          record.init('attachmentUuid', uuidv4());
        }
        const maxSize = `${manualFileSize}M`;
        const attProps = {
          name: 'attachmentUuid',
          sortable: true,
          bucketName: 'private-bucket',
          bucketDirectory: 'mall-front',
          viewMode: 'popup',
          funcType: 'link',
          label: intl.get('mallf.addPurchase.view.line.attachment').d('申请行附件'),
          value: record.get('attachmentUuid'),
          onChange: () => {},
          style: { paddingLeft: 0 },
          accept,
          help: intl
            .get('mallf.common.view.attProps.help', { accept, maxSize })
            .d(`支持${accept.join(',')}格式，且不能大于${maxSize}`),
          fileSize: 1024 * 1024 * manualFileSize,
        };
        return <Attachment {...attProps} />;
      },
    },
    {
      name: 'operate',
      width: 80,
      renderer: ({ record }) => {
        return (
          !headerDs?.current?.get('prNum') && (
            <a
              className="primary-color"
              onClick={() => {
                if (record.toData()._status) {
                  record.status = 'add';
                  initDs.remove(record);
                } else {
                  deleteOMSLines([record.toData()]).then(() => {
                    fetchDetail();
                  });
                }
              }}
            >
              {intl.get('mallf.addPurchase.status.delete').d('删除')}
            </a>
          )
        );
      },
    },
  ].filter((n) => !!n);

  const cuxColumns = CuxFn({ name: 'OMSAddPurchaseApply-fn-cuxColumns', value: { columns } })(
    () => columns
  )();

  const deleteLines = () => {
    const delFetchData = initDs.selected.map((p) => p.toData()).filter((p) => !p._status);
    if (delFetchData.length === 0) {
      initDs.selected.forEach((r) => {
        r.status = 'add';
      });
      initDs.remove(initDs.selected);
    } else {
      deleteOMSLines(delFetchData, manualRequestId).then(() => {
        fetchDetail();
      });
    }
  };

  const DelButton = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button
        color="primary"
        funcType="flat"
        disabled={disabled}
        icon="delete"
        onClick={() => {
          deleteLines();
        }}
      >
        <span className={`${!disabled ? 'primary-color' : ''}`}>
          {intl.get('mallf.addPurchase.status.delete').d('删除')}
        </span>
      </Button>
    );
  });

  const CopyButton = observer(({ dataSet }) => {
    const disabled = dataSet.selected.length === 0;
    return (
      <Button
        color="primary"
        funcType="flat"
        icon="baseline-file_copy"
        disabled={disabled}
        onClick={() => addLine({ copy: true })}
      >
        <span className={`${!disabled ? 'primary-color' : ''}`}>
          {intl.get('mallf.addPurchase.button.copy.lineinfo').d('复制行信息')}
        </span>
      </Button>
    );
  });

  const addLine = ({ copy } = {}) => {
    const { defaultAddress } = getUserConfigInfo();
    const {
      addressId,
      fullAddress,
      regionId,
      belongType,
      mobile,
      phone,
      email,
      contactName,
    } = defaultAddress;
    if (copy) {
      initDs.selected.forEach((r) => {
        const newData = r.toData();
        delete newData.objectVersionNumber;
        delete newData._token;
        delete newData.manualRequestEntryId;
        delete newData.manualRequestId;
        delete newData.predictEntryAmount;
        delete newData.predictEntryAmountMeaning;
        delete newData.lastUpdateDate;
        delete newData.lastUpdatedBy;
        initDs.create({
          ...newData,
          attachmentUuid: uuidv4(),
          entryCode: initDs?.toData().length + 1,
          _status: 'create',
        });
      });
    } else {
      initDs.create({
        attachmentUuid: uuidv4(),
        entryCode: initDs?.toData().length + 1,
        addressId,
        address: fullAddress,
        regionId,
        belongType,
        mobilePhone: mobile,
        email,
        telphone: phone,
        contactName,
        ouId: headerDs.current.get('ouId'),
        _status: 'create',
      });
    }
  };

  const cuxButton = CuxFn({
    name: 'OMSAddPurchaseApply-fn-cuxButton',
    value: {},
  })(() => <></>)();

  const changeList = customizes['MALL.APPLY.OMS.EDIT.APPLYINFO'] || {};

  return (
    <div style={{ marginTop: 30 }}>
      <p className="addPurchase-apply-title">
        <span style={{ fontSize: 14 }}>
          {intl.get(`mallf.purchaseDetail.view.myRequestInfo`).d('申请信息')}
        </span>
        {!headerDs?.current?.get('prNum') && ( // 目前审批拒绝/已提交 手工申请不可操作行，只能编辑
          <div style={{ float: 'right' }}>
            {cuxButton}
            <CopyButton dataSet={initDs} />
            <Button
              color="primary"
              funcType="flat"
              icon="playlist_add"
              onClick={() => {
                CuxFn({
                  name: 'OMSAddPurchaseApply-fn-addLine',
                  value: { addLine, headerDs, initDs },
                })(addLine)();
              }}
            >
              <span className="primary-color">
                {intl.get('mallf.addPurchase.btn.add').d('新增')}
              </span>
            </Button>
            <DelButton dataSet={initDs} />
            <PermissionButton
              color="primary"
              funcType="flat"
              icon="archive"
              onClick={() => handleOk(false, true)}
              permissionList={[importPurchaseApplyLine]}
            >
              {intl.get(`mallf.common.button.import`).d('导入')}
            </PermissionButton>
            <PermissionButton
              color="primary"
              funcType="flat"
              icon="archive"
              permissionList={[importPurchaseApplyLineNew]}
              onClick={() => {
                handleOk(false, true, true);
              }}
            >
              {intl.get(`mallf.common.button.import.new`).d('(新)导入')}
            </PermissionButton>
            <Button
              color="primary"
              funcType="flat"
              type="primary"
              icon="refresh"
              disabled={!manualRequestId}
              onClick={() => {
                if (initDs.toData().some((p) => !p.manualRequestEntryId)) {
                  openComfirmModal({
                    title: intl.get('mallf.common.view.change.warning').d('温馨提示'),
                    children: intl
                      .get('mallf.common.view.change.warningdesc')
                      .d('当前信息尚未保存，继续操作将导致修改数据丢失，请确认是否继续操作。'),
                    onOk() {
                      fetchDetail();
                    },
                    onCancel() {},
                  });
                  return;
                }
                fetchDetail();
              }}
            >
              {intl.get(`hzero.common.button.refresh`).d('刷新')}
            </Button>
          </div>
        )}
      </p>
      <div style={{ marginBottom: 30 }}>
        {custTable(
          {
            code: 'MALL.APPLY.OMS.EDIT.APPLYINFO',
            changeList,
            changeParams: { tableDs: initDs, headerDs },
          },
          <Table
            dataSet={initDs}
            scroll={{ x: sum(columns.map((p) => p.width)) }}
            columns={cuxColumns}
          />
        )}
        <AddressLov
          mode="button"
          className="address-lov"
          clearButton={false}
          onRef={(ref) => {
            addressRef.current = ref;
          }}
          lovPara={{ companyId, userId }}
          onChange={(data) => {
            initDs.current.set('addressLov', {
              addressId: data.addressId,
              address: data.fullAddress,
              regionId: data.regionId,
              mobilePhone: data.mobile,
              email: data.email,
              telphone: data.phone,
              contactName: data.contactName,
              belongType: data.belongType,
            });
            initDs.current.set('internationalTelCode', data.internationalTelCode);
          }}
        />
      </div>
    </div>
  );
}

export default formatterCollections({ code: 'mallf.addPurchase' })(ApplyInfoTable);
