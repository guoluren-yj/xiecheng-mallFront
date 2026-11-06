import React, { useEffect, useState } from 'react';
import { Line } from '@antv/g2plot';
import moment from 'moment';
import { connect } from 'dva';
import intl from 'utils/intl';
import CuxFn from '@/cuxTools/cuxFn';
import { getUserConfigInfo, priceNumberRender } from 'utils/utils';
import { fetchPriceChange } from '@/services/productDetailService';
import styles from './index.less';

function FinalPriceChart(props) {
  const nowMonth = new Date().getMonth() + 1;
  const nowYear = new Date().getFullYear();
  const { levelPath } = getUserConfigInfo();

  const dataArr = [];
  for (let i = 0; i <= 11; i++) {
    dataArr.unshift(
      nowMonth - i > 0 ? `${nowYear}/${nowMonth - i}` : `${nowYear - 1}/${nowMonth - i + 12}`
    );
  }

  const [noData, setNoData] = useState(false);
  const {
    productId,
    type,
    agreementType,
    hiddPrice,
    defaultPrecision,
    skuId,
    skuType,
    skuCode,
  } = props;
  const nameArray = [
    intl.get(`mallf.productDetail.model.historyPrice`).d('历史报价'),
    intl.get(`mallf.productDetail.model.historyFinalPrice`).d('历史成交价'),
  ];

  useEffect(() => {
    if (productId && agreementType && !hiddPrice) {
      renderFinalPrice();
    } else {
      setNoData(true);
    }
  }, [productId, agreementType, type, props.language, hiddPrice]);

  async function renderFinalPrice() {
    const res = await CuxFn({
      name: 'NewProductDetail-fn-fetchPriceChange',
      value: {
        type,
        productId,
        levelPath,
        agreementType,
        skuId,
        skuType,
        skuCode,
      },
    })(() =>
      fetchPriceChange({
        type,
        productId,
        levelPath,
        agreementType,
      })
    )();
    if (res?.length) {
      // const tmpArray = [...res].reverse();
      const dateArray = [];
      const x = moment();
      let y = moment().subtract('6', 'month').format('YYYY/MM/DD');
      let isData = false;
      // 从今天的六个月前开始，天数+1
      while (x.isSameOrAfter(y)) {
        dateArray.push({ time: y, price: +priceNumberRender(0, defaultPrecision) });
        y = moment(y).add('1', 'days').format('YYYY/MM/DD');
      }
      const newDateArray = dateArray.map((m) => {
        const isFind = res.find((f) =>
          moment(moment(f.changeDate).format('YYYY/MM/DD')).isSameOrBefore(m.time)
        );
        if (isFind) {
          isData = true;
          return { ...m, price: +priceNumberRender(isFind.currentPrice || 0, defaultPrecision) };
        } else {
          return m;
        }
      });
      const lineDom = document.getElementById(`finalPrice${type}`);
      if (isData && lineDom) {
        lineDom.innerHTML = '';
        const linePlot = new Line(lineDom, {
          title: {
            visible: true,
            text: `${nameArray[type - 1]}`,
          },
          description: {
            visible: true,
            text: `${newDateArray[0].time}-${newDateArray.slice(-1)[0].time}`.replace(/\s+/g, '-'),
          },
          forceFit: true,
          padding: 'auto',
          data: newDateArray,
          xField: 'time',
          yField: 'price',
          height: 255,
          width: 340,
          xAxis: {
            tickCount: 7,
            type: 'dateTime',
            label: {
              formatter: (val) => {
                return val.slice(-5).replace('-', '/');
              },
            },
          },
        });
        linePlot.render();
      } else {
        setNoData(true);
      }
    } else {
      setNoData(true);
    }
  }

  return (
    <div id={`finalPrice${type}`} className={styles.container}>
      {noData && (
        <div className="no-params">
          <p>{intl.get(`mallf.productDetail.view.noData`).d('暂无数据')}</p>
        </div>
      )}
    </div>
  );
}

export default connect(({ global }) => ({
  language: global.language,
}))(FinalPriceChart);
