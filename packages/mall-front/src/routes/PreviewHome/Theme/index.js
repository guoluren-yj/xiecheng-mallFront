/* eslint-disable radix */
/**
 * Created by LCY on 2017/6/23.
 */
import React, { useState, useEffect } from 'react';
import { connect } from 'dva';
import Swiper from 'swiper';
import 'swiper/dist/css/swiper.min.css';
import analyze from 'rgbaster';
import Icons from 'components/Icons';
import { getUserConfigInfo, hexToRgb } from 'utils/utils';
import { fetchCarouselService } from 'services/homeService';
import HotPointMap from 'components/HotPointMap';

import useRequest from 'hooks/useRequest';
import { serviceName } from 'utils/api-config';
import defaultBanner from '../../../assets/images/default/default_banner.png';
import UserInfo from './UserInfo';
import style from './index.less';
import Colors from '@/colors';
import SiglUserInfo from './SiglUserInfo';

let mySwiper;
const colors = [];

// 参数arr的值分别为[r,g,b]
function rgbToHsv(arr = []) {
  let h = 0;

  let s = 0;

  let v = 0;
  const r = arr[0];

  const g = arr[1];

  const b = arr[2];
  arr.sort((x, y) => x - y);
  const max = arr[2];
  const min = arr[0];
  v = max / 255;
  if (max === 0) {
    s = 0;
  } else {
    s = 1 - min / max;
  }
  if (max === min) {
    h = 0; // 事实上，max===min的时候，h无论为多少都无所谓
  } else if (max === r && g >= b) {
    h = 60 * ((g - b) / (max - min)) + 0;
  } else if (max === r && g < b) {
    h = 60 * ((g - b) / (max - min)) + 360;
  } else if (max === g) {
    h = 60 * ((b - r) / (max - min)) + 120;
  } else if (max === b) {
    h = 60 * ((r - g) / (max - min)) + 240;
  }
  h = parseInt(h);
  s = parseInt(s * 100);
  v = parseInt(v * 100);
  return [h, s, v];
}

function hsvToRgb(arr = []) {
  const h = arr[0];
  let s = arr[1];
  let v = arr[2];
  s /= 100;
  v /= 100;
  let r = 0;
  let g = 0;
  let b = 0;
  const i = parseInt((h / 60) % 6);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
    default:
      break;
  }
  r = parseInt(r * 255.0);
  g = parseInt(g * 255.0);
  b = parseInt(b * 255.0);
  return [r, g, b];
}

function getRgbColor(rgb) {
  const rgbArr =
    rgb
      ?.match(/rgb\((\S*)\)/)?.[1]
      ?.split(',')
      ?.map((n) => +n) || [];
  const hsbArr = rgbToHsv(rgbArr);
  if (rgbArr[0] === 255 && rgbArr[1] === 255 && rgbArr[2] === 255) {
    const { colorCode = 'A' } = getUserConfigInfo().webConfig;
    const { r, g, b } = hexToRgb(Colors[colorCode]?.['primary-bg-color']);
    return `rgb(${r},${g},${b})`;
  } else {
    const L1 = 255 * 0.2126 + 255 * 0.7152 + 0.0722 * 255 + 0.05;
    const L2 = rgbArr[0] * 0.2126 + rgbArr[1] * 0.7152 + 0.0722 * rgbArr[2] + 0.05;
    if (L1 / L2 < 1.05) {
      hsbArr[1] += (100 - hsbArr[1]) / 10;
      hsbArr[2] -= hsbArr[1] / 10;
    }
    const color = hsvToRgb(hsbArr) || [];
    return `rgb(${color[0]},${color[1]},${color[2]})`;
  }
}

// console.log(rgbToHsv([255, 255, 255]));

