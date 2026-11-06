import { getOrganizationId } from 'utils/utils';
import HmallConfig from 'utils/api-config';
import uuidv4 from 'uuid/v4';
import request from 'mall-front/lib/utils/request';

export function handleInvChange({ item, initDs, companyId, userId, addressRef }) {
  const { organizationId } = item || {};
  addressRef.current.dataSet.current.set('lovPara', {
    companyId,
    userId,
    invOrganizationId: initDs?.current?.get('invOrganizationId'),
  });
  request(
    `${
      HmallConfig.apiGateway
    }/smal/v1/${getOrganizationId()}/addresss/list/choose?addressType=RECEIVER&enabledFlag=1&companyId=${companyId}&userId=${userId}&invOrganizationId=${organizationId}`
  ).then((res) => {
    if (res) {
      const data = res.content?.[0] || {};
      initDs.current.set({
        addressLov: {
          addressId: data.addressId,
          address: data.fullAddress,
          regionId: data.regionId,
          mobilePhone: data.mobile,
          email: data.email,
          telphone: data.phone,
          contactName: data.contactName,
          belongType: data.belongType,
        },
      });
    }
  });
}

export function addLine({ initDs, headerDs }) {
  initDs.create({
    attachmentUuid: uuidv4(),
    entryCode: initDs?.toData().length + 1,
    ouId: headerDs.current.get('ouId'),
    _status: 'create',
  });
}
