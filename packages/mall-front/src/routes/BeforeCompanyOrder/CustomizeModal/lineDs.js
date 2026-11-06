import cuxComponent from 'cuxTools/cuxComponent';

function lineDs() {
  return {
    fields: [],
  };
}

export default cuxComponent({ path: 'BeforeCompanyOrder/CustomizeModal/lineDs', isFn: true })(
  lineDs
);
