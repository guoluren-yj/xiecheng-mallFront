const ds = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'manageType',
      type: 'string',
      lookupCode: 'SMPC.SAME_SKU_TYPE',
      dynamicProps({ record }) {
        const { manageStatus } = record.data;
        return {
          disabled:
            manageStatus === 'SUBMIT' ||
            manageStatus === 'PROCESSED' ||
            manageStatus === 'APPROVED' ||
            manageStatus === 'REJECTED',
        };
      },
    },
    {
      name: 'remark',
      dynamicProps({ record }) {
        const { manageStatus } = record.data;
        return {
          disabled:
            manageStatus === 'SUBMIT' ||
            manageStatus === 'PROCESSED' ||
            manageStatus === 'APPROVED' ||
            manageStatus === 'REJECTED',
        };
      },
    },
  ],
});
export default ds;
