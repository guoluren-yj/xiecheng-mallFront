import AcceptModal from './components/OmsAcceptModal';
import { openListAccept, openDetailAccept } from './functions';

export default {
  'SRM-CIMCENRIC': {
    tenantName: '中集',
    functions: {
      'OMSOrder-fn-openAccept': openListAccept,
      'OMSOrderDetail-fn-openAccept': openDetailAccept,
    },
    components: {
      'MyMall/OMSOrder/OMS/AcceptModal': AcceptModal,
      'OMSOrderDetail/AcceptModal': AcceptModal,
      // 'OMSOrderDetail/AcceptRecord': AcceptRecord,
    },
    routers: [],
  },
};