function Theme({ previewInfo }) {
  const [products, setProducts] = useState([]);
  const [bgColor, setBgcolor] = useState('#EBEBEB');
  const { organizationId } = getUserConfigInfo();

  useEffect(() => {
    if (products.length > 0) {
      products.forEach((item, index) => {
        if (+item.backgroundColorFlag === 1) {
          colors[index] = item.backgroundColor;
        } else {
          analyze(`${item.imageUrl}?t=${new Date().getTime()}`, {
            scale: 0.6,
            ignore: [],
          }).then((res) => {
            colors[index] = validateColor(res);
          });
        }
      });
      mySwiper = new Swiper('#theme', {
        effect: 'fade',
        pagination: '.swiper-pagination',
        paginationClickable: true,
        paginationBulletRender(swiper, index, className) {
          return `<span class="${className}"></span>`;
        },
        autoplay: (products[0]?.bannerSpeed || 3) * 1000,
        autoplayDisableOnInteraction: false,
        loop: false,
        onSlideChangeStart(swiper) {
          setBgcolor(
            colors[swiper.activeIndex]?.startsWith('#')
              ? colors[swiper.activeIndex]
              : getRgbColor(colors[swiper.activeIndex])
          );
        },
      });
    }
  }, [products]);

  useEffect(() => {
    fetchCarousel();
  }, []);

  function validateColor(r) {
    if (!r?.[0] || !r?.[1]) return 'rgb(255,255,255)';
    if (r[0].color === 'rgb(255,255,255)' && Math.abs(r[0].count - r[1].count) < 3100) {
      return r[1].color;
    } else {
      return r[0].color;
    }
  }

  const { resData: gonggaoData } = useRequest({
    url: `/${serviceName}/v1/${organizationId}/bulletin-boards/list`,
    query: {
      belongType: previewInfo?.currentRole === 'tenant' ? 0 : null,
      unitId: previewInfo?.unitId,
      bulletinAttribute: previewInfo?.mallType ? 1 : 0,
      isPreview: 1,
      page: 0,
      size: 2,
      enabledFlag: 1,
    },
  });

  // 获取产品列表
  function fetchCarousel() {
    fetchCarouselService({
      unitId: previewInfo?.unitId, // 采买组织id
      shelfFlag: null, // 上架状态 0下架，1上架
      bannerLevel: previewInfo?.currentRole === 'tenant' ? 0 : null,
      groupAttribute: previewInfo?.mallType ? 1 : 0, // 0企业购 1员购
      isPreview: 1,
    }).then((res) => {
      if (+res[0]?.backgroundColorFlag === 1) {
        setProducts(res?.slice(0, 30));
        colors[0] = res[0]?.backgroundColor;
        setBgcolor(res[0]?.backgroundColor);
      } else {
        analyze(`${res[0]?.imageUrl || defaultBanner}?t=${new Date().getTime()}`, {
          scale: 0.6,
          ignore: [],
        }).then((r) => {
          if (res.length > 0) {
            setProducts(res?.slice(0, 30));
            colors[0] = res[0]?.backgroundColor;
            setBgcolor(getRgbColor(validateColor(r)));
          } else {
            setProducts([
              {
                imageUrl: defaultBanner,
                bannerType: 2,
              },
            ]);
            setBgcolor(getRgbColor(r[0].color));
          }
        });
      }
    });
  }

  function onMouseOut() {
    if (mySwiper) {
      mySwiper.startAutoplay();
    }
  }

  function onMouseMove() {
    if (mySwiper) {
      mySwiper.stopAutoplay();
    }
  }

  // function getLinkUrl(data) {
  //   const { productGroup, productGroupId, bannerName } = data || {}; // 商品组信息
  //   const { productGroupAssignList = [], groupType } = productGroup || {}; // 商品组行信息
  //   const params = {
  //     bannerName,
  //     jumpPageFlag: 1,
  //     imgaeUrlTwo: encodeURIComponent(data?.imgaeUrlTwo),
  //   };
  //   if (groupType === 0) {
  //     // 自由组合
  //     params.bannerId = productGroupId;
  //   } else if (groupType === 1) {
  //     // 供应商
  //     params.supplierCompanyIds = JSON.stringify(
  //       productGroupAssignList?.map(p => p.supplierCompanyId)
  //     );
  //   } else if (groupType === 2) {
  //     params.catalogIds = JSON.stringify(productGroupAssignList?.map(p => p.catalogId));
  //     // 目录
  //   } else if (groupType === 3) {
  //     // 销量
  //     params.salesSort = 'desc';
  //     params.salesRank = productGroupAssignList?.[0]?.salesRank;
  //   } else if (groupType === 4) {
  //     // 活动
  //     params.activityId = JSON.stringify(productGroupAssignList?.map(p => p.activityId));
  //   }
  //   return `${mallType === 'sigl' ? '/sigl' : ''}/product-list?${qs.stringify(params)}`;
  // }

  function banner() {
    if (products) {
      // eslint-disable-next-line array-callback-return
      return products.map((item) => {
        const { imageUrl, bannerType, bannerId, hotZoneFlag, hotZoneList = [] } = item;
        if (imageUrl) {
          return (
            <div
              // key={item}
              className="swiper-slide"
              onBlur
              onMouseOut={onMouseOut}
              onMouseMove={onMouseMove}
            >
              {+bannerType === 2 ? (
                <div style={{ position: 'relative' }}>
                  <img
                    alt=""
                    style={{ width: 810, height: 400 }}
                    src={imageUrl}
                    className="bannerImage"
                    useMap={`#${bannerId}`}
                  />
                  {hotZoneFlag === 1 && (
                    <HotPointMap mapId={bannerId} hotZoneList={hotZoneList || []} disabled />
                  )}
                </div>
              ) : +bannerType === 3 ? (
                <a target="_black" href={item.linkUrl}>
                  <img
                    alt=""
                    style={{ width: 810, height: 400 }}
                    src={imageUrl}
                    className="bannerImage"
                  />
                </a>
              ) : (
                <a>
                  <img
                    alt=""
                    style={{ width: 810, height: 400 }}
                    src={imageUrl}
                    className="bannerImage"
                  />
                </a>
              )}
            </div>
          );
        }
      });
    }
  }

  return (
    <div className={style.them} style={{ background: bgColor }}>
      <div id="theme" className="swiper-container swiper container">
        <div className="swiper-wrapper">{banner()}</div>
        <div className="swiper-pagination" />
        {products?.length > 1 && (
          <>
            <div
              onClick={() => {
                if (mySwiper?.activeIndex === 0) {
                  mySwiper.slideTo(products.length - 1);
                } else {
                  mySwiper.slidePrev();
                }
              }}
              className="jump-btn left"
            >
              <Icons type="ic_arrow_left" />
            </div>
            <div
              onClick={() => {
                if (mySwiper?.activeIndex === products.length - 1) {
                  mySwiper.slideTo(0);
                } else {
                  mySwiper.slideNext();
                }
              }}
              className="jump-btn right"
            >
              <Icons type="ic_arrow_right" />
            </div>
          </>
        )}
        <div className={style['right-info']}>
          {previewInfo?.mallType === 'sigl' ? (
            <SiglUserInfo gonggaoData={gonggaoData} />
          ) : (
            <UserInfo gonggaoData={gonggaoData} />
          )}
        </div>
      </div>
    </div>
  );
}

export default connect(({ global }) => ({
  previewInfo: global.previewInfo,
}))(Theme);
