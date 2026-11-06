import { addPurchaseApply } from 'components/Permission/permissionCode';

export default [
  {
    path: '/pub',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/PreviewHome" */ '../routes/PreviewHome'),
    title: '预览首页',
  },
  {
    path: '/',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/Home" */ '../routes/Home'),
    title: '首页',
  },
  {
    path: '/sigl',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/Home" */ '../routes/Home'),
    title: '会员购首页',
  },
  {
    path: '/bulletin-boards',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/BulletinBoards" */ '../routes/BulletinBoards'),
    title: '公告',
  },
  {
    path: '/product-list',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/ProductList" */ '../routes/ProductList'),
    title: '产品列表',
  },
  {
    path: '/refresh',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/Refresh" */ '../routes/Refresh'),
    title: '刷新',
  },
  {
    path: '/my-mall',
    component: () => import(/* webpackChunkName: "pages/MyMall" */ '../routes/MyMall'),
    title: '我的商城',
  },
  {
    path: '/cart',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/Cart" */ '../routes/Cart'),
    title: '购物车',
  },
  // {
  //   path: '/open-cart',
  //   exact: true,
  //   component: () => import(/* webpackChunkName: "pages/Cart" */ '../routes/CartProCopy'),
  //   title: '购物车',
  // },
  {
    path: '/req-open-cart',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/ReqOpenCart" */ '../routes/ReqOpenCart'),
    title: '预采购申请',
  },
  {
    path: '/req-open-cart/result',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/ReqOpenCart" */ '../routes/OpenCartResult'),
    title: '结果页',
  },
  {
    path: '/before-company-order',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/BeforeCompanyOrder" */ '../routes/BeforeCompanyOrder'),
    title: '预采购申请',
  },
  {
    path: '/before-order',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/NewBeforeOrder" */ '../routes/NewBeforeOrder'),
    title: '预采购申请',
    promptKey: 'mallf.companyOrder,mallf.applyRes,mallf.cart',
  },
  {
    path: '/apply-result',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/ApplyResult" */ '../routes/ApplyResult'),
    title: '提交预采购申请成功',
  },
  {
    path: '/sale-detail',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/SaleDetail" */ '../routes/SaleDetail'),
    title: '售后信息',
  },
  {
    path: '/oms-sale-detail',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/OMSSaleDetail" */ '../routes/OMSSaleDetail'),
    title: 'oms售后信息',
  },
  {
    path: '/order-detail',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/OrderDetail" */ '../routes/OrderDetail'),
    title: '订单详情',
  },
  {
    path: '/oms-order-detail',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/OMSOrderDetail" */ '../routes/OMSOrderDetail'),
    title: '订单详情',
  },
  {
    path: '/sale-status',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/SaleProgress" */ '../routes/SaleProgress'),
    title: '售后状态',
  },
  {
    path: '/oms-sale-status',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/OMSSaleProgress" */ '../routes/OMSSaleProgress'),
    title: '售后状态',
  },
  {
    path: '/sale-applicat',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/SaleAfterApplicat" */ '../routes/SaleAfterApplicat'),
    title: '售后申请',
  },
  {
    path: '/oms-sale-applicat',
    exact: true,
    component: () =>
      import(
        /* webpackChunkName: "pages/OMSSaleAfterApplicat" */ '../routes/OMSSaleAfterApplication'
      ),
    title: '售后申请',
  },
  {
    path: '/product-detail',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/ProductDetail" */ '../routes/NewProductDetail'),
    title: '商品详情',
  },
  {
    path: '/cata-product-detail',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/ProductDetail" */ '../routes/NewProductDetail'),
    title: '目录化商品详情',
  },
  {
    path: '/new-product-detail',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/NewProductDetail" */ '../routes/NewProductDetail'),
    title: '新商品详情',
  },
  {
    path: '/order-comment',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/AddOrderComment" */ '../routes/AddOrderComment'),
    title: '发表评论',
  },
  {
    path: '/pay-online',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/PayOnline" */ '../routes/PayOnline'),
    title: '在线支付',
  },
  {
    path: '/pay-result.html',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/PayResult" */ '../routes/PayResult'),
    title: '支付结果',
  },
  {
    path: '/exception',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/Exception" */ '../routes/Exception'),
    title: '异常操作',
  },
  {
    path: '/products-compare',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/ProductsCompare" */ '../routes/ProductsCompare'),
    title: '商品对比',
  },
  {
    path: '/add-purchase',
    exact: true,
    permissionList: [addPurchaseApply],
    component: () =>
      import(/* webpackChunkName: "pages/AddPurchaseApply" */ '../routes/AddPurchaseApply'),
    title: '新建采购申请提报',
  },
  {
    path: '/mall/data-import/:code',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/CommonImport" */ '../routes/CommonImport'),
    title: '商城导入',
  },
  {
    path: '/price-compare',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/PriceCompareList" */ '../routes/PriceCompareList'),
    title: '比价单',
  },
  {
    path: '/payment-result',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/PaymentResult" */ '../routes/PaymentResult'),
    title: '支付结果',
  },
  {
    path: '/pub/product-detail',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/OnlyReadProDetail" */ '../routes/OnlyReadProDetail'),
    title: '查看商品详情',
  },
  {
    path: '/pub/sale-status-read',
    exact: true,
    component: () =>
      import(/* webpackChunkName: "pages/SaleProgressRead" */ '../routes/SaleProgressRead'),
    title: '售后状态',
  },
  {
    path: '/pub/forbidden',
    exact: true,
    component: () => import(/* webpackChunkName: "pages/Forbidden" */ '../routes/Forbidden'),
    title: '无权限',
  },
  {
    path: '/zone-supplier-list',
    exact: true,
    component: () => import('../routes/ZoneSupplierList'),
    title: '甄选专区',
  },
  {
    path: '/zone-product-list',
    exact: true,
    component: () => import('../routes/ZoneProductList'),
    title: '甄选专区',
  },
  {
    path: '/zone-product-detail',
    exact: true,
    component: () => import('../routes/ZoneProductDetailList'),
    title: '甄选专区',
  },
];
