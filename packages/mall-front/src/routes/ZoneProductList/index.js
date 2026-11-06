import React, { useEffect } from 'react';
import qs from 'qs';

import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import BreadCrumbs from 'components/BreadCrumbs';
import Loading from 'components/loading';
import useSetState from 'hooks/useState';
import formatterCollections from 'utils/intl/formatterCollections';
import { getOrganizationId } from 'utils/utils';
import { fetchZoneSupplierListService, fetchZoneListService } from 'services/zoneProductService';
import styles from './index.less';
import SupplierInfo from './SupplierInfo';
import SearchHeader from './SearchHeader';
import ContentList from './ContentList';

function ZoneProductList() {
  const tenantId = getOrganizationId();
  const locationParams = qs.parse(window.location.search?.substr(1));
  const [state, setState] = useSetState({
    spinning: false,
    loading: false,
    productList: [],
    productNum: '',
    conditionType: '',
    order: 'desc',
    maxPrice: '',
    minPrice: '',
    fetchParams: {
      ...locationParams,
      page: 0,
      size: 20,
    },
    companyInfosVO: {},
  });

  const { supplierId, keyword } = locationParams;

  useEffect(() => {
    getProductList({ ...state.fetchParams, supplierId });
    if (supplierId) {
      fetchZoneSupplierListService({ supplierId }).then((res) => {
        if (res) {
          setState({
            companyInfosVO: res.content?.[0]?.companyInfosVO,
          });
        }
      });
    }
  }, [supplierId]);

  function getProductList(params = {}) {
    const data = { ...params, tenantId };
    if (state.conditionType === 'price') {
      data.priceOrder = state.order;
    } else {
      delete data.priceOrder;
    }
    setState({
      spinning: true,
    });
    fetchZoneListService(data)
      .then((res) => {
        setState({
          spinning: true,
          fetchParams: data,
          productList: res?.productList?.content || [],
          productNum: res?.productList?.totalElements || 0,
        });
      })
      .finally(() => {
        setState({
          spinning: false,
        });
      });
  }

  return (
    <div className={styles['productlist-wrap']}>
      <BreadCrumbs
        value={{
          pageTitle: {
            name: intl.get('mallf.zoneList.view.title').d('甄选专区'),
            path: '/zone-supplier-list',
          },
          childTitle1: state.companyInfosVO?.companyName,
          rightBtn: (
            <span style={{ float: 'right', fontSize: 14, verticalAlign: 'middle' }}>
              {intl
                .getHTML(`mallf.common.common.totalElement`, {
                  value: state.productNum,
                })
                .d(
                  <span>
                    共<b>{state.productNum}</b>件商品
                  </span>
                )}
            </span>
          ),
        }}
      />
      {state.loading ? (
        <Loading />
      ) : (
        <Spin spinning={state.spinning}>
          <div className="conditions-wrap container">
            <SupplierInfo r-if={supplierId} companyInfosVO={state.companyInfosVO} />
            <SearchHeader
              keyword={keyword}
              fetchParams={state.fetchParams}
              getProductList={getProductList}
              conditionType={state.conditionType}
              order={state.order}
              maxPrice={state.maxPrice}
              minPrice={state.minPrice}
              setState={setState}
            />
            <ContentList
              getProductList={getProductList}
              fetchParams={state.fetchParams}
              productNum={state.productNum}
              setState={setState}
              productList={state.productList}
            />
          </div>
        </Spin>
      )}
    </div>
  );
}

export default formatterCollections({ code: ['mallf.zoneList', 'mallf.productList'] })(
  ZoneProductList
);
