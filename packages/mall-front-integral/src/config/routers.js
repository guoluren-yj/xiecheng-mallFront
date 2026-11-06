export default [
  {
    path: '/sigl',
    exact: true,
    component: () => import('mall-front/lib/routes/Home'),
  },
  {
    path: '/sigl/product-list',
    exact: true,
    component: () => import('../routes/ProductList'),
  },
  {
    path: '/sigl/product-detail',
    exact: true,
    component: () => import('../routes/ProductDetail'),
    promptKey: 'mallf.productDetail,mallf.priceCompare',
  },
  {
    path: '/sigl/cart',
    exact: true,
    component: () => import('../routes/Cart'),
    promptKey: 'mallf.cart',
  },
  {
    path: '/sigl/before-order',
    exact: true,
    component: () => import('../routes/BeforeOrder'),
  },
  {
    path: '/sigl/my-mall',
    component: () => import('../routes/MyMall'),
  },
  {
    path: '/sigl/apply-result',
    component: () => import('../routes/ApplyResult'),
  },
  {
    path: '/sigl/payment-result',
    component: () => import('../routes/PaymentResult'),
  },
  {
    path: '/sigl/oms-order-detail',
    component: () => import('../routes/OMSOrderDetail'),
  },
  {
    path: '/sigl/oms-sale-detail',
    component: () => import('mall-front/lib/routes/OMSSaleDetail'),
  },
  {
    path: '/sigl/oms-sale-status',
    component: () => import('mall-front/lib/routes/OMSSaleProgress'),
  },
  {
    path: '/sigl/oms-sale-applicat',
    component: () => import('mall-front/lib/routes/OMSSaleAfterApplication'),
  },
  {
    path: '/sigl/bulletin-boards',
    component: () => import('mall-front/lib/routes/BulletinBoards'),
    exact: true,
    title: '公告',
  },
];
