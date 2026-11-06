import React from 'react';

import { getAttachmentUrl } from 'utils/utils';
import intl from 'utils/intl';
import Image from 'components/Image';

export default function ZoneSupplier(props) {
  const { companyInfosVO } = props;
  const {
    companyName,
    logoUrl,
    industryList = [],
    industryCategoryList = [],
    website,
    description,
  } = companyInfosVO;

  return (
    <div className="zone-supplier-content">
      <div className="zone-supplier-card">
        <Image
          boxStyle={{
            margin: '20px auto',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '1px solid #EBEBEB',
          }}
          value={getAttachmentUrl(logoUrl, 'private-bucket')}
          width={90}
          height={90}
        />
      </div>
      <div className="zone-supplier-info text-overflow">
        <div className="supplier-title">
          <span>{companyName}</span>
          {website && (
            <span className="supplier-website text-overflow" title={website}>
              {website}
            </span>
          )}
        </div>
        <div className="supplier-base-info">
          <div>
            <span className="label text-overflow">
              {intl.get('mallf.zoneList.view.industryType').d('行业类型')}
            </span>
            ：
            <span
              className="content text-overflow"
              title={industryList.map((n) => n.industryName).join('、')}
            >
              {industryList.map((n) => n.industryName).join('、')}
            </span>
          </div>
          <div>
            <span className="label text-overflow">
              {intl.get('mallf.zoneList.view.industrySale').d('主营品类')}
            </span>
            ：<span>{industryCategoryList?.[0]?.categoryName}</span>
          </div>
        </div>
        <div className="supplier-base-info">
          <div style={{ maxWidth: '900px' }}>
            <span className="label text-overflow">
              {intl.get('mallf.zoneList.view.companyDes').d('公司简介')}
            </span>
            ：
            <span className="company-des text-overflow" title={description || '-'}>
              {description || '-'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
