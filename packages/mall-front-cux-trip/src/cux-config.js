import dynamicImport from 'utils/dynamicImport';
import { getInitUnitData } from './functions';

export default {
  'SRM-TRIP': {
    functions: {
      'ChooseUnit-fn-initData': {
        function: getInitUnitData,
        description: '【携程】市场/法务/财务分配规则', // 需求描述
        number: 'cdp-137908', // 需求号
        version: '2025v1206', // 迭代版本
      },
    },
    components: {
      'NewBeforeOrder/CustomizeHeaderInfo/DefaultForm': {
        component: dynamicImport(() => import('./components/CustomizeHeaderInfo/DefaultForm')),
        description: '【携程】电商需求提报', // 需求描述
        number: 'cdp-130676', // 需求号
        version: 'v1101', // 迭代版本
      },
    },
    routers: [],
  },
};
