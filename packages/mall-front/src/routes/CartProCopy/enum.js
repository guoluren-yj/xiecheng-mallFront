// 前端数据标识字段,可使用cartToJSONData过滤
export const groupField = {
  type: '__type', // 商品类型：basic、receive、po、centralized
  groupFlag: '__groupFlag', // boolean 判断是否为虚拟头
  groupType: '__groupType', // 分组规则： 其他商品：other(basic、receive)、 punchout商品：po、拼单商品：centralized
  groupCheckField: '__groupCheckField', // 'id,code,name' 组内勾选联动判断字段
  isSelected: '__isSelected', // boolean 判断数据是否默认选中
  againFlag: '__againFlag', // boolean 判断数据是否为再来一单
  businessType: '__businessType', // 业务类型: 拼单商品：centralized、领用商品：receive、采购商品：purchase(basic、po)
  __cartId: '__cartId', // 根据cartId，headerNumber,lineNum 构造出的主键
  __cartIds: '__cartIds', // 商品组，存不同维度
  firstLine: '__first_line', // 第一行标识
  firstHeaderLineLength: '__first_header_line_length', // headerNum相同的长度
  firstLineRowSpan: '__first_line_rowspan', // 第一行rowspan
  groupColumn: '__group__column', // 分组的表头name
  componentType: '__componentType', // 组件类型
};

// 按商品类型
export const typeField = {
  po: 'po', // 代表po商品
  basic: 'basic', // 代表普通商品
  receive: 'receive', // 代表领用商品
  centralized: 'centralized', // 代表拼单商品
};

// 按分组类型：punchout（多维度）、拼单商品、其他商品（领用、普通）
export const groupTypeField = {
  po: 'po',
  other: 'other',
  centralized: 'centralized',
};

// 按业务类型：领用商品、采购商品（拼单、普通）、拼单商品
export const businessTypeField = {
  receive: 'receive',
  purchase: 'purchase',
  centralized: 'centralized',
};

// 判断同组勾选字段
export const checkValueField = {
  // 其他商品勾选
  otherCheck: '__otherCheck',
  // 拼单勾选值
  centralizedCheck: '__centralizedCheck',
  // 聚合视图分组
  supplierCompanyName: '__supplierCompanyName',
  itemCode: '__itemCode',
};

// 判断同组勾选字段值
export const checkFieldValue = {
  // 其他商品勾选
  checkOther: 'checkOther',
  // 拼单勾选值
  checkCentralized: 'checkCentralized',
  // 聚合视图分组
  supplierCompanyName: 'supplierCompanyName',
  itemCode: 'itemCode',
};

// 购物车下一步校验字段（需要过滤）
export const validFieldArray = [
  'noErrorFlag',
  'errorCode',
  'errorMessage',
  'success',
  'productGiftStockFlag',
];

export const headerGroupTypeFields = {
  ungrouped: 'ungrouped',
  supplierCompanyName: 'supplierCompanyName',
  itemCode: 'itemCode',
};

export const cartGroupType = {
  ungrouped: 0,
  supplierCompanyName: 1,
  itemCode: 2,
};

export const cartGroupTypeIcon = {
  ungrouped: 'shopping_basket',
  supplierCompanyName: 'store_mall_directory',
  itemCode: 'microservice',
};
