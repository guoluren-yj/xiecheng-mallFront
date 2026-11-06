import React, { useEffect, useRef } from 'react';
import qs from 'qs';
// import { isEmpty } from 'lodash';
import { BackTop, Spin } from 'choerodon-ui';
import 'swiper/dist/css/swiper.min.css';

import Loading from 'components/loading';
import BreadCrumbs from 'components/BreadCrumbs';
import { getUserConfigInfo } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import useScroll from 'hooks/useScroll';
import { fetchZoneDeatilService } from 'services/zoneProductService';
import styles from './index.less';
import ProductImg from './productImg';
import ProductInfo from './productInfo';
import ProductDesc from './productDesc';
import ProductParam from './productParam';
import useSetState from '@/hooks/useState';

function ProductDetail(props) {
  const { scrollBottom } = useScroll();
  const [state, setState] = useSetState({
    loading: true,
    productData: {},
    spinning: false,
  });

  const catalogItems = useRef([]); // 商品分类
  const productName = useRef(''); // 商品名称
  const { productId } = qs.parse(props.location.search.substr(1));

  const {
    userId,
    constants: { footerPaddingBottom },
  } = getUserConfigInfo();

  useEffect(() => {
    fetchDetailInfo();
  }, []);

  // 商品信息更新接口
  function fetchDetailInfo() {
    setState({ spinning: true });
    fetchZoneDeatilService({
      skuId: productId,
    })
      .then((res) => {
        if (res) {
          setState({ productData: res });
        }
      })
      .catch((err) => {
        props.history.push({
          pathname: `/exception`,
          state: { message: err.message },
        });
      })
      .finally(() => {
        setState({
          loading: false,
          spinning: false,
        });
      });
  }

  return (
    <>
      <div style={{ background: '#fff', marginTop: 9 }}>
        <BreadCrumbs
          className="breadCrumbs"
          value={{
            catalogItems: catalogItems.current,
            pageTitle: {
              name: state.productData?.companyInfosVO?.companyName,
              path: `/zone-product-list?supplierId=${state.productData?.supplierId}`,
            },
            childTitle1: productName.current,
          }}
        />
      </div>
      <Spin spinning={state.spinning}>
        <div className={styles['productDetail-page']}>
          {state.loading ? (
            <div style={{ paddingTop: 50 }}>
              <Loading />
            </div>
          ) : (
            <div className="product-detail-content container">
              <div className="product-detail-wrapper">
                <div className="info-left">
                  <ProductImg
                    imagePath={state.productData?.primaryPath}
                    productImgList={
                      state.productData?.skuMedias?.map((p) => ({
                        ...p,
                        imagePath: p.thumbnailPath,
                        largeImagePath: p.mediaPath,
                      })) || []
                    }
                    productData={state.productData}
                  />
                </div>
                <div className="info-center" id="info-center">
                  <ProductInfo fetchDetailInfo={fetchDetailInfo} productData={state.productData} />
                </div>
                {state?.productData?.recommendSku && (
                  <div className="info-right">
                    <ProductParam
                      list={state?.productData?.recommendSku?.slice(0, 2) || []}
                      productData={state.productData}
                    />
                  </div>
                )}
              </div>
              <div className="product-desc-wrapper">
                {userId && <div className="desc-left" />}
                <div className="desc-right">
                  <ProductDesc productData={state.productData} />
                </div>
              </div>
              <BackTop
                style={{
                  right: (window.innerWidth - 1190 - 50 - 80) / 2,
                  bottom:
                    scrollBottom - footerPaddingBottom + 82 > 0
                      ? 82
                      : 82 - (scrollBottom - footerPaddingBottom + 82),
                }}
                visibilityHeight={1.5 * window.innerHeight}
                target={() => document.body}
              />
            </div>
          )}
        </div>
      </Spin>
    </>
  );
}

export default formatterCollections({
  code: ['mallf.productDetail'],
})(ProductDetail);
