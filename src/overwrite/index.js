import { overWriteConfig } from 'hzero-boot';

import AmpInit, { processRequestError } from 'utils/newApm';

AmpInit();

overWriteConfig({
  // 可以设置 dvaApp.router 的根路由
  dvaRootRouter: () => require('../router').default,
  // 可以替换 global 配置
  globalModal: () => require('../models/global').default,
  dealGlobalError: (err) => {
    console.log(err);
  },
  responseIntercept(props) {
    processRequestError(props);
  },
});
