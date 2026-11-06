import React, { useMemo, useEffect, useRef } from 'react';
import {
  Modal,
  Table,
  DataSet,
  Button,
  TextField,
  Icon,
  Tooltip,
  Message,
  Attachment,
} from 'choerodon-ui/pro';
import { getUserConfigInfo, calcValidatePack } from 'utils/utils';
import intl from 'utils/intl';
import { toJS } from 'mobx';
import { observer } from 'mobx-react-lite';
import AddressLov from 'components/AddressLov';
import { math } from 'choerodon-ui/dataset';
import { rejectCentralizeService, updateCentralizeAddress } from 'services/newCartService';
import SwalAlert from 'components/swal';
import { openRemarkModal } from 'utils/modals';
import { PermissionButton } from 'components/Permission';
import { ordererBatchAddress } from 'components/Permission/permissionCode';
import PermissionButtonProvider from 'components/Permission/PermissionProvider';
// eslint-disable-next-line import/no-cycle
import { unitPriceRenderer, totalAmountRenderer } from './renderer';
import { BasketDetailDs } from './BasketDataSet';
import styles from './renderer.less';
import CuxFn from '@/cuxTools/cuxFn';

const ObserverBtn = observer(({ dataSet, icon, onClick, buttonText, disabled: oldDisabled }) => {
  const disabled = dataSet?.selected?.length === 0 || oldDisabled;
  return (
    <Button color="primary" funcType="flat" disabled={disabled} icon={icon} onClick={onClick}>
      <span className={`${!disabled ? 'primary-color' : ''}`}>{buttonText}</span>
    </Button>
  );
});

const BatchEditAddress = observer((props) => {
  const { dataSet, icon, buttonText, onClick } = props || {};
  // 选中公司不一致
  const multCompany =
    [...new Set(dataSet?.selected?.map((s) => s.get('HEADER_companyId_value')))].length > 1;
  const disabledTips = multCompany
    ? intl.get('mallf.cart.view.address.punchoutDidabled').d('公司不一致，不能批量修改地址')
    : '';
  const disabled = dataSet?.selected?.length === 0 || multCompany;
  const { userId } = getUserConfigInfo();
  const lovPara = {
    userId,
    companyId: dataSet?.selected?.[0]?.get('HEADER_companyId_value'),
  };
  const addressRef = useRef();
  return (
    <Tooltip title={disabledTips}>
      <AddressLov
        mode="button"
        className={styles['basket-address-lov']}
        onRef={(ref) => {
          addressRef.current = ref;
        }}
        clearButton={false}
        disabled={disabled}
        lovPara={lovPara}
        onChange={onClick}
        needCreateReceiverAddress={false}
      />
      <PermissionButtonProvider>
        <PermissionButton
          permissionList={[ordererBatchAddress]}
          color="primary"
          funcType="flat"
          icon={icon}
          disabled={disabled}
          onClick={() => {
            addressRef.current.element.element.click();
          }}
        >
          {buttonText}
        </PermissionButton>
      </PermissionButtonProvider>
    </Tooltip>
  );
});

