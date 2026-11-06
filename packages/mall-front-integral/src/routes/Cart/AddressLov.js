import React from 'react';
import NewLov from 'components/NewLov';
import * as HmallConfig from 'utils/api-config';
import { getUserConfigInfo } from 'utils/utils';
import intl from 'utils/intl';

export default function AddressLov(props) {
  const {
    purOrganizationId,
    belongTypeList,
    setFieldsValue,
    address,
    isBtn,
    setSelectCity,
    setSelectTakeCity,
    contactFlag,
  } = props;
  const { companyId, userId } = getUserConfigInfo();
  return (
    <>
      <NewLov
        title={intl.get('mallf.common.view.address.query').d('地址查询')}
        key={purOrganizationId}
        columnsParams={{ belongTypeList }}
        columns="addressColumns"
        textValue={address}
        lovOptions={{ displayField: 'fullAddress', valueFeild: 'addressId' }}
        onOk={
          (setSelectCity || setSelectTakeCity) && isBtn
            ? contactFlag
              ? (_, data) => {
                  const {
                    address: detailAdd,
                    regionNameList,
                    regionIdInfoList,
                    contactName,
                    mobile,
                    internationalTelCode,
                  } = data;
                  // console.log(data);
                  const newCities = regionNameList.join('/');
                  // console.log(newCities);
                  setSelectCity(newCities);
                  setFieldsValue({
                    returnWareFullAddress: detailAdd,
                    returnWareAddress: regionIdInfoList,
                    customerContactName: contactName,
                    customerMobilePhone: mobile,
                    internationalTelCode,
                  });
                }
              : (_, data) => {
                  const {
                    address: detailAdd,
                    regionNameList,
                    regionIdInfoList,
                    contactName,
                    mobile,
                    internationalTelCode,
                  } = data;
                  const newCities = regionNameList.join('/');
                  // console.log(newCities);
                  setSelectTakeCity(newCities);
                  setFieldsValue({
                    pickWareFullAddress: detailAdd,
                    pickWareAddress: regionIdInfoList,
                    pickContactName: contactName,
                    pickMobilePhone: mobile,
                    pickInternationalTelCode: internationalTelCode,
                  });
                }
            : (_, { addressId: id }) => {
                setFieldsValue({
                  addressId: id,
                });
              }
        }
        queryUrl={`${HmallConfig.apiGateway}/${HmallConfig.serviceName}/v1/{organizationId}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}`}
      />
    </>
  );
}
