import React, { useMemo, useState, useEffect } from 'react';
import qs from 'qs';
import { connect } from 'dva';
import { compose, isEmpty } from 'lodash';
import { Icon } from 'choerodon-ui';
import { Button } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import * as echarts from 'echarts';

import BreadCrumbs from 'components/BreadCrumbs';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import styles from './index.less';
import Productlist from './Product';

function PriceCompareList(props) {
  const {
    location,
    history: {
      location: { state: params = {} },
    },
    hideFieldList,
  } = props;
  const searchData = qs.parse(location.search.substr(1));
  const { breadcrumbData = {} } = params;
  const [chartDTO, setChartDTO] = useState({});
  const lineRef = React.useRef(null);
  const [echartsInstance, setEchartsInstance] = useState(null);
  // const AiCompare = +searchData.autoFlag === 2;

  useEffect(() => {
    if (lineRef.current && !isEmpty(chartDTO)) {
      const instance = echarts.init(lineRef.current);
      setEchartsInstance(instance);

      // 清理函数
      return () => {
        instance.dispose();
      };
    } else if (echartsInstance) {
      echartsInstance.dispose();
      setEchartsInstance(null);
    }
  }, [lineRef.current, chartDTO]);

  const option = useMemo(() => {
    if (isEmpty(chartDTO)) {
      return {};
    }
    const { xAxis = [], series = [] } = chartDTO;
    return {
      grid: {
        left: 57,
        right: 20,
        top: 57,
        bottom: 57,
      },
      tooltip: {
        trigger: 'item',
        axisPointer: {
          type: 'none',
        },
      },
      legend: {
        type: 'scroll',
        top: 15,
        itemWidth: 8,
        itemHeight: 8,
        align: 'auto',
        data:
          series &&
          series.map((item) => ({
            name: item.name,
            icon: 'rect',
          })),
      },
      xAxis: {
        type: 'category',
        data: xAxis,
        axisLine: {
          lineStyle: {
            color: '#E5E7EC',
          },
        },
        axisLabel: {
          color: '#191919',
        },
        axisTick: {
          show: false,
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#E5E7EC',
          },
        },
        axisLabel: {
          color: '#191919',
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
        axisTick: {
          show: false,
        },
      },
      series: series && series.map((item) => ({ ...item, type: 'line', symbolSize: 8 })),
    };
  }, [chartDTO]);

  useEffect(() => {
    if (echartsInstance && option && !isEmpty(chartDTO)) {
      echartsInstance.setOption(option, true);
    }
  }, [echartsInstance, option, chartDTO]);

  return (
    <React.Fragment>
      <div className={styles['price-compare-container']}>
        <BreadCrumbs
          value={{
            pageTitle: breadcrumbData.pageName,
            childTitle1: intl.get(`mallf.priceCompare.view.pageTitle`).d('比价单'),
          }}
        />
        {hideFieldList !== undefined && (
          <Productlist {...searchData} hideFieldList={hideFieldList} setChartDTO={setChartDTO} />
        )}
        {/* {AiCompare && (
          <>
            <div className="compare-title">
              <span>{intl.get('mallf.priceCompare.view.lineChart').d('商品分析')}</span>
              <Tooltip
                placement="top"
                title={intl
                  .get('mallf.common.view.priceCompareListTips')
                  .d('本分析依据历史下单记录呈现商品价格走势，仅作决策参考之用。')}
              >
                <Icon type="help" style={{ color: '#888', marginLeft: 5, fontSize: 14 }} />
              </Tooltip>
            </div>
            <div className="price-compare-line" ref={lineRef} />
          </>
        )} */}
        <div className="price-compare-footer">
          <Button
            r-if={+searchData.autoFlag !== 1}
            color="primary"
            size="large"
            style={{ float: 'right', marginLeft: 10 }}
            onClick={() => {
              props.history.push('/products-compare');
            }}
          >
            {intl.get('mallf.priceCompare.model.returnCompare').d('返回对比')}
          </Button>
          <Button
            style={{ float: 'right' }}
            size="large"
            funcType={+searchData.autoFlag !== 1 ? 'flat' : 'raised'}
            color="primary"
            onClick={() => props.history.push('/cart')}
          >
            {intl.get('mallf.priceCompare.model.toCart').d('去购物车')}
          </Button>
          <p className="tips">
            <Icon type="info" style={{ color: '#FCA000', marginRight: 6, fontSize: 14 }} />
            {intl.get('mallf.priceCompare.model.addCartTips').d('比价单主商品已添加至购物车')}
          </p>
        </div>
      </div>
      {/* </Spin> */}
    </React.Fragment>
  );
}

export default compose(
  withRouter,
  formatterCollections({ code: ['mallf.priceCompare'] }),
  connect(({ global }) => ({
    hideFieldList: global.hideFieldList,
  }))
)(PriceCompareList);