function BasketDetail(props) {
  const { modal, dataSet, data } = props || {};
  const ds = useMemo(() => new DataSet(BasketDetailDs(modal, data)), [data]);
  const isQueryFlag = useRef(false);
  const setQueryFlag = () => {
    isQueryFlag.current = true;
  };

  // 获取字段
  const detailCustColumns = dataSet?.cartColumns
    ?.filter((c) => c.code !== 'budgetBalance')
    .map((column) => {
      const commonObj = {
        width: 110,
        align: 'left',
        header: `${column.name}`,
        name: `${column.type}_${column.code}`,
        className: styles['basket-table-column'],
      };
      switch (column.code) {
        case 'quantity':
          return {
            ...commonObj,
            tooltip: 'none',
            align: 'right',
            name: 'totalQuantity',
            renderer: null,
            editor: true,
          };
        case 'taxIncludedAmount':
          return {
            ...commonObj,
            renderer: totalAmountRenderer,
          };
        case 'taxIncludedPrice':
          return {
            ...commonObj,
            renderer: unitPriceRenderer,
          };
        default:
          return {
            ...commonObj,
            renderer: ({ text, record }) => {
              const attachmentFlag =
                record
                  .get('currentDimValue')
                  ?.cartDimValueList?.slice()
                  ?.find((p) => p.dimensionCode === column.code && p.dimensionType === column.type)
                  ?.componentType === 'UPLOAD';
              return !attachmentFlag ? (
                text
              ) : (
                <Attachment
                  name={`${column.type}_${column.code}`}
                  sortable
                  bucketName="private-bucket"
                  bucketDirectory="mall-front"
                  viewMode="popup"
                  funcType="link"
                  label={`${column.name}`}
                  value={record.get(`${column.type}_${column.code}`)}
                  style={{ paddingLeft: 0 }}
                  readOnly
                />
              );
            },
          };
      }
    });

  const columns = [
    {
      name: 'centralizedUserName',
      width: 120,
      header: intl.get('mallf.common.cart.demander').d('提需人'),
    },
    {
      name: 'errorMessage',
      width: 120,
      className: styles['basket-table-column-error'],
      renderer: ({ record }) => record.get('errorMessage') || '-',
    },
    {
      name: 'operation',
      lock: 'right',
      width: 80,
      renderer: ({ record }) => (
        <Button funcType="link" color="primary" onClick={() => handleReturn([record])}>
          {intl.get(`mallf.common.button.return`).d('驳回')}
        </Button>
      ),
    },
    ...detailCustColumns,
  ];
  const handleBatchReturn = () => {
    handleReturn(ds.selected);
  };
  const handleReturn = (records = []) => {
    const centralizedUserNames = [...new Set(records.map((s) => s.get('centralizedUserName')))];
    const demander = centralizedUserNames.join('】【');
    const { productName } = data;
    openRemarkModal({
      title: intl.get(`mallf.common.view.tips`).d('温馨提示'),
      label: intl.get('mallf.cart.view.returnReason').d('驳回原因'),
      maxLength: 200,
      message: intl
        .get('mallf.cart.model.confirm.returnCentralizeSku', {
          demander,
          productName,
        })
        .d(`您确定要驳回提需人【${demander}】的商品【${productName}】吗？`),
      onOk: async (remark) => {
        ds.status = 'loading';
        const params = records.map((m) => ({ relationId: m.get('centralizedRelationId'), remark }));
        try {
          setQueryFlag();
          const res = await rejectCentralizeService(params);
          if (res) {
            Message.success(intl.get('mallf.common.view.set.success').d('操作成功'));
            ds.query();
          }
        } catch {
          ds.status = 'ready';
        }
      },
    });
  };
  const handleEditAddr = (item) => {
    ds.selected.forEach((record) => {
      record.set('HEADER_addressId_value', item?.addressId);
      record.set('HEADER_addressId', item?.fullAddress);
    });
  };
  const batchReturnBtn = (
    <ObserverBtn
      icon="cancel"
      buttonText={intl.get('mallf.cart.button.batchReturn').d('批量驳回')}
      onClick={() => {
        handleBatchReturn();
      }}
      dataSet={ds}
    />
  );
  const batchEditAddrBtn = CuxFn({
    name: 'cart-pro-basket-fn-batchEditAddrBtn',
  })(() => (
    <BatchEditAddress
      icon="mode_edit"
      buttonText={intl.get(`mallf.cart.model.update.batchAddress`).d('批量修改地址')}
      onClick={handleEditAddr}
      dataSet={ds}
    />
  ))();

  const handleOk = async () => {
    const flag = await ds.validate();
    if (!flag) {
      return false;
    }
    ds.status = 'loading';
    try {
      setQueryFlag();
      const params = {
        cartList:
          ds.toJSONData()?.map((m) => ({
            ...m,
            addressId: m.HEADER_addressId_value,
          })) || [],
      };
      if (!params.cartList.length) {
        modal.close();
        return false;
      }
      const res = await updateCentralizeAddress(params);
      if (res) {
        const errMsgData = res.filter((f) => f.noErrorFlag === 0);
        if (errMsgData.length < res.length) {
          const successMsg =
            errMsgData.length < 1
              ? intl.get(`mallf.cart.view.success.update`).d('修改成功')
              : intl.get(`mallf.cart.view.success.partUpdate`).d('部分修改成功');
          Message.success(successMsg);
        }
        modal.close();
      }
    } catch {
      ds.status = 'ready';
    }
  };
  const handleSearch = (value) => {
    ds.setQueryParameter('centralizedUserName', value);
    ds.query();
  };

  ds.updateCartQuantity = async ({ value, oldValue, name, record, minLimit, maxLimit }) => {
    const cartInfo = record.toJSONData();
    const { uomPrecision, minPackageQuantity } = cartInfo;
    const min = minLimit;
    let newValue = value;

    // 不是数值，设置回原值
    if (math.isNaN(newValue)) {
      record.set(name, oldValue);
      return;
    }
    // 小于最小值
    if (math.lt(newValue, min)) {
      newValue = min;
    }
    // 大于最大值
    if (math.gt(newValue, maxLimit)) {
      newValue = maxLimit;
    }

    // 购买量大于最小采购量时才判断最小包装量
    // 是否满足最小包装量
    const isPackage = math.mod(newValue, minPackageQuantity || 1) === 0;
    if (
      calcValidatePack(uomPrecision, minPackageQuantity) &&
      math.gte(value, minLimit) &&
      math.lte(value, maxLimit) &&
      !isPackage
    ) {
      SwalAlert(
        intl
          .get('mallf.common.view.minPackageQuantity.warning', {
            value: minPackageQuantity,
          })
          .d(`购买数量只能是最小包装量${minPackageQuantity}的整数倍`)
      );
      record.set(name, oldValue);
      return;
    }
    record.set(name, newValue);
  };
  ds.getDimValue = (record, name) => {
    return toJS(
      record
        .get('currentDimValue')
        ?.cartDimValueList.slice()
        ?.find((p) => p.dimensionCode === name)
    );
  };
  useEffect(() => {
    modal.update({
      onOk: handleOk,
      afterClose: () => {
        if (isQueryFlag.current) {
          dataSet.queryCartData();
        }
      },
    });
    ['productId', 'centralizedTemplateId'].forEach((name) => {
      ds.setQueryParameter(name, data[name]);
    });
    ds.query();
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <TextField
          clearButton
          style={{ width: 250 }}
          onChange={(value) => handleSearch(value)}
          placeholder={intl.get(`mallf.cart.view.basketDetail.placeholder`).d('请输入提需人查询')}
          prefix={<Icon type="search" />}
        />
        <span>
          {batchReturnBtn}
          {batchEditAddrBtn}
        </span>
      </div>
      <Table
        dataSet={ds}
        columns={columns}
        style={{ maxHeight: 'calc(100vh - 246px)' }}
        customizedCode="CARTBASKETDETAIL"
      />
    </div>
  );
}

export function openBasketDetailModal(props) {
  const modal = Modal.open({
    title: intl.get(`mallf.cart.view.button.orderDetail`).d('拼单明细'),
    destroyOnClose: true,
    mask: true,
    drawer: true,
    closable: true,
    style: { width: 1100 },
    okText: intl.get('mallf.common.button.saveAndClose').d('保存并关闭'),
    children: <BasketDetail modal={modal} {...props} />,
  });
}
