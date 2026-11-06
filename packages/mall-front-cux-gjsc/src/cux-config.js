import InvoiceModal from './components/BeforeCompanyOrder/InvoiceModal';
import { initInnerInvoiceInfo, confirmSwal } from './functions/BeforeCompanyOrder';

export default {
  'SRM-GJSC': {
    tenantName: '广建',
    functions: {
      'BeforeCompanyOrder-fn-initInnerInvoiceInfo': initInnerInvoiceInfo,
      'BeforeCompanyOrder-fn-confirmSwal': confirmSwal,
    },
    components: {
      'BeforeCompanyOrder/InvoiceModal': InvoiceModal,
    },
    routers: [],
  },
};
