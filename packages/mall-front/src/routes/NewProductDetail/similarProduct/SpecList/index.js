/**
 * 规格参数展示
 * @date: 2021-11-03
 * @author: YP <peng.yang05@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */
import React, { useMemo, useEffect, useRef } from 'react';
import { isEmpty } from 'lodash';
import { Form, Table, DataSet, Select, Button } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import intl from 'utils/intl';
import useSetState from '@/hooks/useState';
import { observer } from 'mobx-react-lite';
import { filterNullValueObject, getUserConfigInfo, getBigNumber, getPrecision } from 'utils/utils';
import { queryStock, checkSaleBySagm } from 'services/homeService';
import { newBatchCreateService } from 'services/newCartService';
import { precisionEditor } from 'utils/precision';
import { openNotLowestTipsModal } from 'utils/modals';

const { Option } = Select;

function SpecList(props) {
  const {
    similarList,
    similarData,
    currentAddress,
    sourceFrom,
    productData,
    dimensTemplates,
  } = props;
  const addressInfo = {
    address: currentAddress.addressName,
    cityId: currentAddress?.regionCodeList?.[1],
    countyId: currentAddress?.regionCodeList?.[2],
    provinceId: currentAddress?.regionCodeList?.[0],
  };
  const quantityList = useRef(new Map()); // 记录每个sku的数量
  const inView = useMemo(() => {
    const ele = document.getElementById('product-detail-speclist');
    if (!ele) return false;
    const rect = ele?.getBoundingClientRect?.() || {};
    return rect.top < 200 && rect.bottom > window.innerHeight;
  });
  const {
    organizationId,
    companyId,
    levelPath,
    regionId,
    skuCheckFlag,
    purchaseOrgId,
    invoiceOrgId,
    ouId,
    unitId,
    userId,
    unitName,
  } = getUserConfigInfo();

  const data = useMemo(() => {
    return similarList.map((similar) => {
      const obj = { ...similar };
      if (similar.saleAttrList) {
        similar.saleAttrList.forEach((attr) => {
          obj[attr.saleName] = attr.saleValue || attr.description;
        });
      }
      return obj;
    });
  }, [similarList]);

  /**
   * 查询库存与价格
   */
  const fetchProductStock = async () => {
    if (isEmpty(data) || !currentAddress.addressId) return;
    const res = await Promise.all([
      checkSaleBySagm({
        regionId,
        companyId,
        skuParamDTOS: data.map((m) => ({
          quantity: 1,
          skuId: m.skuId,
          sourceFrom,
        })),
        ecProductCheckDto: {
          tenantId: organizationId,
          ...addressInfo,
        },
        queryEcPriceFlag: true,
        unitLevelPath: levelPath,
      }),
      queryStock({
        batchSkuIds: data.map((g) => ({
          skuId: sourceFrom === 'CATA' ? g.skuCode : g.thirdSkuCode,
          supplierCode: sourceFrom,
          categoryId: productData.categoryId,
        })),
        tenantId: organizationId,
        ...addressInfo,
      }),
    ]);
    const [priceList, stockList] = res;
    const getStock = ({ stockState, skuStock }) => {
      const offCataStock = sourceFrom === 'CATA' && !skuCheckFlag; // 目录化商品关闭了库存校验
      const inStock = (stockState === 1 && skuStock !== 0) || offCataStock; // mallf.common.model.inStock 有货
      const noStock = stockState === 5 || (stockState === 1 && skuStock === 0);
      const subStock = [2, 3, 4, 6].includes(stockState); // intl.get(`mallf.productList.model.nowsubscribe`).d('立即预订')
      return { inStock, noStock, subStock };
    };
    const newList = data.map((p1) => {
      let product = { ...p1 };
      // 处理价格
      priceList.forEach((p2) => {
        if (p1.skuId === p2.skuId) {
          product = {
            ...product,
            ...p2,
          };
        }
      });
      // 电商取thirdSkuCode
      (stockList.result || []).forEach((p2) => {
        const { inStock, noStock, subStock } = getStock({
          stockState: p2.stockState,
          skuStock: p2.skuStock,
        });
        if ((sourceFrom === 'CATA' ? p1.skuCode : p1.thirdSkuCode) === p2.skuId) {
          product = {
            ...product,
            skuStock: p2.skuStock,
            stockState: p2.stockState,
            inStock,
            noStock,
            subStock,
          };
        }
      });
      return product;
    });
    tableDs.loadData(newList);
    setState({
      initData: newList,
    });
  };

  useEffect(() => {
    fetchProductStock();
  }, [data]);

  const attrList = similarData.map((similar) => {
    return {
      ...similar,
      name: similar.saleName,
      label: similar.saleName,
    };
  });

  const [state, setState] = useSetState({
    needShowMore: data.length > 5,
    initData: data, // 记录初始数据
  });

  const formDs = useMemo(() => {
    return new DataSet({
      fields: attrList,
    });
  }, []);

  const tableDs = useMemo(() => {
    return new DataSet({
      selection: false,
      paging: false,
      data,
      fields: [
        {
          name: 'skuName',
          label: intl.get('mallf.common.view.produc').d('商品'),
        },
        ...attrList,
        {
          name: 'sellPrice',
          label: intl.get(`mallf.common.model.unitPrice`).d('单价(含税)'),
        },
        {
          name: 'stock',
          label: intl.get('mallf.common.model.stock').d('库存'),
        },
        {
          name: 'quantity',
          label: intl.get('mallf.common.view.productNum.order').d('数量'),
        },
      ],
    });
  }, []);

  const TotalInfo = observer(({ dataSet }) => {
    let totalCount = 0;
    let totalPrice = 0;
    dataSet.toData().forEach((product) => {
      if (product.quantity) {
        totalCount = getBigNumber(totalCount).plus(product.quantity);
        totalPrice = isNaN(+product.sellPrice)
          ? NaN
          : getBigNumber(totalPrice).plus(getBigNumber(product.sellPrice).times(product.quantity));
      }
    });

    return (
      <>
        <span
          className="primary-color-b"
          style={{ float: 'right', lineHeight: '32px', marginRight: 20 }}
        >
          {intl
            .getHTML(`mallf.common.common.totalElement`, {
              value: totalCount,
            })
            .d(
              <span>
                共<b>{totalCount}</b>件商品
              </span>
            )}
        </span>
      </>
    );
  });

  const tableColumns = useMemo(() => {
    return [
      {
        name: 'skuName',
        width: 320,
      },
      ...attrList,
      {
        name: 'sellPrice',
        width: 100,
        align: 'right',
        renderer: ({ record }) => {
          return (
            <span className="price-color">
              {record.get('currencySymbol')}
              {record.get('sellPrice')}
            </span>
          );
        },
      },
      {
        name: 'stock',
        renderer: ({ record }) => {
          if (record.get('inStock')) {
            return <span>{intl.get('mallf.common.model.inStock').d('有货')}</span>;
          }
          if (record.get('noStock')) {
            return <span>{intl.get('mallf.common.model.noStock').d('无货')}</span>;
          }
          if (record.get('subStock')) {
            return <span>{intl.get('mallf.common.model.subStock').d('预定')}</span>;
          }
        },
      },
      {
        name: 'quantity',
        width: 100,
        editor: (record) => {
          return precisionEditor({
            name: 'quantity',
            precision: record.get('uomPrecision') || 0,
            record,
            onChange: (value) => {
              quantityList.current.set(record.get('skuId'), value);
            },
            step: !record.get('uomPrecision') ? 1 : getPrecision(record.get('uomPrecision')),
            disabled: record.get('noStock'),
            min: record.get('minPurchaseQuantity') || 0,
          });
        },
      },
    ];
  }, []);

  const batchAddCart = () => {
    const productList = tableDs.toData().filter((product) => product.quantity);
    if (isEmpty(productList)) return;
    const newParams = productList.map((item) => {
      const { dimensionList, dimensionTemplate } = dimensTemplates;
      const { skuId, quantity, supplierCompanyId } = item;
      const { templateId } = dimensionTemplate;
      // 头固定列
      const headerDimension =
        dimensionList.filter((n) => n.dimension.dimensionType === 'HEADER_FIXED') || [];
      // 头固定列value值
      const _HEADER_FIXED = {
        invOrganizationId: invoiceOrgId,
        purOrganizationId: purchaseOrgId,
        ouId,
        companyId,
        levelPath,
        unitId,
        addressId: currentAddress.addressId,
      };
      // 头维度
      const headerList = headerDimension.map((n) => {
        return {
          ...n.dimension,
          headerNum: 1,
          tenantId: organizationId,
          value: _HEADER_FIXED[n.dimension.dimensionCode],
        };
      });
      // 行维度
      const cartLineList = dimensionList.filter((n) => n.dimension.dimensionCode === 'quantity');
      const param = {
        companyId,
        unitName,
        templateId,
        unitId,
        supplierCompanyId,
        productId: skuId,
        productSource: sourceFrom,
        tenantId: organizationId,
        ownerId: userId,
        cartHeaderDTOList: [
          {
            headerList,
            cartLineList: cartLineList.map((n) => {
              return {
                lineNum: 1,
                lineList: [
                  {
                    ...n.dimension,
                    tenantId: organizationId,
                    headerNum: 1,
                    lineNum: 1,
                    value: quantity,
                  },
                ],
              };
            }),
          },
        ],
      };
      return param;
    });
    setState({
      addLoading: true,
    });
    newBatchCreateService(newParams)
      .then((res) => {
        // 只要有一组数据含有lowestPriceRule就提示
        const lowestPriceRuleFlag = res.some((item) => {
          return item.lowestPriceRule;
        });
        if (lowestPriceRuleFlag) {
          openNotLowestTipsModal({
            res,
            onOk: () => {
              setState({
                addLoading: true,
              });
              const newParamsValue = newParams.map((item) => ({
                ...item,
                confirmFlag: 1,
              }));
              newBatchCreateService(newParamsValue).then((resp) => {
                if (resp) {
                  setState({
                    addLoading: false,
                  });
                  props.history.push('/cart');
                }
              });
            },
          });
        } else {
          props.history.push('/cart');
        }
      })
      .finally(() => {
        setState({
          addLoading: false,
        });
      });
  };

  return (
    <div style={{ padding: '4px 30px 20px 30px' }}>
      <Form dataSet={formDs} labelLayout="float" columns={5} style={{ marginBottom: 10 }}>
        {attrList.map((attr) => {
          return (
            <Select
              name={attr.name}
              onChange={() => {
                const filterValues = filterNullValueObject(formDs.current?.toData());
                delete filterValues.__dirty;
                let newSkuList = state.initData.filter((sku) => {
                  // 筛选的属性名
                  return Object.keys(filterValues).every(
                    (attrName) => sku[attrName] === filterValues[attrName]
                  );
                });
                newSkuList = newSkuList.map((p) => {
                  if (quantityList.current.has(p.skuId)) {
                    return { ...p, quantity: quantityList.current.get(p.skuId) };
                  } else {
                    return p;
                  }
                });
                tableDs.loadData(newSkuList);
              }}
            >
              {attr.saleAttrList.map((a) => {
                return <Option value={a.saleValue}>{a.saleValue}</Option>;
              })}
            </Select>
          );
        })}
      </Form>
      <div>
        <div
          id="product-detail-speclist"
          style={{
            height: state.needShowMore ? 235 : 'auto',
            overflow: 'hidden',
            marginBottom: 10,
          }}
        >
          <Table dataSet={tableDs} columns={tableColumns} />
        </div>
        <div
          style={
            inView
              ? { position: 'fixed', bottom: 0, width: 1128, background: '#fff' }
              : { height: 32 }
          }
        >
          {state.needShowMore ? (
            <Button
              color="primary"
              icon="expand_more"
              funcType="flat"
              onClick={() => setState({ needShowMore: false })}
            >
              {intl.get('mallf.common.button.expand').d('展开')}
            </Button>
          ) : (
            <Button
              color="primary"
              icon="expand_less"
              funcType="flat"
              onClick={() => setState({ needShowMore: true })}
            >
              {intl.get('mallf.common.button.pickUp').d('收起')}
            </Button>
          )}
          <Button
            waitType="throttle"
            wait={500}
            loading={state.addLoading}
            color="primary"
            style={{ float: 'right' }}
            onClick={() => batchAddCart()}
          >
            {intl.get('mallf.common.button.batch.addCart').d('批量加入购物车')}
          </Button>
          <TotalInfo dataSet={tableDs} />
        </div>
      </div>
    </div>
  );
}

export default withRouter(SpecList);
