import uuid from 'uuid/v4';
// import { getOpenCartFlag } from 'utils/configUtils';
import { checkRecordSame, recordsFilter, dataToCart, cartEqual, calcCartIsUngrouped } from './func';
import { groupField, groupTypeField } from './enum';

// 购物车默认勾选（根据视图判断1取cartId,2取__cartId）
const cartIsBack = (backCartIds, cartId) =>
  backCartIds.some((s) => s === cartId || Number(s) === cartId);

// 维度数据组合到购物车中
function composeDimValueToList(cartList, backIds, basketType) {
  return cartList.reduce((list, cartItem) => {
    let newList = [...list];
    const uuidNum = uuid();
    if (cartItem[groupField.groupFlag]) {
      newList.push({
        ...cartItem,
        [groupField.__cartId]: uuidNum,
        cartCheckBox__cloumn: uuidNum,
        action__cloumn: uuidNum,
        lineSelectBox__cloumn: uuidNum,
        cartColumnValueList: null,
      });
    } else {
      // 记录该分配头是否已经，用于判断是否为第一个分配头
      const assignHeaderNumMap = {};
      newList = [
        ...newList,
        ...(cartItem.cartColumnValueList?.map((dimVal, index, dims) => {
          // 分配头
          const headerNum = dimVal.headerNum || 1;
          // 分配行
          const lineNum = dimVal.lineNum || 1;
          // 明细视图唯一值：cartId+分配头+分配行
          const __cartId = `${cartItem.cartId}_${headerNum}_${lineNum}`;
          const columnId = basketType ? uuidNum : `${cartItem.cartId}__cloumn`;

          // 同一个分配头的长度
          const sameAssignLength = dims.filter((f) => (f.headerNum || 1) === headerNum).length;

          // 订单链路按分配头合并
          const assignHeaderRows =
            cartItem.linkType === 'ORDER'
              ? assignHeaderNumMap[headerNum]
                ? 0
                : sameAssignLength
              : 1;

          const newItem = {
            ...cartItem,
            headerNum,
            lineNum,
            [groupField.__cartId]: __cartId,
            // 给第一条记录当前商品组的 __cartId
            cartCheckBox__cloumn: columnId,
            action__cloumn: columnId,
            lineSelectBox__cloumn: __cartId,
            currentDimValue: dimVal,
            cartColumnValueList: null,
            [groupField.groupCheckField]: basketType ? 'centralizedTemplateId' : 'cartId,headerNum',
            [groupField.isSelected]: cartIsBack(backIds, __cartId),
            [groupField.firstHeaderLineLength]: assignHeaderRows,
          };

          assignHeaderNumMap[headerNum] = true;
          if (index === 0) {
            // 商品聚合需要的数据
            newItem[groupField.__cartIds] = cartItem.cartColumnValueList?.map(
              (p) => `${cartItem.cartId}_${p.headerNum}_${p.lineNum}`
            );
            newItem.lineErrorMessages = cartItem.cartColumnValueList
              .map((dim) => dim.errorMessage)
              .filter(Boolean);
          }
          newItem[groupField.firstLine] = index === 0;
          dimVal.cartDimValueList.forEach((field) => {
            if (field.dimensionCode === 'quantity') {
              newItem.totalQuantity = field.valueName || field.value;
            }
            if (field.dimensionCode === 'taxIncludedAmount') {
              newItem.total = field.valueName || field.value;
              newItem.taxIncludedAmount = field.value;
            }
            if (field.dimensionCode === 'unitPrice') {
              newItem.unitPrice = field.valueName || field.value;
            }
            newItem[`${field.dimensionType}_${field.dimensionCode}`] =
              field.valueName || field.value;
            newItem[`${field.dimensionType}_${field.dimensionCode}_value`] = field.value;
          });
          // 申请链路
          if (cartItem.linkType === 'REQUEST') {
            newItem.totalCqNum = dimVal.totalCqNum; // 定制品数量
          }
          return newItem;
        }) || []),
      ];
    }
    return newList;
  }, []);
}

// 将PO数据分组
export function assignPoGroup(data) {
  return data
    .reduce((p, c) => {
      const isSameIndex = p.findIndex((arr) =>
        arr.some((s) => checkRecordSame(s, c, c[groupField.groupCheckField]))
      );
      if (isSameIndex > -1) {
        p[isSameIndex].push(c);
      } else {
        p.push([{ ...c, [groupField.groupFlag]: true, cartId: uuid() }, c]);
      }
      return p;
    }, [])
    .reduce((p, c) => p.concat(c), []);
}

// 找到分配模版
export function getDimensionTemplateDTO(templateResultDTOList, item) {
  const templateList = templateResultDTOList || [];
  const { dimensionTemplateDTO } =
    templateList.find((f) => {
      return f.unitId === item.unitId && f.templateStyle === item.templateStyle;
    }) || {};
  return dimensionTemplateDTO;
}

