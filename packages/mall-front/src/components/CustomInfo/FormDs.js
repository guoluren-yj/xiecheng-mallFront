const dataSet = () => ({
  fields: [],
  events: {
    update({ record, name, value }) {
      const reoordData = record.toData();
      const { componentType, detailId } =
        // eslint-disable-next-line eqeqeq
        reoordData.customItemList?.find((n) => n.detailId == name) || {};
      // 通过值集value值找到name值
      if (componentType === 'SELECT') {
        record.set(`${detailId}Name`, record.getField(name).getText(value));
      }
    },
  },
});

export default dataSet;
