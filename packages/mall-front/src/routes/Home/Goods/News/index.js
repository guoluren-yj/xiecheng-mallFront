/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import React from 'react';
import classnames from 'classnames';
import qs from 'qs';

import Image from 'components/Image';
import Link from 'components/Link';
import ProductCard, { PreProductCard } from 'components/ProductCard';
import HotPointMap from 'components/HotPointMap';

import intl from 'utils/intl';
import {
  getUserConfigInfo,
  getAccessToken,
  getProductLinkParams,
  openPage,
  getOnlyInStock,
} from 'utils/utils';
import emptyImg from '@/assets/images/product/illu_search_nodata_default.svg';

import style from './index.less';

function getList(num) {
  return [...new Array(num).keys()];
}

export default function News(props) {
  const {
    customId,
    customName,
    customType,
    products = [],
    update = false,
    customTagLineList = [], //
    productCardConfig,
    customBarShow,
    isBarUpdateIds,
    hotZoneFlag,
    hotZoneList = [],
  } = props;
  const {
    mallType,
    webConfig: { topicColor },
  } = getUserConfigInfo();

  function getLinkUrl(data, currentIndex) {
    const { productGroup, productGroupId } = data || customTagLineList?.[0] || {}; // 商品组信息
    const { productGroupAssignList = [], groupType, groupTypeName, orderType, includeNoStockFlag } =
      productGroup || {}; // 商品组行信息
    const params = {
      customId,
      barName: customName,
      isCustom: 1,
      onlyInStock: getOnlyInStock(includeNoStockFlag),
    };

    if (+customType === 4) {
      params.currentIndex = currentIndex;
    }
    const newParams = getProductLinkParams({
      param: params,
      orderType,
      groupType,
      groupTypeName,
      productGroupId,
      productGroupAssignList,
      isLink: true,
    });
    return `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(newParams)}`;
  }

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

  const emptyProductCotent = ({ text }) => {
    return (
      <div className="no-product">
        <img alt="" src={emptyImg} />
        <div className="no-product-text">
          {text || intl.get(`mallf.home.model.home.noProduct`).d('暂无商品')}
        </div>
      </div>
    );
  };

  function renderProduct() {
    const { productGroup } = customTagLineList?.[0] || {}; // 商品组信息
    const { tagColor, tagName, tagStyle, tagFlag } = productGroup || {};
    if (newGoods.length > 0 || (customType === 4 && customTagLineList.length > 0)) {
      // const getUniqueValue = (p) => p.recordId || `${p.sourceFromCode}${p.productId}`;
      return (customType === 4 ? customTagLineList : newGoods).map((item, i) => {
        // const imgUrl = convertImg(item.imagePath, 2, item.sourceFromCode);
        const barProductId = `${customId}_${item.productId}`;
        // const showPrice = `${numberRender(item.sellPrice)}`;
        if ([1, 2, 3].includes(customType)) {
          return (
            <div className="product-item">
              <ProductCard
                productCardConfig={productCardConfig}
                tagColor={tagColor}
                tagName={tagName}
                tagStyle={tagStyle}
                tagFlag={tagFlag}
                barProductId={barProductId}
                product={item}
                wraperClass={`product-card-${customType}`}
                style={{ height: 338 }}
              />
            </div>
          );
        } else if (customType === 4) {
          return (
            <Link
              className="five-custom-item"
              to={
                item.moduleType === 1
                  ? item.quickLink?.replace('{access_token}', getAccessToken())
                  : getLinkUrl(item, i)
              }
            >
              <Image value={item.imageUrl} width={230} height={113} />
              <div className="five-custom-item-cover">{item.moduleName}</div>
            </Link>
          );
        } else {
          // return null;
          return (
            <div className="product-item">
              <PreProductCard />
            </div>
          );
        }
      });
    } else {
      return emptyProductCotent({
        text:
          customType === 4
            ? intl.get(`mallf.home.model.home.noContent`).d('暂无内容')
            : intl.get(`mallf.home.model.home.noProduct`).d('暂无商品'),
      });
    }
  }
  // 五图不查接口所以不需要骨架图，可以直接隐藏
  return customBarShow === 'HIDE' &&
    (customType === 4
      ? customTagLineList.length === 0
      : products.length === 0 && isBarUpdateIds.includes(customId) && !update) ? (
        <div id={`customId${customId}`} />
  ) : (
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
            <Link to={getLinkUrl()}>
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
            </Link>
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
              <div className="title-right-icon">
                <img
                  alt=""
                  src={require(`../../../../assets/images/home/title-right-${
                    topicColor || 'A'
                  }.png`)}
                />
              </div>
            </>
          )}
          {((customType === 1 && products.length > 10) ||
            (customType === 2 && products.length > 8) ||
            (customType === 3 && products.length > 10)) && (
            <a className="bar-title-more" onClick={() => openPage(getLinkUrl())}>
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
              <HotPointMap mapId={customId} hotZoneList={hotZoneList || []} hotTimes={1 / 0.65} />
            )}
          </div>
        )}
        <div className={`bar-content bar-content${customType}`}>
          {customType === 2 && (
            <div className="bar-left-img">
              <Image
                value={customTagLineList?.[0]?.imageUrl}
                width={230}
                height={686}
                imgStyle={{ border: '1px solid rgba(232,232,232,1)' }}
                useMap={`#${customId}`}
              />
              {hotZoneFlag === 1 && (
                <HotPointMap mapId={customId} hotZoneList={hotZoneList || []} />
              )}
            </div>
          )}
          <ul
            className={classnames({
              'bar-right-products': true,
              'has-bar-img-y': customType === 2,
              'has-bar-img-x': customType === 3,
              'no-bar-img': customType === 1,
            })}
          >
            {update ? (
              <>
                {getList(customType === 2 ? 8 : 10)?.map(() => (
                  <div className="product-item">
                    <PreProductCard />
                  </div>
                ))}
              </>
            ) : (
              renderProduct()
            )}
          </ul>
        </div>
      </>
    </div>
  );
}
