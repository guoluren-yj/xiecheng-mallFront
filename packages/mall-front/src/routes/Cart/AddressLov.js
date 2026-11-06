import React, { useMemo } from 'react';
import NewAddressLov from 'components/AddressLov';
import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import cuxComponent from 'cuxTools/cuxComponent';

function AddressLov(props) {
  const { setFieldsValue, address, addressId } = props;
  const { companyId, userId } = getUserConfigInfo();
  const defaultValue = useMemo(() => ({ fullAddress: address, addressId }), [address, addressId]);
  return (
    <>
      <NewAddressLov
        noCache={false}
        label={intl.get(`mallf.cart.model.receive.info`).d('收货信息')}
        style={{ width: '100%' }}
        defaultValue={defaultValue}
        lovPara={{ companyId, userId }}
        onChange={(n) => setFieldsValue({ addressId: n?.addressId })}
      />
    </>
  );
}

export default cuxComponent({ path: 'Cart/AddressLov' })(AddressLov);
