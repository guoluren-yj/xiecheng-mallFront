import React from 'react';
import { getUserConfigInfo } from 'utils/utils';
import { excelExport } from 'utils/request';
import { QuickLinkCom } from 'mall-front/lib/layout/Header/MenuBar/QuickLink';
import './index.less';

export default function CuxQuickLink({ ecList }) {
  const productExcel = () => {
    const {
      companyId,
      userId,
      levelPath,
      unitId,
      tenantId,
      regionId,
      language,
      channel,
      addressInfo,
    } = getUserConfigInfo();
    const bodyParams = {
      userId,
      unitId,
      lang: language,
      unitLevelPath: levelPath,
      companyId,
      tenantId,
      keywordStrategy: 'COMPLAX',
      regionId,
      ...addressInfo,
      onlyInStock: 1,
      offset: 0,
      channel,
    };
    excelExport({
      requestUrl: `/marmot/v1/${tenantId}/marmot-api/a4pFCv8TXlMbqI3DTUlXgtjbpvKsdFicVLfWWPPxRFkQ`,
      method: 'POST',
      bodyParams,
    });
  };
  return (
    <>
      <QuickLinkCom ecList={ecList} />
      {window.location.pathname === '/' && (
        <div className="product-excel">
          <div onClick={() => productExcel()}>全部商品信息导出</div>
        </div>
      )}
    </>
  );
}
