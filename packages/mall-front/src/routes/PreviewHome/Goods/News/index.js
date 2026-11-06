/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React from 'react';
import classnames from 'classnames';
// import qs from 'qs';

import Image from 'components/Image';
import HotPointMap from 'components/HotPointMap';
// import Link from 'components/Link';

import intl from 'utils/intl';
import { getUserConfigInfo } from 'utils/utils';
import ProductCard from 'components/ProductCard';
import BarLoader from './BarLoader';

import style from './index.less';

export default function News(props) {
  const {
    customId,
    customName,
    customType,
    products = [],
    update = false,
    customTagLineList = [], //
    productCardConfig,
    hotZoneFlag,
    hotZoneList,
  } = props;
  const {
    // mallType,
    webConfig: { topicColor },
  } = getUserConfigInfo();

  // function getLinkUrl(data) {
  //   const { productGroup, productGroupId } = data || customTagLineList?.[0] || {}; // 商品组信息
  //   const { productGroupAssignList = [], groupType } = productGroup || {}; // 商品组行信息
  //   const params = {
  //     barName: customName,
  //     jumpPageFlag: 1,
  //     imgaeUrlTwo: encodeURIComponent((data || customTagLineList?.[0])?.imageUrlTwo),
  //   };
  //   if (groupType === 0) {
  //     // 自由组合
  //     params.bannerId = productGroupId;
  //   } else if (groupType === 1) {
  //     // 供应商
  //     params.supplierCompanyIds = JSON.stringify(
  //       productGroupAssignList?.map((p) => p.supplierCompanyId)
  //     );
  //   } else if (groupType === 2) {
  //     params.catalogIds = JSON.stringify(productGroupAssignList?.map((p) => p.catalogId));
  //     // 目录
  //   } else if (groupType === 3) {
  //     // 销量
  //     params.salesSort = 'desc';
  //     params.salesRank = productGroupAssignList?.[0]?.salesRank;
  //   } else if (groupType === 4) {
  //     // 活动
  //     params.activityId = JSON.stringify(productGroupAssignList?.map((p) => p.activityId));
  //   }
  //   return `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(params)}`;
  // }

  // const caseShelf = products.filter((g) => g.shelfFlag === 1);
  // const caseUnShelf = products.filter((g) => g.shelfFlag !== 1);
  // let newGoods = [...caseShelf, ...caseUnShelf];
  let newGoods = [...products];

  if (customType === 1 || customType === 3) {
    newGoods = newGoods.slice(0, 10);
  }
  if (customType === 2) {
    newGoods = newGoods.slice(0, 8);
  }

  // const renderChannel = useMemo(() => {
  //   // const channelList =
  //   //   customChannelList?.length > 5 ? customChannelList.slice(0, 5) : customChannelList;
  //   return (customTagLineList || []).map(item => {
  //     const imgUrl = convertImg(item.imagePath, 2, item.sourceFrom);
  //     const getUniqueValue = p => p.recordId || `${p.sourceFrom}${p.productId}`;
  //     // let paramsKey;
  //     let params = {};
  //     switch (item.channelType) {
  //       case 'SUPPLIER':
  //         params = {
  //           attribute: {
  //             [intl
  //               .get('mallf.productList.view.product.sourceFrom')
  //               .d('商品来源')]: item?.customChannelRangeList.map(n => n.supplierCompanyName),
  //           },
  //         };
  //         break;
  //       case 'CATEGORY':
  //         params = {
  //           attribute: {
  //             [intl
  //               .get('mallf.productList.view.product.category')
  //               .d('分类')]: item?.customChannelRangeList.map(n => n.categoryName),
  //           },
  //         };
  //         break;
  //       case 'SALE':
  //         params = { salesSort: 'desc' };
  //         break;
  //       default:
  //         break;
  //     }
  //     return (
  //       <li key={getUniqueValue(item)} className="product-wrap">
  //         <Link
  //           title={item.productName}
  //           to={`/product-list?${qs.stringify(params, { arrayFormat: 'brackets' })}`}
  //           style={{ display: 'block', width: 230, height: 230, overflow: 'hidden' }}
  //         >
  //           <Image value={imgUrl} width="230px" height="230px" className="channel-image" />
  //           <div className="channel-name">{item.channelName}</div>
  //         </Link>
  //       </li>
  //     );
  //   });
  // }, [customTagLineList]);

  function renderProduct() {
    const { productGroup } = customTagLineList?.[0] || {}; // 商品组信息
    const { tagColor, tagName, tagStyle, tagFlag } = productGroup || {};
    if (newGoods.length >= 0) {
      // const getUniqueValue = (p) => p.recordId || `${p.sourceFromCode}${p.productId}`;
      return (customType === 4 ? customTagLineList : newGoods).map((item) => {
        // const imgUrl = convertImg(item.imagePath, 2, item.sourceFromCode);
        const barProductId = `${customId}_${item.productId}`;
        // const showPrice = `${numberRender(item.sellPrice)}`;
        if ([1, 2, 3].includes(customType)) {
          return (
            <div className="product-item">
              <ProductCard
                tagColor={tagColor}
                tagName={tagName}
                tagStyle={tagStyle}
                tagFlag={tagFlag}
                barProductId={barProductId}
                product={item}
                wraperClass={`product-card-${customType}`}
                productCardConfig={productCardConfig}
                style={{ height: 338 }}
              />
            </div>
          );
        } else if (customType === 4) {
          return (
            <a className="five-custom-item">
              <Image value={item.imageUrl} width={230} height={113} />
              <div className="five-custom-item-cover">{item.moduleName}</div>
            </a>
          );
        } else {
          return null;
        }
      });
    }
  }

  return (
    <div className={style['bar-wrapper']} id={`customId${customId}`}>
      <div className="bar-header">
        <p
          className={classnames([
            'bar-title',
            { 'text-left': props.location === '1' },
            { 'text-center': props.location === '2' },
          ])}
        >
          {customTagLineList?.[0]?.jumpPage === 1 ? (
            <a>
              <div className="title-left-icon">
                <img
                  alt=""
                  src={require(`../../../../assets/images/home/title-left-${
                    topicColor || 'A'
                  }.png`)}
                />
              </div>
              <span>{customName}</span>
              <div className="title-right-icon">
                <img
                  alt=""
                  src={require(`../../../../assets/images/home/title-right-${
                    topicColor || 'A'
                  }.png`)}
                />
              </div>
            </a>
          ) : (
            <>
              <div className="title-left-icon">
                <img
                  alt=""
                  src={require(`../../../../assets/images/home/title-left-${
                    topicColor || 'A'
                  }.png`)}
                />
              </div>
              <span>{customName}</span>
              <div className="title-right-icon" />
            </>
          )}
          {((customType === 1 && products.length > 10) ||
            (customType === 2 && products.length > 8) ||
            (customType === 3 && products.length > 10)) && (
            <a className="bar-title-more">
              {intl.get(`mallf.home.model.home.moreProduct`).d('MORE 更多商品')}
            </a>
          )}
        </p>
      </div>
      <>
        {customType === 3 && (
          <div className="bar-top-img">
            <Image
              useMap={`#${customId}`}
              value={customTagLineList?.[0]?.imageUrl}
              width={1190}
              height={340}
            />
            {hotZoneFlag === 1 && (
              <HotPointMap
                mapId={customId}
                hotZoneList={hotZoneList || []}
                hotTimes={1 / 0.65}
                disabled
              />
            )}
          </div>
        )}
        <div className={`bar-content bar-content${customType}`}>
          {customType === 2 && (
            <div className="bar-left-img">
              <Image
                useMap={`#${customId}`}
                value={customTagLineList?.[0]?.imageUrl}
                width={230}
                height={686}
              />
              {hotZoneFlag === 1 && (
                <HotPointMap mapId={customId} hotZoneList={hotZoneList || []} disabled />
              )}
            </div>
          )}
          {update ? (
            <BarLoader
              rows={customType === 1 ? 10 : customType === 2 || customType === 3 ? 20 : 10}
            />
          ) : (
            <ul
              className={classnames({
                'bar-right-products': true,
                'has-bar-img-y': customType === 2,
                'has-bar-img-x': customType === 3,
                'no-bar-img': customType === 1,
              })}
            >
              {renderProduct()}
            </ul>
          )}
        </div>
      </>
    </div>
  );
}
