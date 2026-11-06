import intl from 'utils/intl';

export const addressDs = () => {
  return {
    autoCreate: false,
    forceValidate: true,
    paging: false,
    fields: [
      {
        name: 'addressId',
        required: true,
        textField: 'fullAddress',
        valueField: 'addressId',
        defaultValidationMessages: {
          valueMissingNoLabel: intl
            .get('mallf.common.view.siglwarning.noValidAddress')
            .d('暂无可用的收货地址，请到「地址管理」维护。'),
        },
      },
    ],
  };
};
