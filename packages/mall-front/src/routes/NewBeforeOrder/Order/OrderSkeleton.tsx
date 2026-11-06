import React, { useMemo, useEffect } from 'react';
import { Skeleton, DataSet } from 'choerodon-ui/pro';
import { isPlainObject } from 'lodash';
import moment from 'moment';

import { getUserConfig, getCurrentOrganizationId, getOrganizationId } from 'utils/utils';
import { useCustomizeDataSet, useDefaultValueReaction } from 'srm-front-scuz/lib/custC7NX/hooks';
import Customize from 'srm-front-scuz/lib/Customize';
import lineDs from '../CustomizeModal/lineDs';

interface SkeleProps {
  index: number,
  height?: number,
  dataSet: DataSet,
  code: string,
  lineCode: string,
  products: any[],
  getHocInstance: Function,
  [extProp: string]: any,
};

export default function OrderSkeleton(props: SkeleProps) {
  const {
    index,
    height = 800,
    dataSet,
    code,
    lineCode,
    products,
    getHocInstance,
  } = props;
  const { cache, custConfig } = useMemo(() => getHocInstance(), []) as Customize;
  const ds = useMemo(() => new DataSet(lineDs()), []);
  const customize = {
    cache,
    custConfig,
    contextParams: {
      ctx: { organizationId: getOrganizationId(), tenantId: getCurrentOrganizationId() },
      self: { ...getUserConfig() },
    } as any,
  };
  cache[code].init = true;
  cache[code].type = "collapseForm";
  cache[code].dataSet = dataSet;
  cache[code].getValue = (fieldCode) => {
    if (dataSet.current) {
      const field = dataSet.getField(fieldCode);
      const value = dataSet.current.get(fieldCode);
      if (field && value) {
        const multiple = field.get('multiple');
        const valueField = field.get('valueField') || '__notconfig__';
        if (multiple && typeof value === 'object' && value.toJS) {
          return value
            .toJS()
            .map(i => (typeof i === 'object' ? i[valueField] || '' : i))
            .join(',');
        }
        if (isPlainObject(value)) {
          return value[valueField];
        }
        if (moment.isMoment(value)) {
          switch (field.type) {
            case 'dateTime':
              return value.format('YYYY-MM-DD HH:mm:ss');
            case 'date':
            default:
              return value.format('YYYY-MM-DD');
          }
        }
      }
      return value;
    }
  };
  const reactionFields = useMemo(() => {
    if (dataSet) {
      return useCustomizeDataSet(
        { dataSet, code },
        customize
      );
    }
    return [];
  }, [dataSet, code]);
  useDefaultValueReaction(dataSet, reactionFields, code);
  const lineReactionFields = useMemo(() => {
    if (ds && dataSet) {
      return useCustomizeDataSet(
        { dataSet: ds, code: lineCode },
        customize
      );
    }
    return [];
  }, [ds, dataSet, code, cache]);
  useDefaultValueReaction(ds, lineReactionFields, lineCode);

  useEffect(() => {
    products.forEach((product) => {
      const p = product;
      // eslint-disable-next-line no-param-reassign
      product.DS = ds.create(p);
    });
  }, [products]);

  return (
    <div id={`${index}`} key={`order_${index}`} className="order-wrapper" style={{ height }}>
      <div className="order-header" />
      <div style={{ padding: 20 }}>
        <Skeleton />
      </div>
    </div>
  );
}
