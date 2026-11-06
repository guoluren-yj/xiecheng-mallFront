import EmptyComponent from 'components/EmptyComponent';
import dynamicImport from 'utils/dynamicImport';
import PurchaseHeaderDetail from './components/BeforeCompanyOrder/PurchaseHeaderDetail';
import CataInfo from './components/BeforeCompanyOrder/CataInfo';
import SubmitBtn from './components/BeforeCompanyOrder/SubmitBtn';
// import ProductList from './components/BeforeCompanyOrder/ProductList';
import HeaderInfo from './components/OMSOrderDetail/HeaderInfo';
import CheckBudgetInfo from './components/OMSOrderDetail/CheckBudgetInfo';
import MyMallRouter from './components/MyMall/router';
import { changeOrderData } from './functions/beforeCompanyOrder.js';
import NeedDate from './components/BeforeCompanyOrder/NeedDate';
import CustomInfo from './components/ProductDetail/productInfo/CustomInfo';
import NeededDateHeader from './components/OMSOrderDetail/NeededDate/Header';
import NeededDateContent from './components/OMSOrderDetail/NeededDate/Content';

export default {
  'SRM-WATSONS': {
    tenantName: '屈臣氏',
    functions: {
      'BeforeCompanyOrder-fn-changeOrderData': changeOrderData,
    },
    components: {
      'BeforeCompanyOrder/PurchaseHeaderDetail': PurchaseHeaderDetail,
      'BeforeCompanyOrder/CataInfo': CataInfo,
      'BeforeCompanyOrder/ProductListOperate': dynamicImport(() =>
        import('./components/BeforeCompanyOrder/ProductListOperate')
      ),
      'BeforeCompanyOrder/SubmitBtn': SubmitBtn,
      // 'BeforeCompanyOrder/ProductList': ProductList,
      'OMSOrderDetail/HeaderInfo': HeaderInfo,
      'OMSOrderDetail/CheckBudgetInfo': CheckBudgetInfo,
      'OMSOrderDetail/NeededDate/Header': NeededDateHeader,
      'OMSOrderDetail/NeededDate/Content': NeededDateContent,
      'ProductDetail/productInfo/AddressInfo': EmptyComponent,
      'MyMall/router': MyMallRouter,
      'BeforeCompanyOrder/ProductList/NeedDate': NeedDate,
      'ProductDetail/productInfo/CustomInfo': CustomInfo,
      'BeforeCompanyOrder/BreadCrumbsRightBtn': {
        component: dynamicImport(() =>
          import('./components/BeforeCompanyOrder/BreadCrumbsRightBtn')
        ),
        description: '在预采申请页二开新增按钮【关联合同】', // 需求描述
        version: '2023v0610', // 迭代版本
        number: 'mall-5205',
      },
    },
    routers: [
      {
        path: '/cart',
        component: () => import('./routes/Cart'),
        description: '购物车',
        remark: '整个购物车二开',
      },
    ],
  },
};
