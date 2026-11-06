import CartBudget from './components/Cart/Budget';
import Budget from './components/BeforeCompanyOrder/Budget';
import OMSOrderBugdet from './components/OMSOrderDetail/Budget';
import { updateBudgetFn, handleCartBudgetData, cuxPreCheckCate, showImportBtn } from './functions/Cart';
import ImportBtn from './components/ImportBtn/index.js';
import HeaderTableColumn from './components/Cart/Header/TableColumn.js';
import BodyTableColumn from './components/Cart/Body/TableColumn.js';

export default {
  'SRM-SHANYING': {
    tenantName: '山鹰',
    functions: {
      'Cart-fn-updateBudget': updateBudgetFn,
      'Cart-fn-handleCartBudgetData': {
        function: handleCartBudgetData,
        description: '山鹰【老购物】需要根据业务是判断是否要跳过预算校验', // 需求描述
        number: 'mall-9506', // 需求号
        version: '2024v0330', // 迭代版本
      },
      'Cart-fn-cuxPreCheckCate': {
        function: cuxPreCheckCate,
        description: '山鹰【老购物】需要根据业务是判断是否要跳过预算校验', // 需求描述
        number: 'mall-9506', // 需求号
        version: '2024v0330', // 迭代版本
      },
      'Cart-fn-showImportBtn': {
        function: showImportBtn,
        description: '【山鹰】商城购物车界面显示是否项目类按钮', // 需求描述
        number: 'ced-14076', // 需求号
        version: '2026v0606', // 迭代版本
      },
    },
    components: {
      'BeforeCompanyOrder/Budget': Budget,
      'Cart/Budget': CartBudget,
      'OMSOrderDetail/CheckBudgetInfo': OMSOrderBugdet,
      'routes/Cart/ImportBtn': {
        component: ImportBtn,
        description: '【山鹰】商城购物车界面新增是否项目类按钮', // 需求描述
        number: 'ced-14076', // 需求号
        version: '2026v0606', // 迭代版本
      },
      'Cart/Header/TableColumn': {
        component: HeaderTableColumn,
        description: '采买信息后新增立项信息表格列', // 需求描述
        number: 'ced-14076', // 需求号
        version: '2026v0606', // 迭代版本
      },
      'Cart/Body/TableColumn': {
        component: BodyTableColumn,
        description: '采买信息后新增立项信息表格列', // 需求描述
        number: 'ced-14076', // 需求号
        version: '2026v0606', // 迭代版本
      },
    },
  },
};
