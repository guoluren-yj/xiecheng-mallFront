import dynamicImport from 'utils/dynamicImport';
import EmptyComponent from 'components/EmptyComponent';
import CustomizeModalLineDs from './components/CustomizeModal/lineDs';
import { headFirstGridAddRow } from './functions/BeforeCompanyOrder/HeadFirstGridAddRow';
import toSubmit from './functions/BeforeCompanyOrder/toSubmit';
import QuickLink from './components/Home/QuickLink';
import AcceptModal from './components/OmsAcceptModal';
import { openListAccept, openDetailAccept } from './functions/accept';

export default {
  'SRM-CICC': {
    tenantName: '中金',
    functions: {
      'BeforeCompanyOrder-fn-headFirstGridAddRow': headFirstGridAddRow,
      'BeforeCompanyOrder-fn-toSubmit': toSubmit,
      'OMSOrder-fn-openAccept': openListAccept,
      'OMSOrderDetail-fn-openAccept': openDetailAccept,
    },
    components: {
      'BeforeCompanyOrder/CustomizeModal/lineDs': CustomizeModalLineDs,
      'BeforeCompanyOrder/ProductList/ProductErrorTip': EmptyComponent,
      'BeforeCompanyOrder/ProductListOperate': dynamicImport(() =>
        import('./components/BeforeCompanyOrder/ProductListOperate')
      ),
      'layout/Header/TopBar/QuickLink': QuickLink,
      'MyMall/OMSOrder/OMS/AcceptModal': AcceptModal,
      'OMSOrderDetail/AcceptModal': AcceptModal,
      'BeforeCompanyOrder/BreadCrumbsRightBtn': dynamicImport(() =>
        import('./components/BeforeCompanyOrder/BreadCrumbsRightBtn')
      ),
    },
    routers: [],
  },
};
