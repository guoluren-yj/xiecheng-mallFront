import React, { useState, useRef, useEffect } from 'react';
import { Lov, DataSet, Button } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import AddressModal from '@/routes/MyMall/AddressList/AddressModal';

import { getUserConfigInfo, setCookie, getAccessToken } from 'utils/utils';
import intl from 'utils/intl';

function AddressLov(props) {
  const {
    style,
    mode,
    clearButton = true,
    children,
    className,
    onChange = () => {},
    onRef = () => {},
    defaultValue = {},
    labelLayout = 'float',
    label,
    lovCode = 'SMCT.ADDRESS',
    lovPara = {},
  } = props;
  const { userId, unitId, defaultAddress } = getUserConfigInfo();
  const [visible, setVisible] = useState(false);
  const lovRef = useRef();

  useEffect(() => {
    onRef(lovRef.current);
  }, [lovRef]);

  const ds = useRef(
    new DataSet({
      autoCreate: true,
      data: [defaultValue],
      fields: [
        {
          name: 'addressIdLov',
          label,
          lovCode,
          type: 'object',
          lovPara,
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
      events: {
        update: ({ value }) => {
          handleChange(value);
        },
      },
    })
  ).current;

  const handleChange = (value) => {
    if (isEmpty(defaultAddress)) {
      setCookie(`${unitId}${userId}AddressInfo`, { [getAccessToken()]: value });
    }
    onChange(value);
  };

  function handleCancel() {
    setVisible(false);
  }

  function openModal() {
    setVisible(true);
  }

  return (
    <>
      <Lov
        noCache
        dataSet={ds}
        name="addressIdLov"
        labelLayout={labelLayout}
        mode={mode}
        clearButton={clearButton}
        viewMode="drawer"
        className={className}
        ref={lovRef}
        style={style}
        modalProps={{
          style: { maxWidth: 1080 },
          footer: (okBtn, cancelBtn) => (
            <>
              {okBtn}
              <Button onClick={openModal}>
                {intl.get('mallf.common.model.addAddress').d('新建地址')}
              </Button>
              {cancelBtn}
            </>
          ),
        }}
      >
        {children}
      </Lov>
      {visible && (
        <AddressModal
          setDefault
          initAddress={{}}
          visible={visible}
          onCancel={handleCancel}
          setVisible={setVisible}
          onSuccess={() => {
            ds.getField('addressIdLov').getOptions(ds.current).query();
          }}
        />
      )}
    </>
  );
}

export default AddressLov;
