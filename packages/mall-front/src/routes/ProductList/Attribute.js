// 管理属性筛选
import { observable, action, computed, toJS } from 'mobx';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';

// 属性记录类
class AttributeRecord {
  constructor(data, attribute) {
    this.attribute = attribute;
    this.init(data);
  }

  // 子属性记录（如供应商的商品来源）
  subRecord;

  // 子属性属性值
  @observable subItems = [];

  // 品牌map数据记录
  brandMap = {};

  // 字母排序数组
  @observable brandArrs = [];

  // 属性数据
  @observable data = {};

  // 多选是否开启
  @observable multiple = false;

  // 是否展开
  @observable isExpand = false;

  // 已选中的属性值
  @observable selected = [];

  // 品牌搜索框双向绑定值
  @observable filterValue = '';

  // 品牌首字母筛选记录CODE
  @observable brandCode = 'ALL';

  // 计算得到当前属性是否隐藏（存在筛选）|| 属性值不存在
  @computed get hidden() {
    const items = this.get('attrValueList') || [];
    return this.attribute.attrIsQuery(this.data.attrName) || items.length < 1;
  }

  // 计算得到当前属性记录属性值
  @computed get items() {
    // 子记录存在同时子记录不隐藏则合并显示子属性属性值
    const subItems = this.subRecord && !this.subRecord.hidden ? toJS(this.subItems) : [];
    const currentItems = toJS(this.data.attrValueList) || [];

    // 属性为品牌时特殊处理
    if (this.get('attrCode') === 'brand') {
      // 所有品牌才进行筛选
      const brandItems = this.brandMap[this.brandCode] || [];
      if (this.brandCode === 'ALL') {
        return brandItems.filter((f) => f.meaning.includes(this.filterValue));
      } else {
        return brandItems;
      }
    }

    return [...subItems, ...currentItems];
  }

  // 计算得到当前记录是否必输且属性值唯一（用于判断默认填充筛选条件（以及面包屑））
  @computed get readOnly() {
    return this.get('requiredFlag') === 1 && this.items.length === 1;
  }

  // 初始化记录
  @action
  init(data) {
    // 数据绑定
    this.data = data;
    // 处理品牌
    if (data.attrCode === 'brand') {
      // 品牌字母筛选数据
      const brand = this.attribute.brandMap;
      this.brandMap = brand;

      // 所有品牌
      this.brandArrs.push({
        code: 'ALL',
        meaning: intl.get('mallf.common.productList.brand.all').d('所有品牌'),
      });

      // 首字母筛选品牌
      Object.keys(brand).forEach((f) => {
        this.brandArrs.push({
          code: f,
          meaning: f,
        });
      });

      // 其他品牌
      if (brand.otherBrand) {
        this.brandArrs.push({
          code: 'otherBrand',
          meaning: intl.get('mallf.common.productList.brand.other').d('其他'),
        });
      }

      // 设置所有品牌
      this.brandMap.ALL = data.attrValueList;
    }
  }

  // 重置记录特性（暂时因为每次操作后都会重新实例化所有记录而用不上）
  @action
  reset() {
    this.selected = [];
    this.multiple = false;
    this.isExpand = false;
    this.filterValue = '';
    this.brandCode = 'ALL';
  }

  // 设置查询参数
  @action
  setFilterValue(val) {
    this.brandCode = 'ALL';
    this.filterValue = val || '';
  }

  // 设置子记录
  @action
  setSubRecord(record) {
    this.subRecord = record;
    // 子记录属性值构造
    this.subItems = (record.get('attrValueList') || []).map((m, ind, arr) => ({
      ...m,
      subAttrName: record.get('attrName'),
      subAttrCode: record.get('attrCode'),
      lastSubItem: ind === arr.length - 1,
    }));
  }

  // 获取当前记录数据属性
  get(key) {
    return this.data[key];
  }

  // 属性值确认方法，触发整个属性实力查询回调
  @action
  confirm() {
    this.attribute.attrQueryCallback(this);
  }
}

// 属性管理类
export default class Attribute {
  // 属性数据
  @observable attrs = [];

  // 固定属性记录
  @observable records = [];

  // 高级属性记录（动态自定义）
  @observable customRecords = [];

  // 属性筛选步骤,考虑后续可能会跨属性多选查询，采用二维数组形式（方面面包屑记录每一次筛选）
  // [[{ attrName, attrCode, attrMeaningStr, attrQueryValues }, {}], [{ attrName, attrCode, attrMeaningStr, attrQueryValues }, {}]]
  @observable querySteps = [];

