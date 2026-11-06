import EmptyComponent from 'mall-front/lib/components/EmptyComponent';
import dynamicImport from 'utils/dynamicImport';
import {
  cuxBudgetWarn,
  changeHeaderRemark,
  openCartAddressTipsModal,
  setDisabledLinkFlag,
  getBtns,
} from './functions';

export default {
  // 三生
  'SRM-3SBIO': {
    description: ['批量分配头二开币种字段', '二开三生punchout列表'],
    tenantName: '三生制药',
    functions: {
      // 'newCart-fn-allocationCreate': allocationCreate,
      'newCart-fn-cuxBudgetWarn': cuxBudgetWarn,
      'NewBeforeOrder-fn-CustomizeHeaderInfo-changeHeaderRemark': {
        function: changeHeaderRemark,
        description: '【三生制药】预采申请字段映射', // 需求描述
        version: '2023v0506', // 迭代版本
        number: 'mall-5214',
      },
      'CartFooter-fn-beforeOrder': {
        function: openCartAddressTipsModal,
        description: '购物车下一步添加地址提示',
        number: 'cdp-130296',
      },
      'OMSOrder-fn-disableLinkFlag': {
        function: setDisabledLinkFlag,
        description: '【三生七期】百普塞斯Punchout对接-转商城目录化', // 需求描述
        number: 'cdp-149555',
        version: '2026v0207', // 迭代版本
      },
      'OMSOrderDetail-fn-disabledLinkFlag': {
        function: setDisabledLinkFlag,
        description: '【三生七期】百普塞斯Punchout对接-转商城目录化', // 需求描述
        number: 'cdp-149555',
        version: '2026v0207', // 迭代版本
      },
      'OrderSubOrderHeader-fn-getBtns': {
        function: getBtns,
        description: '【三生七期】百普塞斯Punchout对接-转商城目录化', // 需求描述
        number: 'cdp-149555',
        version: '2026v0207', // 迭代版本
      },
    },
    components: {
      'layout/Header/MenuBar/QuickLink': {
        component: dynamicImport(() => import('./components/QuickLink/index')),
        description: '【三生制药】punchout入口个性化-二开一个punchout列表 二开增加新的电商', // 需求描述
        number: 'srm-118893 cdp-130296', // 需求号
        version: '2022v0409 2025v1101', // 迭代版本
      },
      'layout/Header/TopBar/PunchOut': {
        component: EmptyComponent,
        description: '【三生制药】punchout入口个性化-隐藏导航条的punchout列表', // 需求描述
        number: 'srm-118893', // 需求号
        version: '2022v0409', // 迭代版本
      },
      'MyMall/OMSOrder/common/LogisticsModal': {
        component: dynamicImport(() => import('./components/LogisticsModalOtherInfo')),
        description: '【三生】物流增加预计到货日期', // 需求描述
        number: 'srm-暂无需求号', // 需求号
        version: '2022v0514', // 迭代版本
      },
      'CartProCopy/renderPunchoutAdress/punchoutAdress': {
        component: dynamicImport(() => import('./components/RenderPunchoutAdress')),
        description: '【三生制药】电商根据配置表可修改地址', // 需求描述
        number: 'cdp-130296', // 需求号
        version: '2025v1101', // 迭代版本
      },
      'CartProCopy/renderPunchoutAdress': {
        component: EmptyComponent,
        description: '【三生制药】punchout地址-隐藏购物车修改地址', // 需求描述
        number: 'mall-10346', // 需求号
        version: '2024v0615', // 迭代版本
      },
    },
    routers: [],
  },
};
