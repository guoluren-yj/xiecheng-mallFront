function handleAttributeVarchar1(props) {
  const { name, record, optionsDs } = props || {};
  if (name === 'attributeVarchar1Lov') {
    // 存在则覆盖
    const {
      managerName,
      managerPhone,
      mapprovinceName,
      mapcityName,
      mapareaName,
      regionId,
      whAddress,
    } = record.get('attributeVarchar1Lov') || {};
    record.set('userIdLov', null);
    record.set('contactName', managerName);
    record.set('mobile', managerPhone);
    record.set('address', whAddress);
    if (regionId && mapprovinceName && mapcityName && mapareaName) {
      optionsDs.reset();
      record.set('region', [
        { regionName: '中国', countryFlag: true },
        { regionName: mapprovinceName },
        { regionName: mapcityName },
        { regionName: mapareaName, regionId },
      ]);
      record.set('regionId', regionId);
    } else {
      optionsDs.reset();
      record.set('region', []);
      record.set('regionId', null);
    }
  }
}

export { handleAttributeVarchar1 };
