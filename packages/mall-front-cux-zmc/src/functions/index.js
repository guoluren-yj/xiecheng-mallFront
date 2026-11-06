function setDemanderDataSetSelectable({ record }) {
  return !['SUBMITTED', 'APPROVEING'].includes(record.get('centralizedStatus'));
}

export { setDemanderDataSetSelectable };
