import React, { useRef, useEffect, useMemo } from 'react';
import { Lov, DataSet, Button, Modal } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import { DrawerCom } from 'routes/MyMall/AddressList/AddressModal';

import { getUserConfigInfo, setCookie, getAccessToken } from 'utils/utils';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';

function AddressLov(props) {
  const {
    style,
    mode,
    clearButton = true,
    children,
    className,
    onChange = (e) => e,
    onRef = () => {},
    defaultValue = {},
    labelLayout = 'float',
    label,
    lovCode = 'SMCT.ADDRESS',
    lovPara = {},
    noCache = true,
    needCreateReceiverAddress = true,
    dataSet,
    ...other
  } = props;
  const { userId, unitId, enableCreateReceiverAddress, defaultAddress } = getUserConfigInfo();
  // const [visible, setVisible] = useState(false);
  const lovRef = useRef();

  useEffect(() => {
    onRef(lovRef.current);
  }, [lovRef]);

  const ds = useMemo(() => {
    return new DataSet({
      autoCreate: true,
      data: [defaultValue],
      fields: [
        {
          name: 'addressIdLov',
          label,
          lovCode,
          type: 'object',
          lovPara,
          computedProps: {
            lovPara: ({ record }) => {
              return record?.get('lovPara');
            },
          },
        },
        {
          name: 'addressId',
          bind: 'addressIdLov.addressId',
        },
        {
          name: 'fullAddress',
          bind: 'addressIdLov.fullAddress',
        },
      ],
    });
  }, [defaultValue]);

  useEffect(() => {
    const newLovPara = CuxFn({ name: 'AddressLov-fn-init', value: { lovPara } })(() => lovPara)();
    if (ds.current) {
      ds.current.set('lovPara', newLovPara);
    }
  }, [lovPara]);

  const handleChange = (value) => {
    if (isEmpty(defaultAddress)) {
      setCookie(`${unitId}${userId}AddressInfo`, { [getAccessToken()]: value });
    }
    onChange(value);
    if (noCache) {
      ds.current.set('addressIdLov', null);
    }
  };
  const dsProps = dataSet ? {} : { dataSet: ds };
  function openModal() {
    const modal = Modal.open({
      destroyOnClose: true,
      mask: true,
      drawer: true,
      title: intl.get(`mallf.common.model.addAddress`).d('新建地址'),
      style: { width: 380 },
      children: (
        <DrawerCom
          setDefault
          initAddress={{}}
          onCancel={() => modal.close()}
          onSuccess={() => {
            // 外面有传ds进来 则用外面的
            if (dataSet) {
              dataSet.getField('addressIdLov').getOptions(dataSet.current).query();
            } else {
              ds.getField('addressIdLov').getOptions(ds.current).query();
            }
          }}
          modal={modal}
        />
      ),
    });
  }
  return (
    <>
      <Lov
        {...other}
        noCache
        funcType="flat"
        name="addressIdLov"
        labelLayout={labelLayout}
        mode={mode}
        clearButton={clearButton}
        className={className}
        ref={lovRef}
        style={style}
        onChange={handleChange}
        {...dsProps}
        modalProps={{
          style: { maxWidth: 1080 },
          border: true,
          footer: (okBtn, cancelBtn) => (
            <>
              {okBtn}
              {enableCreateReceiverAddress && needCreateReceiverAddress && (
                <Button onClick={openModal}>
                  {intl.get('mallf.common.model.addAddress').d('新建地址')}
                </Button>
              )}
              {cancelBtn}
            </>
          ),
        }}
      >
        {children}
      </Lov>
      {/* {visible && (
        <AddressModal
          setDefault
          initAddress={{}}
          visible={visible}
          onCancel={handleCancel}
          setVisible={setVisible}
          onSuccess={() => {
            ds.getField('addressIdLov')
              .getOptions(ds.current)
              .query();
          }}
        />
      )} */}
    </>
  );
}

export default AddressLov;
