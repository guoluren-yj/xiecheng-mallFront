/* eslint-disable no-new */
import React, { useEffect, useState, useMemo } from 'react';
import { Tabs, Icon, Tag } from 'choerodon-ui';
import Swiper from 'swiper';
import { isEmpty } from 'lodash';

import Link from 'components/Link';
import { getUserConfigInfo, getStorage, setStorage, numberRender } from 'utils/utils';
import { getCompareConfig } from 'utils/configUtils';
import intl from 'utils/intl';
import Image from 'components/Image';
import Icons from 'components/Icons';
import {
  getSameProductList,
  getNewProductDetail,
  getProductSku,
} from 'services/productDetailService';
import { ShowCompare } from 'utils/renderer';
import { Tooltip } from 'choerodon-ui/pro';
import style from './index.less';
import SpecList from './SpecList';
import CuxFn from '@/cuxTools/cuxFn';

const productAttrs = {};
export default function SimilarProduct(props) {
  const {
    productId,
    itemId,
    setPriceCompareControl,
    priceCompareControl,
    dimensTemplates,
    similarData,
    similarList,
    currentAddress,
    sourceFrom,
    productData,
  } = props;
  const { userId, regionId, levelPath, addressInfo, companyId, unitId } = getUserConfigInfo();
  const { compareRule, labelCodeList, supplierNameList } = getCompareConfig();
  const [product, setProduct] = useState();
  const similarDisplayFlag = product?.length && compareRule !== 4;
  const [activeKey, setActiveKey] = useState();

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  function updatePriceCompareList(type, item = {}) {
    const priceCompareObj = getStorage(`${userId}_price_compare`) || {};
    const tmpPriceCompareObj = { ...priceCompareObj };
    const tmpList = tmpPriceCompareObj.data || [];
    const { invoiceOrgId } = getUserConfigInfo();
    if (type === 'add') {
      setStorage('priceCompareVisible', true);
      setStorage(`${userId}_price_compare`, {
        ...tmpPriceCompareObj,
        visible: true,
      });
      if (tmpList.find((tmp) => tmp.productId === item.productId)) {
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
      } else {
        setStorage(`${userId}_price_compare`, {
          data: [
            {
              sourceFrom: item.sourceFromCode || item.sourceFrom,
              productName: item.skuName || item.productName,
              productId: item.productId,
              productNum: item.skuCode || item.productNum,
              imagePath: item.mediaPath,
              supplierCompanyName: item.supplierCompanyName,
              price: item.agreementPrice || item.price,
              priceMeaning: numberRender([item, 'agreementPrice']),
              currencySymbol: item.currencySymbol,
              // similarData: res[0] || [],
              // productSkuAttrDTOS: res[1].productSkuAttrDTOS || [],
              checked: false,
              deleteFlag: 0,
              type: 1,
              deliveryCycle: item.deliveryCycle,
            },
            ...tmpList,
          ],
          visible: true,
        });
        setPriceCompareControl({
          ...priceCompareControl,
          update: !priceCompareControl.update,
        });
        if (!productAttrs[item.productId]) {
          Promise.all([
            getProductSku({
              sourceFrom: item.sourceFromCode || item.sourceFrom,
              productId: item.productId,
              regionId,
            }),
            getNewProductDetail({
              regionId,
              levelPath,
              countyCode: addressInfo.countyId,
              sourceFrom: item.sourceFromCode || item.sourceFrom,
              productId: item.productId,
              invOrganizationId: invoiceOrgId,
              addressId: addressInfo.addressId,
            }),
          ])
            .then((res) => {
              productAttrs[item.productId] = {
                similarData: (res[0] || []).map((p) => ({
                  dim: p.dim,
                  saleName: p.saleName,
                  saleAttrList: p.saleAttr,
                })),
                productSkuAttrDTOS: res[1].productSkuAttrDTOS || [],
              };
              let newData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
              for (const i in productAttrs) {
                if (i) {
                  newData = newData.map((n) => {
                    // eslint-disable-next-line eqeqeq
                    if (n.productId == i) return { ...n, ...productAttrs[i] };
                    return n;
                  });
                }
              }
              setStorage(`${userId}_price_compare`, {
                data: newData,
                visible: getStorage(`${userId}_price_compare`)?.visible,
              });
              setPriceCompareControl({
                ...priceCompareControl,
                update: !priceCompareControl.update,
              });
            })
            .catch(() => {
              const newData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
              setStorage(`${userId}_price_compare`, {
                data: newData.filter((p) => !!p.productSkuAttrDTOS),
                visible: getStorage(`${userId}_price_compare`)?.visible,
              });
              setPriceCompareControl({
                ...priceCompareControl,
                update: !priceCompareControl.update,
              });
            });
        } else {
          let newData = [...(getStorage(`${userId}_price_compare`)?.data || [])];
          for (const i in productAttrs) {
            if (i) {
              newData = newData.map((n) => {
                if (+n.productId === +i) return { ...n, ...productAttrs[i] };
                return n;
              });
            }
          }
          setStorage(`${userId}_price_compare`, {
            data: newData,
            visible: getStorage(`${userId}_price_compare`)?.visible,
          });
          setPriceCompareControl({
            ...priceCompareControl,
            update: !priceCompareControl.update,
          });
        }
      }
    }
  }

  function fetchProduct() {
    const { regionCodeList, fullAddress } = currentAddress || {};
    const params = {
      provinceId: regionCodeList?.[0],
      cityId: regionCodeList?.[1],
      countyId: regionCodeList?.[2],
      address: fullAddress,
      productId,
      itemId,
      regionId,
      levelPath,
      companyId,
      unitId,
      excludeLabelList: labelCodeList || [],
      excludeCompanyList: supplierNameList || [],
    };
    getSameProductList(params).then((res) => {
      if (res?.length > 0) {
        setProduct(res?.slice(0, 20));
        new Swiper(`#product-1`, {
          prevButton: '.similar-prev',
          nextButton: '.similar-next',
          slidesPerView: 6,
          slidesPerGroup: 6,
          width: 1032,
          direction: 'horizontal',
          spaceBetween: 30,
        });
      }
    });
  }

  const renderTab = CuxFn({
    name: 'productDetail-similarProduct-fn-cuxTabTitle',
    value: { product, productData, productId },
  })(
    () => {
      return intl.get(`mallf.productDetail.model.sameProduct`).d('同款商品');
    } // 要覆盖的标准函数
  );

  const showSimilar = useMemo(() => {
    return product?.map((imgObj, idx) => {
      return (
        <div className="swiper-slide">
          <div className="similar-card">
            <div className="similar-card-img">
              <Tooltip title={imgObj.recommendReason}>
                <Link
                  to={`/product-detail?productId=${imgObj.skuId}&sourceFrom=${imgObj.sourceFrom}`}
                >
                  <Image value={imgObj.mediaPath} width={100} height={100} />
                </Link>
              </Tooltip>
              {+imgObj.minPriceFlag === 1 && (
                <Tag color="#00B377" className="similar-tag text-overflow">
                  {intl.get(`mallf.common.view.minPrice`).d('价格最低')}
                </Tag>
              )}
              {+imgObj.minSkuPriceFlag === 1 && (
                <Tag color="#1770E6" className="similar-tag text-overflow">
                  {intl.get(`mallf.common.view.minSkuPrice`).d('折算单价最低')}
                </Tag>
              )}
              {+imgObj.minUnitPriceFlag === 1 && (
                <Tag color="#00B377" className="similar-tag text-overflow">
                  {intl.get(`mallf.common.view.minUnitPrice`).d('售价最低')}
                </Tag>
              )}
              {!isNaN(+imgObj.agreementPrice) && (
                <ShowCompare>
                  <div
                    className="add-compare"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      updatePriceCompareList('add', {
                        ...product[idx],
                        productId: product[idx].skuId,
                      });
                    }}
                  >
                    <Icon
                      type="bar_chart"
                      style={{
                        color: '#fff',
                        position: 'relative',
                        bottom: 1,
                        right: 5,
                        fontSize: 12,
                      }}
                    />
                    {intl.get(`mallf.productDetail.model.addCompar`).d('加入比价')}
                  </div>
                </ShowCompare>
              )}
            </div>
            <Tooltip title={imgObj.skuName}>
              <Link
                to={`/product-detail?productId=${imgObj.skuId}&sourceFrom=${imgObj.sourceFrom}`}
              >
                <div className="card-name text-overflow">{imgObj.skuName}</div>
              </Link>
            </Tooltip>
            <div
              className="card-price text-overflow"
              title={`${imgObj?.currencySymbol || ''}${numberRender(
                imgObj.agreementPrice !== 0 ? imgObj.agreementPrice || imgObj.price : 0
              )}`}
            >
              {imgObj?.currencySymbol || ''}
              {numberRender(
                imgObj.agreementPrice !== 0 ? imgObj.agreementPrice || imgObj.price : 0
              )}
            </div>
          </div>
        </div>
      );
    });
  }, [product]);

  const specDisplayFlag = !isEmpty(dimensTemplates) && similarList?.length > 5;
  return (
    <div
      className={
        style[
          similarDisplayFlag || specDisplayFlag ? 'productSimilar-parent' : 'productSimilar-none'
        ]
      }
    >
      <Tabs
        activeKey={activeKey || (similarDisplayFlag ? '1' : '2')}
        onChange={(key) => setActiveKey(key)}
      >
        {similarDisplayFlag && (
          <Tabs.TabPane key="1" tab={renderTab}>
            <div className={style['product-similar-content']}>
              <div className="similar-prev">
                <Icons type="left" style={{ fontSize: '24px' }} />
              </div>
              <div className="product-similar-display">
                <div id="product-1" className="swiper-container product-similar">
                  <div className="swiper-wrapper">{showSimilar}</div>
                </div>
              </div>
              <div className="similar-next">
                <Icons type="right" style={{ fontSize: '24px' }} />
              </div>
            </div>
          </Tabs.TabPane>
        )}
        {specDisplayFlag && (
          <Tabs.TabPane
            key="2"
            tab={`${intl.get(`mallf.productDetail.model.specChoose`).d('规格选择')}(${
              similarList?.length
            })`}
          >
            <SpecList
              similarData={similarData}
              similarList={similarList}
              dimensTemplates={dimensTemplates}
              sourceFrom={sourceFrom}
              currentAddress={currentAddress}
              productData={productData}
            />
          </Tabs.TabPane>
        )}
      </Tabs>
    </div>
  );
}
