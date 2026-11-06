import React, { useEffect, useMemo, useRef } from 'react';
import { uniqBy, isEmpty } from 'lodash';
import { Checkbox, Spin, Icon, Breadcrumb } from 'choerodon-ui';
import { Button, Modal, Tooltip } from 'choerodon-ui/pro';

import Link from 'components/Link';
import formatterCollections from 'utils/intl/formatterCollections';
import Icons from 'components/Icons';
import useSetState from '@/hooks/useState';
import useDimensTemplates from '@/hooks/useDimensTemplates';
import Image from 'components/Image';
import Swal from 'components/swal';
import AddressLov from 'components/AddressLov';
import intl from 'utils/intl';
import { getProductDetail, getProductSku } from '@/services/productDetailService';
import { math } from 'choerodon-ui/dataset';
import {
  getStorage,
  setStorage,
  getUserConfigInfo,
  getPrimaryColor,
  getCacheAddress,
} from 'utils/utils';
import { SpanTitle, ShowManuallyCompare, validCompareLimit } from 'utils/renderer';
import OverflowTip from 'components/OverflowTip';
import styles from './index.less';
import ProductList from './ProductList';
import handlePriceCompare from './handlePriceCompare';
import openPrint from './comparePrint';

function ProductsCompare(props) {
  const {
    history: {
      location: { state: _state = {} },
    },
  } = props;
  const { breadcrumbs = [] } = _state;
  const { userId, regionId, levelPath, companyId, defaultAddress } = getUserConfigInfo();
  const dimensTemplates = useDimensTemplates();
  const addressRef = useRef();
  const [state, setState] = useSetState({
    addPriceLoading: false,
    data: (getStorage(`${userId}_attr_compare`) || [{}, {}, {}, {}]).map((m) => ({
      ...m,
      selected: true,
    })),
    loading: false,
    attrs: [],
    hideSame: false,
    showDiff: false,
    currentData: getStorage(`${userId}_attr_compare`) || [{}, {}, {}, {}],
    count: 1, // 页数
    num: 3,
    fixData: [{ ...(getStorage(`${userId}_attr_compare`) || [{}])[0], selected: true }],
  });

  const {
    data,
    attrs,
    hideSame,
    showDiff,
    loading,
    addPriceLoading,
    currentData,
    count,
    fixData,
    num,
  } = state;
  const page = useMemo(() => math.ceil((data.length - fixData.length) / num), [
    data.length,
    fixData.length,
  ]);

  const onScroll = () => {
    const ele1 = document.getElementById('price-compare-first');
    if (document.documentElement.scrollTop > 240) {
      if (page > 1) {
        if (document.getElementById('price-compare-btn-left')) {
          document.getElementById('price-compare-btn-left').style.display = 'none';
        }
        if (document.getElementById('price-compare-btn-right')) {
          document.getElementById('price-compare-btn-right').style.display = 'none';
        }
        if (document.getElementById('price-compare-btn-left1')) {
          document.getElementById('price-compare-btn-left1').style.display = 'block';
        }
        if (document.getElementById('price-compare-btn-right1')) {
          document.getElementById('price-compare-btn-right1').style.display = 'block';
        }
      }
      ele1.style.position = `fixed`;
      ele1.style.top = `60px`;
      ele1.style.zIndex = '1';
    } else {
      if (page > 1) {
        if (document.getElementById('price-compare-btn-left')) {
          document.getElementById('price-compare-btn-left').style.display = 'block';
        }
        if (document.getElementById('price-compare-btn-right')) {
          document.getElementById('price-compare-btn-right').style.display = 'block';
        }
        if (document.getElementById('price-compare-btn-left1')) {
          document.getElementById('price-compare-btn-left1').style.display = 'none';
        }
        if (document.getElementById('price-compare-btn-right1')) {
          document.getElementById('price-compare-btn-right1').style.display = 'none';
        }
      }
      ele1.style.position = `absolute`;
      ele1.style.top = `0`;
      ele1.style.zIndex = '-1';
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', onScroll, false);

    return () => {
      window.removeEventListener('scroll', onScroll, false);
    };
  }, []);

  useEffect(() => {
    setState({
      currentData: getCurrentData(data, count),
    });
  }, [fixData]);

  useEffect(() => {
    const newData = [...data];
    newData.forEach((item, index) => {
      newData[index].filterStack =
        item.similarData &&
        item.similarData.map((dimObj) => {
          const { dim, saleAttrList } = dimObj;
          const selected = saleAttrList.find(
            (idsObj) => idsObj.skuIds && idsObj.skuIds.includes(item.productId)
          );
          return {
            dim, // 过滤的诶度 id
            ...selected, // 选中维度值的属性
          };
        });
    });
    initData(newData);
  }, []);

  /**
   * 数据初始化
   * @param {*} 传入数据
   */
  function initData(UUdata) {
    const newData = [...UUdata];
    const newSaleAttrs = [];
    const newBaseAttrs = [];
    while (newData.length < 4) {
      newData.push({});
    }
    newData.forEach((item, index) => {
      newData[index].attrs = {};
      if (item.similarData) {
        // 处理销售属性
        item.similarData.forEach((similar) => {
          newData[index].attrs = {
            ...newData[index].attrs,
            [similar.saleName]: similar,
          };
        });
      }

      if (item.productSkuAttrDTOS) {
        // fix 发现后端一个bug 例如：销售属性为颜色居然没有带出来，我暂时先手动加上去
        item.similarData.forEach((s) => {
          if (!item.productSkuAttrDTOS.some((l) => l.attrName === s.saleName)) {
            item.productSkuAttrDTOS.push({ attrName: s.saleName });
          }
        });

        // 处理基本属性
        item.productSkuAttrDTOS.forEach((productSku) => {
          const saleAttrValue = newData[index].attrs[productSku.attrName]; // 已包含的销售属性 例如产地
          if (saleAttrValue && saleAttrValue.saleAttrList) {
            // 如果产地下面是 销售属性
            saleAttrValue.saleAttrList.forEach((saleAttr, i) => {
              if (
                newData[index].filterStack.some(
                  (p) => p.saleValue && p.saleValue === saleAttr.saleValue
                )
              ) {
                // 找到对应该属性值标红
                saleAttrValue.saleAttrList[i].active = true;
              } else if (saleAttrValue.saleAttrList[i].active) {
                saleAttrValue.saleAttrList[i].active = null;
              }
            });
          } else {
            newData[index].attrs = {
              ...newData[index].attrs,
              [productSku.attrName]: productSku.description,
            };
          }
        });
      }

      // 属性的合并
      if (item.productId && item.attrs) {
        for (const key in item.attrs) {
          if (item.attrs[key]) {
            if (item.attrs[key] && item.attrs[key].dim) {
              // 销售属性
              if (!newSaleAttrs.includes(key)) {
                newSaleAttrs.push(key);
              }
            } else if (!newBaseAttrs.includes(key)) {
              newBaseAttrs.push(key);
            }
          }
        }
      }
    });
    setState({
      data: newData,
      currentData: getCurrentData(newData, count),
      attrs: Array.from(new Set([...newSaleAttrs, ...newBaseAttrs])),
    });
  }

  /**
   * 删除商品
   */
  function delProuducts(product) {
    const newData = [...data]?.filter((item) => item.productId !== product.productId);
    const newStorageData = (getStorage(`${userId}_attr_compare`) || []).filter(
      (item) => item.productId !== product.productId
    );
    while (newData.length < 4) {
      newData.push({});
    }
    initData(newData);
    setStorage(`${userId}_attr_compare`, newStorageData);
    if (product.productId === fixData[0]?.productId) {
      setState({
        fixData: [],
        num: 4,
      });
    }
  }

  /**
   * 向过滤队列添加一个过滤对象
   * @param {Number} dim - 当前维度
   * @param {Object} idsObj - saleAttrList 对象
   */
  function addDimFilter(dim, idsObj, productIndex) {
    const { skuIds } = idsObj;
    if (skuIds.length === 1) {
      return skuIds[0];
    } else {
      const newData = [...data];
      newData[productIndex].filterStack = [
        {
          dim,
          ...idsObj,
        },
      ];
      initData(newData);
    }
  }

  /**
   * 更换sku
   */
  function changeProductsku(params) {
    const { dim, sourceFrom, current, productIndex, skuId, currentProductId } = params;
    if (current.active) {
      return false; // 点击当前sku直接return
    }
    if (!skuId) {
      const id = addDimFilter(dim, current, productIndex);
      if (id) {
        getProductData({ sourceFrom, skuId: id, productIndex, currentProductId });
      }
      return false;
    }
    if (data.find((p, i) => p.productId && p.productId === skuId && i !== productIndex)) {
      Swal(intl.get('mallf.productsCompare.view.addFailed').d('对比栏已存在该商品，加入失败!'));
      return false;
    }
    getProductData({ sourceFrom, skuId, productIndex, currentProductId });
  }

  /**
   * 请求sku 与详情数据
   */
  function getProductData({ sourceFrom, skuId, productIndex, currentProductId }) {
    const newAddress = isEmpty(defaultAddress) ? getCacheAddress() : defaultAddress;
    const countyCode = newAddress?.regionCodeList?.[2]; // 查询电商需要三级code 初实化页面时拿不到 所以在这拿
    setState({ loading: true });
    Promise.all([
      getProductSku({ sourceFrom, productId: skuId, regionId }),
      getProductDetail({ sourceFrom, productId: skuId, regionId, countyCode, levelPath }),
    ])
      .then((result) => {
        const similar = (result[0] || []).map((p) => ({
          dim: p.dim,
          saleName: p.saleName,
          saleAttrList: p.saleAttr,
        })); // sku
        const detailData = result[1] || {}; // 商品信息
        if (Object.keys(detailData).length === 0) {
          Swal(intl.get('mallf.productsCompare.view.product.notExit').d('商品不存在'));
          return false;
        }
        const newData = [...data];
        const newStorageData = getStorage(`${userId}_attr_compare`) || [];
        newData[productIndex] = {
          currencySymbol: detailData.currencySymbol,
          sourceFrom: detailData.sourceFrom,
          price: detailData.agreementPrice,
          imagePath: detailData?.productImageList[0]?.imagePath,
          productId: detailData.productId,
          productNum: detailData.skuCode,
          productName: detailData.skuName,
          similarData: similar,
          productSkuAttrDTOS: detailData.productSkuAttrDTOS,
          filterStack: similar.map((dimObj) => {
            const { dim, saleAttrList } = dimObj;
            const selected = saleAttrList.find(
              (idsObj) => idsObj.skuIds && idsObj.skuIds.includes(detailData.productId)
            );
            return {
              dim, // 过滤的诶度 id
              ...selected, // 选中维度值的属性
            };
          }),
        };
        newStorageData[productIndex] = newData[productIndex];
        setStorage(`${userId}_attr_compare`, newStorageData);
        initData(newData);
        if (fixData?.[0]?.productId === currentProductId) {
          setState({
            fixData: [{ ...newData[productIndex] }],
          });
        }
      })
      .catch((err) => {
        Swal(err.message);
      })
      .finally(() => {
        setState({ loading: false });
      });
  }

  /**
   * 从过滤队列中获取交集的 id 列表
   * @param {Number} dim - 当前维度
   * @param {Object} idsObj - saleAttrList 对象
   * @param {Array} filterStack - 当前的过滤队列
   */
  function getProductIds(dim, idsObj, filterStack) {
    const otherSkuIds = filterStack
      .filter((dimObj) => dimObj.dim !== dim)
      .map((dimObj) => dimObj.skuIds);
    const ret = otherSkuIds.reduce(
      (prev, curr) => prev.filter((i) => curr && curr.includes(i)),
      idsObj.skuIds
    );
    return ret;
  }

  const dingzhu = (p) => {
    if (p.productId === fixData[0]?.productId) {
      setState({
        fixData: [],
        num: 4,
      });
    } else {
      setState({
        fixData: [{ ...p, selected: true }],
        num: 3,
      });
    }

    // 盯住选中
    handleSelectChange(true, p);
  };

  // 固定的默认勾选，且不可取消
  const filterFixData = data.filter((f) => f.productId && f.productId !== fixData?.[0]?.productId);

  // 其他的全选
  const checked = filterFixData.every((e) => e.selected);
  // 其他的不为全选则部分选中
  const indeterminate = !checked;
  // 除固定外没有选择则不可生成比价单
  const btnDisabled = filterFixData.filter((f) => f.selected).length === 0;
  const printBtnDisabled = filterFixData.filter((f) => f.selected).length > 20;

  const handleSelectChange = (selected, item) => {
    let newData = data;
    if (item === 'all') {
      newData = data.map((m) => ({ ...m, selected }));
    } else {
      newData = data.map((m) => (m.productId === item.productId ? { ...item, selected } : m));
    }
    setState({ data: newData, currentData: getCurrentData(newData, count) });
  };

  // const handleViewCompare = () => {
  //   const {
  //     location: { pathname, search },
  //   } = props;
  //   const selects = filterFixData.filter(f => f.selected);
  //   const viewList = [...fixData, ...selects];
  //   setStorage(`${userId}_view_compare`, viewList);
  //   const _search = filterNullGetUrl('', { addressId, regionId });
  //   props.history.push({
  //     pathname: '/price-compare',
  //     search: _search,
  //     state: {
  //       breadcrumbs: [
  //         ...breadcrumbs,
  //         {
  //           backPath: `${pathname}${search}`,
  //           text: intl.get('mallf.productsCompare.view.childTitle').d('商品对比'),
  //         },
  //       ],
  //     },
  //   });
  // };

  const renderProductFirst = () => {
    return (
      <tr
        id="price-compare-first"
        style={{
          position: 'absolute',
          zIndex: -1,
          background: '#fff',
          width: 90,
          boxShadow: 'rgba(26, 26, 26, 0.1) 0px 1px 4px',
        }}
      >
        <td style={{ paddingRight: 20, background: '#fafafa' }}>
          <div style={{ width: 130 }} className="col-top-color">
            {page > 1 && (
              <>
                {' '}
                <span
                  id="price-compare-btn-left1"
                  style={
                    count === 1
                      ? {
                          cursor: 'not-allowed',
                          top: 45,
                          color: '#BEBEBE',
                          left: fixData.length === 0 ? 153 : 412,
                        }
                      : {
                          top: 45,
                          // background: '#999999',
                          left: fixData.length === 0 ? 153 : 412,
                        }
                  }
                  className="left btn"
                  onClick={() => changeData('left')}
                >
                  <Icons type="left" size="22" />
                </span>
                <span
                  id="price-compare-btn-right1"
                  style={
                    count + num - 1 >=
                    (fixData?.[0] ? data.filter((p) => p.productId !== fixData[0].productId) : data)
                      .length
                      ? { cursor: 'not-allowed', top: 45, color: '#BEBEBE' }
                      : { top: 45 }
                  }
                  className="right btn"
                  onClick={() => changeData('right')}
                >
                  <Icons type="right" size="22" />
                </span>
              </>
            )}
            <p style={{ marginBottom: 16, textAlign: 'right' }}>
              <Checkbox
                checked={hideSame}
                onChange={(e) => setState({ hideSame: e.target.checked })}
              >
                <OverflowTip
                  style={{
                    display: 'inline-block',
                    maxWidth: 90,
                    position: 'relative',
                    top: '5px',
                  }}
                >
                  {intl.get('mallf.productsCompare.model.btn.hideSame').d('隐藏相同项')}
                </OverflowTip>
              </Checkbox>
            </p>
            <p style={{ marginBottom: 16, textAlign: 'right' }}>
              <Checkbox
                checked={showDiff}
                onChange={(e) => setState({ showDiff: e.target.checked })}
              >
                <OverflowTip
                  style={{
                    display: 'inline-block',
                    maxWidth: 90,
                    position: 'relative',
                    top: '5px',
                  }}
                >
                  {intl.get('mallf.productsCompare.model.btn.showDiff').d('高亮不同项')}
                </OverflowTip>
              </Checkbox>
            </p>
          </div>
        </td>
        {(() => {
          while (currentData.length < 4) {
            currentData.push({});
          }
          return currentData.map((item, index) => {
            const isFixed = item.productId === fixData[0]?.productId;
            return (
              <td
                style={
                  index === 2
                    ? { width: 259, padding: 0, borderRight: 'none' }
                    : { width: 259, padding: 0, borderRight: 'none' }
                }
              >
                {item.productId ? (
                  <div
                    className="product-box"
                    style={{ height: 155, padding: '25px 35px 30px 35px' }}
                  >
                    <Checkbox
                      style={{ position: 'relative', top: 22 }}
                      checked={isFixed ? true : item.selected}
                      onChange={
                        isFixed ? (e) => e : (e) => handleSelectChange(e.target.checked, item)
                      }
                    />
                    <Link
                      to={`/product-detail?productId=${item.productId}&sourceFrom=${item.sourceFrom}`}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          color: '#333333',
                          lineHeight: '24px',
                          height: 48,
                          overflow: 'hidden',
                          width: 178,
                          textIndent: 20,
                        }}
                        title={item.productName}
                      >
                        {item.productName}
                      </div>
                    </Link>
                    <div>
                      <div style={{ fontSize: 18, color: '#D0521E' }}>
                        {item.priceMeaning || item.price}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <div
                          className={`dingzhu ${isFixed ? 'active' : ''}`}
                          onClick={isFixed ? (e) => e : () => dingzhu(item)}
                        >
                          <Icons type="icon_pinning" size={12} style={{ marginRight: 5 }} />
                          {isFixed
                            ? intl.get('mallf.productsCompare.view.have.peg').d('已钉住')
                            : intl.get('mallf.productsCompare.view.peg.left').d('钉在左侧')}
                        </div>
                        <a
                          className="del-opt"
                          onClick={() => delProuducts(item)}
                          style={{ display: isFixed ? 'none' : 'inline', float: 'right' }}
                        >
                          <Icon type="delete" size={14} />
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ marginTop: '-36px', textAlign: 'center' }}>
                      {intl.get('mallf.productsCompare.view.noProduct').d('暂无商品')}
                    </div>
                  </div>
                )}
              </td>
            );
          });
        })()}
      </tr>
    );
  };

  const renderProduct = () => {
    return (
      <tr id="price-compare-second" className="product-row">
        <td className="col-title">
          <div className="col-title-btns col-top-color">
            <p style={{ marginBottom: 16 }}>
              <Checkbox
                checked={hideSame}
                onChange={(e) => setState({ hideSame: e.target.checked })}
              >
                <OverflowTip
                  style={{
                    display: 'inline-block',
                    maxWidth: 90,
                    position: 'relative',
                    top: '5px',
                  }}
                >
                  {intl.get('mallf.productsCompare.model.btn.hideSame').d('隐藏相同项')}
                </OverflowTip>
              </Checkbox>
            </p>
            <p style={{ marginBottom: 16 }}>
              <Checkbox
                checked={showDiff}
                onChange={(e) => setState({ showDiff: e.target.checked })}
              >
                <OverflowTip
                  style={{
                    display: 'inline-block',
                    maxWidth: 90,
                    position: 'relative',
                    top: '5px',
                  }}
                >
                  {intl.get('mallf.productsCompare.model.btn.showDiff').d('高亮不同项')}
                </OverflowTip>
              </Checkbox>
            </p>
          </div>
        </td>
        {(() => {
          while (currentData.length < 4) {
            currentData.push({});
          }
          return currentData.map((item, index) => {
            const isFixed = item.productId === fixData[0]?.productId;
            const linkProps = {
              to: `/product-detail?productId=${item.productId}&sourceFrom=${item.sourceFrom}`,
            };
            return (
              <td className="col-item">
                {item.productId ? (
                  <div className="col-product col-data product-box">
                    <div className="product-top-opts">
                      <Checkbox
                        checked={isFixed ? true : item.selected}
                        onChange={
                          isFixed ? (e) => e : (e) => handleSelectChange(e.target.checked, item)
                        }
                      />
                      {!isFixed && (
                        <Button
                          onClick={() => delProuducts(item)}
                          color="primary"
                          funcType="link"
                          style={{ marginLeft: 10 }}
                        >
                          {intl.get('hzero.common.btn.delete').d('删除')}
                        </Button>
                      )}
                      {isFixed ? (
                        <Button color="primary" funcType="link" className="dingzhu">
                          <Icons type="icon_pinning" size={12} style={{ marginRight: 5 }} />
                          {intl.get('mallf.productsCompare.view.have.peg').d('已钉住')}
                        </Button>
                      ) : (
                        <Button color="primary" funcType="link" onClick={() => dingzhu(item)}>
                          {intl.get('mallf.productsCompare.view.peg.left').d('钉在左侧')}
                        </Button>
                      )}
                      {/* <a
                        className="del-opt"
                        onClick={() => delProuducts(item)}
                        style={{ display: isFixed ? 'none' : 'inline' }}
                      >
                        <Icon type="delete" size={14} />
                      </a> */}
                    </div>
                    <div className="product-info-box">
                      <Link {...linkProps}>
                        <Image value={item.imagePath} width={70} height={70} />
                      </Link>
                      <div className="product-price-name-box">
                        <div className="product-price text-overflow">
                          <span className="currencySymbol">{item?.currencySymbol}</span>
                          <SpanTitle>{item.priceMeaning || item.price}</SpanTitle>
                        </div>
                        <Link {...linkProps} className="product-name">
                          {item.productName}
                        </Link>
                      </div>
                      {/* <div
                        className={`dingzhu ${isFixed ? 'active' : ''}`}
                        onClick={isFixed ? e => e : () => dingzhu(item)}
                      >
                        <Icons type="icon_pinning" size={12} style={{ marginRight: 5 }} />
                        {isFixed
                          ? intl.get('mallf.productsCompare.view.have.peg').d('已钉住')
                          : intl.get('mallf.productsCompare.view.peg.left').d('钉在左侧')}
                      </div> */}
                    </div>
                  </div>
                ) : (
                  <div className="col-product">
                    <div className="no-picture">
                      <div className="no-message">{index + 1}</div>
                    </div>
                    <div style={{ marginTop: '18px', textAlign: 'center' }}>
                      {intl.get('mallf.productsCompare.view.noProduct').d('暂无商品')}
                    </div>
                  </div>
                )}
              </td>
            );
          });
        })()}
      </tr>
    );
  };

  const renderRow = (item) => {
    const sameArr = [];
    data.forEach((product) => {
      if (product.productId && product.attrs) {
        if (product.attrs[item] && product.attrs[item].saleAttrList) {
          const saleAttr1 = product.attrs[item].saleAttrList.find((sale) => sale.active) || {};
          const saleAttr2 =
            data[0].attrs && data[0].attrs[item] && data[0].attrs[item].saleAttrList
              ? data[0].attrs[item].saleAttrList.find((sale) => sale.active) || {}
              : { saleValue: data[0].attrs[item] };
          sameArr.push(saleAttr1.saleValue === saleAttr2.saleValue);
        } else {
          sameArr.push(product.attrs[item] === data[0].attrs[item]);
        }
      }
    });

    if (hideSame && sameArr.every((isSame) => isSame)) {
      return null;
    } else {
      const isDiff = !sameArr.every((isSame) => isSame) && showDiff;
      // const flag = currentData.every(
      //   product =>
      //     product.productId &&
      //     !(product.attrs && product.attrs[item] && !product.attrs[item].dim) &&
      //     !(product.attrs && product.attrs[item] && product.attrs[item].dim)
      // );
      return (
        <tr className={`attr-row ${isDiff ? 'active' : ''}`}>
          <td className="col-title">{item}</td>
          {currentData.map((product) => {
            let productIndex;
            data.find((p, index) => {
              if (product.productId === p.productId) {
                productIndex = index;
              }
              return product.productId === p.productId;
            });
            if (product.productId) {
              if (product.attrs && product.attrs[item] && !product.attrs[item].dim) {
                return <td className="col-item">{product.attrs[item]}</td>;
              } else if (product?.attrs?.[item]?.saleAttrList?.length === 1) {
                return (
                  <td className="col-item">
                    {product?.attrs?.[item]?.saleAttrList?.[0]?.saleValue}
                  </td>
                );
              } else if (product.attrs && product.attrs[item] && product.attrs[item].dim) {
                const { saleAttrList = [] } = product.attrs[item];
                return (
                  <td className="col-item col-item-saleattr">
                    <ul>
                      {saleAttrList.map((saleAttr) => {
                        const skuId =
                          getProductIds(product.attrs[item].dim, saleAttr, product.filterStack) ||
                          [];
                        return (
                          <li
                            className={`${saleAttr.active ? 'active' : ''} ${
                              skuId[0] ? '' : 'active-none'
                            }`}
                            onClick={() => {
                              changeProductsku({
                                currentProductId: product.productId,
                                skuId: skuId[0],
                                productIndex,
                                dim: product.attrs[item].dim,
                                sourceFrom: product.sourceFrom,
                                allAttrs: product.attrs,
                                current: saleAttr,
                              });
                            }}
                          >
                            {saleAttr.imagePath && (
                              <Image
                                style={{ marginRight: 8 }}
                                value={saleAttr.imagePath}
                                width={30}
                                height={30}
                              />
                            )}
                            {saleAttr.saleValue}
                          </li>
                        );
                      })}
                    </ul>
                  </td>
                );
              } else {
                return <td className="col-item">-</td>;
              }
            } else {
              // return <td className="col-item-none" />;
              return <td className="col-item" />;
            }
          })}
        </tr>
      );
    }
  };

  function getCurrentData(arr, b) {
    const newArr = fixData?.[0] ? arr.filter((p) => p.productId !== fixData[0].productId) : arr;
    const newFixData = arr.find((n) => n.productId === fixData[0].productId) || {};
    let newList = [];
    newList = newArr.slice(b - 1, b + num - 1);
    if (newArr.length >= num && newList.length < num) {
      newList = newArr.slice(b - 2, b + num - 2);
    }
    return [newFixData, ...newList];
  }

  const changeData = (change) => {
    const newArr = fixData?.[0] ? data.filter((p) => p.productId !== fixData[0].productId) : data;
    const b =
      change === 'left'
        ? count > 1
          ? count - 1
          : 1
        : count + num - 1 >= newArr.length
        ? count
        : count + 1;
    setState({
      count: b,
      currentData: getCurrentData(data, b),
    });
  };

  function openPreviewList() {
    const modal = Modal.open({
      title: intl.get('mallf.productsCompare.modal.title.comparePreview').d('比价单预览'),
      drawer: true,
      style: { width: 1090 },
      children: (
        <ProductList
          primaryProduct={fixData?.[0]}
          data={data.filter((p) => p.selected)}
          onCompare={(dataSet) => {
            const cacheAddress = getCacheAddress();
            const newAddress = isEmpty(defaultAddress) ? cacheAddress : defaultAddress;
            dataSet.setState('addPriceLoading', true);
            setState({ addPriceLoading: true });
            handlePriceCompare({
              list: dataSet?.toData(),
              primaryProduct: fixData?.[0],
              dimensTemplates,
              currentAddress: newAddress,
              addressRef,
            });
            modal.close();
            setTimeout(() => {
              dataSet.setState('addPriceLoading', false);
              setState({ addPriceLoading: false });
            }, 1000);
          }}
        />
      ),
    });
  }

  const validCompareMsg = validCompareLimit(
    uniqBy([...data.filter((p) => p.selected && p.productId), fixData?.[0]], 'productId')
  );

  return (
    <Spin spinning={loading || addPriceLoading}>
      <div className="Hmall-container">
        <div style={{ display: 'flex' }}>
          <Breadcrumb
            className="body-bg-color"
            style={{
              padding: '15px 0',
              fontSize: '14px',
              lineHeight: '24px',
              width: 400,
            }}
          >
            <Breadcrumb.Item href="/" style={{ color: '#212121' }}>
              {intl.get('mallf.common.view.homePage').d('首页')}
            </Breadcrumb.Item>
            {breadcrumbs.map((m) => (
              <Breadcrumb.Item style={{ color: '#212121' }}>{m.text}</Breadcrumb.Item>
            ))}
            <Breadcrumb.Item style={{ color: '#595959' }}>
              {intl.get('mallf.productsCompare.view.childTitle').d('商品对比')}
            </Breadcrumb.Item>
          </Breadcrumb>
          <div
            style={{
              padding: '15px 0',
              fontSize: '14px',
              lineHeight: '24px',
              flex: 1,
              display: 'flex',
              flexDirection: 'row-reverse',
              background: '#f8f8f8',
            }}
          >
            <ShowManuallyCompare
              tooltip={validCompareMsg}
              style={{ display: 'block' }}
              iconStyle={{ alignSelf: 'center', position: 'relative', left: '-12px' }}
            >
              <Button
                onClick={async () => {
                  const cacheAddress = getCacheAddress();
                  const newAddress = isEmpty(defaultAddress) ? cacheAddress : defaultAddress;
                  setState({ addPriceLoading: true });
                  handlePriceCompare({
                    list: uniqBy(
                      [...data.filter((p) => p.selected && p.productId), fixData?.[0]],
                      'productId'
                    ),
                    primaryProduct: fixData?.[0],
                    dimensTemplates,
                    currentAddress: newAddress,
                    addressRef,
                  });
                  setTimeout(() => {
                    setState({ addPriceLoading: false });
                  }, 1000);
                }}
                disabled={btnDisabled || validCompareMsg}
                color="primary"
                icon="poll"
                funcType="flat"
              >
                {intl.get('mallf.productsCompare.model.btn.createCompare').d('生成比价单')}
              </Button>
            </ShowManuallyCompare>

            <Button
              disabled={btnDisabled}
              style={{ marginRight: 10 }}
              color="primary"
              icon="preview"
              funcType="flat"
              onClick={() => openPreviewList()}
            >
              {intl.get('hzero.common.button.preview').d('预览')}
            </Button>
            <Tooltip
              title={
                printBtnDisabled
                  ? intl
                      .get('mallf.productsCompare.view.btn.printTip')
                      .d('若要打印比价单，最多只能有21个商品参与比价')
                  : null
              }
            >
              <Button
                disabled={btnDisabled || printBtnDisabled}
                style={{ marginRight: 10 }}
                color="primary"
                icon="print"
                funcType="flat"
                onClick={() =>
                  openPrint({
                    data: uniqBy(
                      [...data.filter((p) => p.selected && p.productId), fixData?.[0]],
                      'productId'
                    ),
                  })
                }
              >
                {intl.get('mallf.myOrder.botton.print').d('打印')}
              </Button>
            </Tooltip>
            <a
              onClick={() => {
                handleSelectChange(!checked, 'all');
              }}
              style={{ lineHeight: '32px', color: getPrimaryColor(), marginRight: 25 }}
            >
              <Checkbox
                style={{ marginRight: 10 }}
                checked={checked}
                indeterminate={indeterminate}
              />
              {intl.get('hzero.common.button.selectAll').d('全选')}
            </a>
          </div>
        </div>
        <div className={styles['products-compare-list']}>
          {page > 1 && (
            <>
              {' '}
              <span
                id="price-compare-btn-left"
                style={
                  count === 1
                    ? {
                        cursor: 'not-allowed',
                        color: '#BEBEBE',
                        left: fixData.length === 0 ? 153 : 412,
                      }
                    : { left: fixData.length === 0 ? 153 : 412 }
                }
                className="left btn"
                onClick={() => changeData('left')}
              >
                <Icons type="left" size="22" />
              </span>
              <span
                id="price-compare-btn-right"
                style={
                  count + num - 1 >=
                  (fixData?.[0] ? data.filter((p) => p.productId !== fixData[0].productId) : data)
                    .length
                    ? { cursor: 'not-allowed', color: '#BEBEBE' }
                    : {}
                }
                className="right btn"
                onClick={() => changeData('right')}
              >
                <Icons type="right" size="22" />
              </span>
            </>
          )}
          <table>
            {renderProductFirst()}
            {renderProduct()}
            {attrs.map((item) => renderRow(item))}
          </table>
          <AddressLov
            mode="button"
            className="address-lov"
            clearButton={false}
            hidden
            onRef={(ref) => {
              addressRef.current = ref;
            }}
            lovPara={{ companyId, userId }}
          />
        </div>
      </div>
    </Spin>
  );
}

export default formatterCollections({
  code: ['mallf.productsCompare', 'mallf.myOrder', 'mallf.productDetail', 'mallf.productAccept'],
})(ProductsCompare);
