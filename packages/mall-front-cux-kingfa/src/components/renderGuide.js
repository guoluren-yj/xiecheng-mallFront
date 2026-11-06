import React from 'react';
import Guide from 'mall-front/lib/components/Guide';
import 'driver.js/dist/driver.min.css';
import injectGuide from 'mall-front/lib/components/Guide/injectGuideList';

const config = () => {
  return [
    {
      enable: true,
      type: 'strong',
      priority: 0,
      version: 1,
      title: 'ERP库存量查询功能',
      delay: 1000,
      optionalSteps: true,
      steps: [
        {
          selector: '.cart-pro-item-code',
          title: 'ERP库存量查询功能',
          htmlText: '点击商品物料编码，查看该物料在ERP系统中的现有库存量',
          placement: 'bottom-left',
        },
      ],
    },
  ];
};

export default function RenderGuide() {
  injectGuide('/cart', config);

  return <Guide />;
}
