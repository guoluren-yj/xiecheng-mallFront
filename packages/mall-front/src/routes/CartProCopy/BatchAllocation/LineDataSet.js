import { DataSet } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { toJS } from 'mobx';
import CuxFn from 'cuxTools/cuxFn';

import {
  handleAssociatField,
  handleLovCascadeList,
  getDimensionCode,
} from '../ProductAllocation/func';
import ChildrenDataSet from './ChildrenDataSet';
import { childTableDataset } from './func';
import { lineDimensionUpdate } from '../ProductAllocation/dataSet';

export default class LineDataSet extends DataSet {
  constructor(props, lineProps) {
    super(props);
    this.lineProps = lineProps;
  }

  addLine(headerDs) {
    this.create({}, this.length);
    this.initChildrenDs();
    headerDs.set('conditionExpressionFlag', !headerDs.get('conditionExpressionFlag'));
  }

  // 手工模版下 获取行单位字段是否参与批量 不批量需处理精度和数量
  getManulUomIdBatchFlag(hasManulFlag) {
    const { dimensionList = [] } = this.lineProps || {};
    const { dimension = {} } =
      dimensionList.find(
        (n) => getDimensionCode(n) === 'uomIdLov' && n.dimension.dimensionType.includes('LINE')
      ) || {};
    const { batchFlag } = dimension;
    return hasManulFlag && !!batchFlag;
  }

  // 初始化子表格
  initChildrenDs(hasManulFlag = false) {
    this.records.forEach((line) => {
      if (!line.childrenDs) {
        CuxFn({
          name: 'BatchAllocation-fn-initChildrenDs',
          value: {
            _this: this,
            line,
            ChildrenDataSet,
            childTableDataset,
            hasManulFlag: false,
          },
        })(() => {
          const manulUomIdBatchFlag = this.getManulUomIdBatchFlag(hasManulFlag);
          const childrenDs = new ChildrenDataSet(
            childTableDataset({ partentRecord: line, hasManulFlag, manulUomIdBatchFlag })
          );
          const childData = toJS(line.get('batchProductList')) || [];

          // eslint-disable-next-line no-param-reassign
          line.childrenDs = childrenDs;
          // 是手工且单位参与批量，单位和数量置空
          if (manulUomIdBatchFlag) {
            line.set('uomIdLov', null);
          }
          line.childrenDs.loadData(
            childData.map((n) => ({ ...n, quantity: manulUomIdBatchFlag ? null : n.quantity }))
          );
        })();
      }
    });
  }

  update({ name, record, value, oldValue }) {
    const { dimensionList, headerRecord, hasManulFlag } = this.lineProps;
    const { dimension = {}, dimensionComponent = {}, dimensionFieldRelationList = [] } =
      dimensionList.find(
        (n) => name === getDimensionCode(n) && n.dimension.dimensionType.includes('LINE')
      ) || {};

    if (hasManulFlag && name === 'itemIdLov') {
      record.childrenDs.forEach((r) => {
        r.set('quantity', null);
      });
    }
    if (hasManulFlag && name === 'uomIdLov') {
      record.childrenDs.forEach((r) => {
        r.set('quantity', null);
      });
    }
    if (!name.includes('fx')) {
      // 值集参数关联的字段集合
      const cascadeList = handleLovCascadeList({
        dimension,
        dimensionComponent,
        value,
        oldValue,
        dimensionList,
        name,
      });
      cascadeList.forEach((c) => {
        record.set(`${c.dimension?.dimensionCode}Lov`, null);
      });
    }
    // 值集关联字段
    if (name.includes('Lov') && !isEmpty(dimensionFieldRelationList)) {
      handleAssociatField({
        currentDimensiontype: dimension.dimensionType,
        dimensionList,
        record,
        dimensionFieldRelationList,
        currentData: value,
      });
    }

    // 行字段联动
    lineDimensionUpdate({ dimensionList, headerRecord, lineRecord: record });
  }
}
