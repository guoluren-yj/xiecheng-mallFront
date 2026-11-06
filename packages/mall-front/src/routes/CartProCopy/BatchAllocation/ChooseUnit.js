import React from 'react';
import { Lov } from 'choerodon-ui/pro';

export default function ChooseUnit(props) {
  const { dimension, record, headerDimension } = props;
  const { editFlag } = dimension;

  const handleChangeUnit = (value) => {
    const selectUnit = value || {};
    const { unitId, unitName, levelPath, addressId, fullAddress } = selectUnit;
    const changeDimensionLov = ['company', 'ou', 'invOrganization', 'purOrganization'];
    const changeDimensionData = {};
    // 不确定lov以后的value跟name是否会更换
    function handleLovValue({ dimensionCode, valueField, displayField }) {
      const field = changeDimensionLov.find((d) => dimensionCode.includes(d));
      return selectUnit[`${field}Id`]
        ? {
            ...selectUnit,
            [valueField]: selectUnit[`${field}Id`],
            [displayField]: selectUnit[`${field}Name`],
          }
        : null;
    }
    changeDimensionLov.forEach((item) => {
      const header = headerDimension.find((n) => n.dimension.dimensionCode === `${item}Id`) || {
        dimensionComponent: {},
      };
      const { dimensionComponent } = header;
      const { lovView } = dimensionComponent;
      const { displayField, valueField } = lovView || {};
      changeDimensionData[`${item}IdLov`] = handleLovValue({
        dimensionCode: `${item}Id`,
        valueField,
        displayField,
      });
      changeDimensionData[valueField] = changeDimensionData[`${item}IdLov`]?.[valueField] || null;
      changeDimensionData[displayField] =
        changeDimensionData[`${item}IdLov`]?.[displayField] || null;
    });
    record.set({
      ...changeDimensionData,
      unitId,
      unitName,
      levelPath,
      // addressIdLov: addressId
      //   ? {
      //       addressId,
      //       fullAddress,
      //     }
      //   : null,
      addressId,
      fullAddress,
    });
  };

  return (
    <Lov
      disabled={!editFlag}
      name="unitIdLov"
      style={{ width: '100%' }}
      help={dimension.annotation}
      showHelp="tooltip"
      onChange={handleChangeUnit}
    />
  );
}