/**
 * @description 数据构造然后回填至dataSet的方法
 * @param {DataSet} dataSet 数据实例
 * @param {Object} resp 购物车查询返回结果
 */
export default function loadCartData(dataSet, resp) {
  const { content, templateResultDTOList } = resp;
  let groupFlag = false; // 判断是否存在分组
  // 上次选中的数据
  const lastSelected = recordsFilter(dataSet.selected); // cartId,qtHeaderNo
  // 本次需要加载的数据
  const cartList = content || [];
  // 再来一单的购物车id集
  const againIds = dataSet.againCartIds || [];
  // 返回购物车的id集
  const backIds = dataSet.backCartIds || [];
  // 判断是否为再来一单，打上标记
  const cartIsAgain = (cart) =>
    againIds.some((s) => s === cart.cartId || Number(s) === cart.cartId);
  // basketType判断是否需要聚合展示拼单商品（下单人）
  const centralizeAggregation = dataSet.basketType === 'order';
  // skuCollections一个固定长度的二维数组，[[], [], []],依次为po商品集、拼单商品集、其他商品集
  const skuCollections = cartList.reduce(
    (collections, currentSku) => {
      const [poSku, centralizedSku, otherSku] = collections;
      // 构造购物车数据
      const newCurrentSku = {
        ...dataToCart(currentSku, dataSet),
        [groupField.againFlag]: cartIsAgain(currentSku),
        [groupField.isSelected]: cartIsAgain(currentSku) || cartIsBack(backIds, currentSku.cartId),
      };
      const dimensionTemplateDTO = getDimensionTemplateDTO(templateResultDTOList, currentSku);
      // 找到模板就给赋值
      if (dimensionTemplateDTO) {
        newCurrentSku.dimensionTemplateDTO = dimensionTemplateDTO;
      }
      // 只有是新的查询数据才添加isSelected属性
      if (!(groupField.isSelected in newCurrentSku)) {
        newCurrentSku[groupField.isSelected] = lastSelected.some((s) => cartEqual(s, currentSku));
      }
      if (centralizeAggregation) {
        centralizedSku.push({
          ...newCurrentSku,
          [groupField.groupCheckField]: 'centralizedTemplateId',
        });
        return collections;
      }
      // 存在po商品或者拼单商品groupFlag设为true
      if (newCurrentSku[groupField.type] === groupTypeField.po) {
        poSku.push(newCurrentSku);
        groupFlag = true;
      } else {
        otherSku.push(newCurrentSku);
      }
      return collections;
    },
    [[], [], []]
  );
  skuCollections[0] = assignPoGroup(skuCollections[0]); // 重组po商品
  skuCollections[1] = assignPoGroup(skuCollections[1]); // 重组拼单商品
  // 存在拼单或po的同时其他商品也有，用来判断顶部和底部全选框显示
  const isOtherGorup = groupFlag && skuCollections[2].length > 0;
  const cartViewType = dataSet.getState('cartViewType') || 1;
  // 存在拼单或po的同时其他商品也有，构造一条分组头
  if (isOtherGorup && calcCartIsUngrouped(dataSet)) {
    const groupHeader = { ...skuCollections[2][0], [groupField.groupFlag]: true, cartId: uuid() };
    skuCollections[2].unshift(groupHeader);
  } else if (cartViewType === 1 && !calcCartIsUngrouped(dataSet) && skuCollections[2].length > 0) {
    // 聚合视图的 供应商/物料 分组
    const groupType = dataSet.getState('groupType');
    const newTypeList = skuCollections[2].reduce(
      (pre, cur, index) => {
        const curType = cur[groupType];
        const firstCur = [{ ...cur, [groupField.groupFlag]: true, cartId: uuid() }, cur]; // 给第一个加个分组头
        if (!index) {
          // 默认第一个
          return [firstCur];
        }
        const fIndex = pre.findIndex((p) => p[0][groupType] === curType);
        if (fIndex === -1) {
          pre.push(firstCur);
        } else {
          pre[fIndex].push(cur);
        }
        return pre;
      },
      [[]]
    );
    skuCollections[2] = newTypeList.flat(1);
  }
  // 最终将数据集扁平化成需要回填至用于渲染购物车的数据
  const newCartList = skuCollections.reduce((p, c) => p.concat(c), []);
  // 用来判断顶部和底部全选框显示
  dataSet.setState('isCheckAll', !isOtherGorup);

  if (cartViewType === 2) {
    const newCartLineList = composeDimValueToList(newCartList, backIds, dataSet.basketType);
    dataSet.loadData(newCartLineList);
  } else if (dataSet.basketType === 'order') {
    // 拼单下单人做了聚合，没有饭回cartId
    dataSet.loadData(newCartList.map((n) => ({ cartId: uuid(), ...n })));
  } else {
    dataSet.loadData(newCartList);
  }
}
