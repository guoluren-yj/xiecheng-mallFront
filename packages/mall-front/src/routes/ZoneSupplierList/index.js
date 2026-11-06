import React, { useEffect } from 'react';
import { withRouter } from 'react-router-dom';

import { Spin } from 'choerodon-ui';
import intl from 'utils/intl';
import BreadCrumbs from 'components/BreadCrumbs';
import Pagination from 'components/Pagination';
import useSetState from 'hooks/useState';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  fetchZoneSupplierListService,
  fetchZoneProductListService,
} from 'services/zoneProductService';
import ZoneSupplier from './ZoneSupplier';
import style from './index.less';

function ZoneSupplierList(props) {
  const [state, setState] = useSetState({
    supplierList: [],
    productList: [],
    paginations: {},
    spinning: false,
  });
  useEffect(() => {
    fetchZoneSupplierList();
  }, []);

  const fetchZoneSupplierList = (params) => {
    setState({ spinning: true });
    fetchZoneSupplierListService(params)
      .then((res) => {
        if (res) {
          const { content, ...paginations } = res;
          setState({
            supplierList: content,
            paginations,
          });
          fetchZoneProductList(content.map((n) => ({ supplierId: n.supplierId })));
        }
      })
      .finally(() => {
        setState({ spinning: false });
      });
  };

  const fetchZoneProductList = (params) => {
    setState({ spinning: true });
    fetchZoneProductListService(params)
      .then((res) => {
        if (res) {
          setState({
            productList: res,
          });
        }
      })
      .finally(() => {
        setState({ spinning: false });
      });
  };

  const { supplierList, productList, paginations, spinning } = state;

  return (
    <div className={style['zone-supplier']}>
      <BreadCrumbs
        value={{
          pageTitle: intl.get('mallf.zoneList.view.title').d('甄选专区'),
          rightBtn: (
            <span style={{ float: 'right', fontSize: 14, verticalAlign: 'middle' }}>
              {intl
                .getHTML(`mallf.zoneList.view.totalElement`, {
                  value: paginations?.totalElements,
                })
                .d(
                  <span>
                    共<b>{paginations?.totalElements}</b>个相关店铺
                  </span>
                )}
            </span>
          ),
        }}
      />
      <Spin spinning={spinning}>
        <div className="zone-supplier-body">
          {supplierList?.map((supplier) => {
            const { skuList = [] } =
              productList.find((n) => n.supplierId === supplier.supplierId) || {};
            return (
              <ZoneSupplier history={props.history} supplierData={supplier} skuList={skuList} />
            );
          })}
        </div>
        <div style={{ width: '100%', textAlign: 'right' }}>
          <Pagination
            scrollTop={300}
            {...paginations}
            onForward={(p) => {
              fetchZoneSupplierList(p);
            }}
          />
        </div>
      </Spin>
    </div>
  );
}

export default formatterCollections({ code: ['mallf.zoneList', 'mallf.productList'] })(
  withRouter(ZoneSupplierList)
);