  // 属性查询面包屑
  @computed get attrBreadCrumbs() {
    return this.querySteps.map((attrs, index) => {
      return {
        text: attrs.map((attr) => `${attr.attrName}：${attr.attrMeaningStr}`).join('；'),
        remove: () => this.removeStep(index),
      };
    });
  }

  // 校验记录集，计算得到存在必输却没有选中属性值的属性记录集
  @computed get validationRecords() {
    const records = [];
    this.records.forEach((record) => {
      const attrName = record.get('attrName');
      if (
        record.get('requiredFlag') === 1 &&
        !this.attrIsQuery(attrName) &&
        record.items.length > 0
      ) {
        records.push(record);
      }
    });
    return records;
  }

  // 所有属性是否隐藏
  @computed get hidden() {
    return !(this.records.some((s) => !s.hidden) || this.customRecords.some((s) => !s.hidden));
  }

  // 事件绑定（可用于触发查询方法）
  constructor(events) {
    this.events = events || {};
  }

  // 品牌code记录，在每次load方法触发之前设置
  brandMap = {};

  // 初始化属性记录集
  @action
  load = (data) => {
    const attrs = data || [];
    const records = [];
    const customRecords = [];
    const defaultQueryRecords = [];

    // 商品来源需设置为供应商的子记录
    // 供应商是否存在
    const supplierFlag = attrs.some((s) => s.attrCode === 'supplier');
    let sourceRecord;
    let supplierRecord;

    attrs.forEach((m) => {
      const record = new AttributeRecord(m || {}, this);

      // 商品来源记录
      if (m.attrCode === 'sourceFrom') {
        sourceRecord = record;
      }
      // 供应商记录
      if (m.attrCode === 'supplier') {
        supplierRecord = record;
      }
      // 需要默认选中的查询
      if (record.readOnly) {
        record.selected = record.items;
        defaultQueryRecords.push(record);
      }
      if (m.customFlag === 1) {
        customRecords.push(record);
        // 供应商存在且当前记录为商品来源不责不进行存储
      } else if (!(supplierFlag && m.attrCode === 'sourceFrom')) {
        records.push(record);
      }
    });

    // 插入默认查询面包屑
    this.addQuery(defaultQueryRecords, true);

    // 给供应商设置子记录
    if (sourceRecord && supplierRecord) {
      supplierRecord.setSubRecord(sourceRecord);
    }

    this.attrs = attrs;
    this.records = records;
    this.customRecords = customRecords;
  };

  // 添加事件
  addEvent(eventName, event) {
    if (this.events) {
      this.events[eventName] = event;
    } else {
      this.events = { [eventName]: event };
    }
  }

  // 分发所绑定的事件
  @action
  triggerEvent(eventName, ...rest) {
    const { [eventName]: propEvent = () => {} } = this.events || {};
    if (typeof propEvent === 'function') {
      propEvent(...rest);
    }
  }

  // 属性记录选中确认后回调（先设置查询参数以及面包屑，然后触发接口查询）
  attrQueryCallback(record) {
    this.addQuery([record]);
    this.triggerEvent('query');
  }

  // 添加或插入属性集（一次属性查询操作=一个面包屑）(插入的查询条件聚合进上一次面包屑中)
  @action
  addQuery(records, insert) {
    const currentQuery = [];
    records.forEach((f) => {
      const attrName = f.get('attrName');
      const attrQueryValues = [];
      const attrQueryMeanings = f.selected.map((m) => {
        attrQueryValues.push(m.code || m.meaning);
        return m.meaning;
      });
      if (!this.attrIsQuery(attrName)) {
        currentQuery.push({
          attrName,
          attrCode: f.get('attrCode'),
          attrMeaningStr: attrQueryMeanings.join('、'),
          attrQueryValues,
        });
      }
    });
    if (currentQuery.length > 0) {
      // 插入聚合至上一次属性面包屑
      if (insert) {
        const lastQuery = this.querySteps.pop() || [];
        const newLastQuery = [...lastQuery, ...currentQuery];
        this.querySteps.push(newLastQuery);
      } else {
        this.querySteps.push(currentQuery);
      }
    }
  }

  // 移除面包屑
  @action
  removeStep(stepIndex) {
    this.querySteps.splice(stepIndex, 1);
    this.triggerEvent('query');
  }

  // 用于给接口获取此次属性的筛选参数attribute
  getQuery() {
    const attribute = { ...this.query };
    const queryAttrs = toJS(this.querySteps);
    queryAttrs.forEach((attrs) => {
      attrs.forEach((attr) => {
        attribute[attr.attrName] = attr.attrQueryValues;
      });
    });
    return filterNullValueObject(attribute);
  }

  // 属性是否存在查询条件
  attrIsQuery(attrName) {
    return !!this.getQuery()[attrName];
  }
}
