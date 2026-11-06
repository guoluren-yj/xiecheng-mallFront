import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

export function ds({fields}) {
  return {
    autoCreate: true,
    forceValidate: true,
    fields
  } as DataSetProps;
}